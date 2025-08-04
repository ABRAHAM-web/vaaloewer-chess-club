// backend/index.js
import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3001;
import challengeRoutes from './routes/challenges.js';
app.use('/challenges', challengeRoutes);


// Route modules
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/players.js';
import gameRoutes from './routes/games.js';

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/auth', authRoutes);        // POST /auth/login, /auth/register
app.use('/players', playerRoutes);   // GET /players/standings, /player/:id
app.use('/games', gameRoutes);       // GET/POST /admin/games, /admin/players
app.use('/challenges', challengeRoutes); // Challenge endpoints

// Root health
app.get('/', (req, res) => res.send('Chess Club API running'));

// Server start
app.listen(PORT, () => console.log(`\u{1F680} Server running on http://localhost:${PORT}`));
