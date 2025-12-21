import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import errorHandler from './middlewares/general/error.js';
import setup from './database/SetupDB.js';

import configs from './configs/Configs.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const app = express();
const corsOptions = {
    origin: configs.server.domain ? [configs.server.domain] : true,
    credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
const PORT = configs.server.port


app.use('/auth', authRoutes);

app.use('/user', userRoutes);





app.use(errorHandler);
app.listen(PORT, async () => {
    await setup();
    console.log(`Server started on port ${PORT}`);
});