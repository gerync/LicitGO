// #region Package importok
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import { coloredlog } from '@gerync/utils';
// #endregion

// #region Middleware importok
import cookieMiddleware from './middlewares/general/cookies.js';
import errorHandler from './middlewares/general/error.js';
import swaggerSpec from './routes/swagger.js';
// #endregion

// #region Adatbázis és útvonal importok
import setup from './database/SetupDB.js';

import configs from './configs/Configs.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import auctionRoutes from './routes/auction.js';

import startupEmail from './email/startup.js';
import Configs from './configs/Configs.js';
// #endregion
// #region Árfolyam lekérés importálása
import FetchExchanges from './utilities/exchange/FetchExchange.js';
// #endregion 
// #region Szerver meghatározása
// és middleware-ek beállítása
const app = express();
const corsOptions = {
    origin: [configs.server.domain()],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());



app.use(cookieMiddleware);
// #endregion
// #region Swagger dokumentáció beállítása
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        // Bizonyos kérésekhez cookie-k küldése
        requestInterceptor: (req) => {
            req.credentials = 'include';
            return req;
        },
    },
}));
app.get('/docs.json', (req, res) => res.status(200).json(swaggerSpec));
// #endregion
// #region API útvonalak beállítása
app.use('/auth', authRoutes);

app.use('/auction', auctionRoutes);

app.use('/user', userRoutes);




// #endregion
// #region Hibakezelő middleware beállítása és szerver bootolása
app.use(errorHandler);
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