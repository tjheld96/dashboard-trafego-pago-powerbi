import { Router } from 'express';
import { LeaderboardEntry, Vocation } from '@tibia-idle/shared';
import { prisma } from '../prisma';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', async (_req, res) => {
  const rows = await prisma.character.findMany({
    orderBy: [{ level: 'desc' }, { experience: 'desc' }],
    take: 50,
    select: { id: true, name: true, vocation: true, level: true, experience: true },
  });
  const entries: LeaderboardEntry[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    vocation: r.vocation as Vocation,
    level: r.level,
    experience: r.experience,
  }));
  res.json({ entries });
});
