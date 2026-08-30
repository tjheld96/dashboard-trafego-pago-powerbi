import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { authRouter } from './routes/auth';
import { characterRouter } from './routes/character';
import { huntsRouter } from './routes/hunts';
import { leaderboardRouter } from './routes/leaderboard';
import { createSocketServer } from './socket';
import { startTickLoop } from './game/huntManager';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/characters', characterRouter);
app.use('/api/hunts', huntsRouter);
app.use('/api/leaderboard', leaderboardRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const httpServer = createServer(app);
const io = createSocketServer(httpServer);
startTickLoop(io);

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`Tibia Idle server rodando na porta ${PORT}`);
});
