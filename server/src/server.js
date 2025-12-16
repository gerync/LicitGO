import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler, LogError } from './Middlewares/general/Error.js';
import logger from './Middlewares/Logger.js';
import setup from './Database/setupDB.js';

import configs from './configs/Configs.js';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(logger);
const PORT = configs.server.port


app.use('/', authRoutes);

app.listen(PORT, async () => {
    await setup();
    console.log(`Server started on port ${PORT}`);
});