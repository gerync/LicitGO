// #region Package importok
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { coloredlog } from '@gerync/utils';
// #endregion

// #region Middleware importok
import cookieMiddleware from './middlewares/general/cookies.js';
import errorHandler from './middlewares/general/error.js';
import swaggerSpec from './routes/swagger.js';
// #endregion

// #region Adatbázis és útvonal importok
import setup from './database/SetupDB.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import auctionRoutes from './routes/auction.js';
import startupEmail from './email/startup.js';
import Configs from './configs/Configs.js';
// #endregion
// #region Árfolyam lekérés importálása
import FetchExchanges from './utilities/exchange/FetchExchange.js';
import finalizeAuctions from './utilities/FinalizeAuctions.js';
// #endregion 
// #region Szerver meghatározása
// és middleware-ek beállítása
const app = express();

// If the app runs behind a proxy (Cloudflare / nginx), enable trust proxy
// so that middleware like express-rate-limit can correctly read X-Forwarded-For.
if (Configs.environment.isProduction) {
    app.set('trust proxy', 1);
} else {
    // During development it's usually safe to trust the immediate proxy (if any)
    app.set('trust proxy', 0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// #region Biztonsági middleware-ek beállítása
/*app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

*/
// #endregion
// #region Általános middleware-ek beállítása

// Configure CORS to allow the client origins used in development and production.
const allowedOrigins = [
    'https://licitgo.com',
    'https://api.licitgo.com',
    'http://www.licitgo.com',
    'http://licitgo.com',
    'https://www.licitgo.com',
    'https://api.licitgo.com',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser(Configs.cookieSecret));
app.use(express.json());

// #region Statikus fájlok kiszolgálása
app.use('/media/cars', express.static(path.join(__dirname, '../media/cars')));
app.use('/media/users', express.static(path.join(__dirname, '../media/users')));
// #endregion

// Cookie kezelő middleware

app.use(cookieMiddleware);
// #endregion
// #region Swagger dokumentáció beállítása
// Disable caching for docs assets so browsers / proxies don't serve stale init files
app.use('/docs', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, {
    explorer: true,
    swaggerOptions: {
        // Load the spec dynamically from /docs.json so the UI picks up servers correctly
        url: '/docs.json',
        persistAuthorization: true,
        // Bizonyos kérésekhez cookie-k küldése
        requestInterceptor: (req) => {
            req.credentials = 'include';
            return req;
        },
    },
}));
app.get('/docs.json', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(200).json(swaggerSpec);
});
// #endregion
// #region API útvonalak beállítása
app.use('/auth', authRoutes);

app.use('/auction', auctionRoutes);

app.use('/user', userRoutes);




// #endregion
// #region Hibakezelő middleware beállítása és szerver bootolása
app.use(errorHandler);

app.use((req, res) => {
    return res.status(404).json({
        message: Configs.server.defaultLanguage === 'HU' ? 'Az erőforrás nem található.' : 'Resource not found.'
    });
});

const PORT = Configs.server.port
app.listen(PORT, async () => {
    await setup();
    await startupEmail();
    let now = new Date();
    now = now.toLocaleString(Configs.server.time.locale, { timeZone: Configs.server.time.timeZone });
    if (Configs.server.defaultLanguage === 'HU') {
        coloredlog(`Szerver elérhető a következő címen:`, '#008500ff');
    } else {
        coloredlog(`Server available at:`, '#008500ff');
    }
    coloredlog([`${now} --  `, `${Configs.server.domain()}`], [ '#ff00ffff', '#00b3aaff' ]);
    await FetchExchanges();
});
// #endregion
/* 
#region Napi árfolyam frissítés ütemezése
minden nap 3:30-kor (statisztikailag ekkor a legkevesebb
az internetes forgalom)
*/
cron.schedule('30 3 * * *', async () => {
    await FetchExchanges();
});
// #endregion

/*
#region Aukciók lezárása és nyertesek kiválasztása
Minden percben ellenőrzi a lejárt aukciókat
*/
cron.schedule('* * * * *', async () => {
    await finalizeAuctions();
});
// #endregion