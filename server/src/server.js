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

import Email from './email/send.js';

// #endregion
// #region Szerver inicializálása és middleware-ek beállítása
const app = express();
const corsOptions = {
    origin: configs.server.domain ? [configs.server.domain] : true,
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
    await Email();
    console.log(`Server started on port ${PORT}`);
});
// #endregion