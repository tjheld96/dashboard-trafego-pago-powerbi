import { Router } from 'express';
import { HUNTING_GROUNDS } from '@tibia-idle/shared';
import { prisma } from '../prisma';
import { AuthedRequest, requireAuth } from '../auth';
import { toPublic } from '../game/characterMapper';
import { HuntError, catchUpIfNeeded, startHunt, stopHunt } from '../game/huntManager';

export const huntsRouter = Router();

huntsRouter.use(requireAuth);

huntsRouter.get('/grounds', async (_req, res) => {
  res.json({ grounds: HUNTING_GROUNDS });
});

huntsRouter.post('/start', async (req: AuthedRequest, res) => {
  const { groundId } = req.body || {};
  const character = await prisma.character.findUnique({ where: { userId: req.userId! } });
  if (!character) return res.status(404).json({ error: 'Nenhum personagem encontrado.' });

  await catchUpIfNeeded(character);

  try {
    const updated = await startHunt(character.id, groundId);
    res.json({ character: toPublic(updated) });
  } catch (err) {
    if (err instanceof HuntError) return res.status(400).json({ error: err.message });
    throw err;
  }
});

huntsRouter.post('/stop', async (req: AuthedRequest, res) => {
  const character = await prisma.character.findUnique({ where: { userId: req.userId! } });
  if (!character) return res.status(404).json({ error: 'Nenhum personagem encontrado.' });

  const updated = await stopHunt(character.id);
  res.json({ character: toPublic(updated) });
});
