import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import rootRoutes from './routes/root.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.NODE_ENV);

app.use(cors());
app.use(express.json());

// Mendapatkan __dirname dalam ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/', express.static(path.join(__dirname, 'public'))); // Memberitahu server bahwa file public ada di folder public

// Routes
app.use('/', rootRoutes);

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
