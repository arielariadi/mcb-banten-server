import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logEvents, logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandle.js';
import cookieParser from 'cookie-parser';
import corsOptions from './config/corsOptions.js';
import connectDB from './config/dbConn.js';
import mongoose from 'mongoose';
import createAdminAccount from './seeders/adminSeed.js';

import rootRoute from './routes/root.js';
import authRoute from './routes/auth.js';
// import userRoute from './routes/user.js';
import adminRoute from './routes/admin.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Mendapatkan __dirname dalam ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/', express.static(path.join(__dirname, 'public'))); // Memberitahu server bahwa file public ada di folder public

createAdminAccount();

// Routes
app.use('/', rootRoute);
app.use('/v1/auth', authRoute);

// app.use('/v1/user', userRoute);
app.use('/v1/admin', adminRoute);

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log',
  );
});
