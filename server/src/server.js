// #region Package importok
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// #endregion

// #region Middleware importok
import cookieMiddleware from './middlewares/general/cookies.js';
import errorHandler from './middlewares/general/error.js';
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
// #region Szerver inicializálása és middleware-ek beállítása
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

// #region API útvonalak beállítása
app.use('/auth', authRoutes);

app.use('/auction', auctionRoutes);

app.use('/user', userRoutes);




// #endregion
// #region Hibakezelő middleware beállítása és szerver indítása
app.use(errorHandler);
const PORT = configs.server.port
app.listen(PORT, async () => {
    await setup();
    await startupEmail();
    if (configs.server.defaultLanguage.toUpperCase() === 'HU') {
        console.log(`Szerver elérhető ${Configs.server.domain()} a ${PORT} porton`);
    } else {
        console.log(`Server is running at ${Configs.server.domain()} on port ${PORT}`);
    }
});
// #endregion