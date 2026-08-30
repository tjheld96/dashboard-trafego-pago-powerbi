import { Router } from 'express';
import {
  ATTRIBUTE_KEYS,
  VOCATIONS,
  VOCATION_DEFINITIONS,
  maxHpFor,
  maxMpFor,
} from '@tibia-idle/shared';
import { prisma } from '../prisma';
import { AuthedRequest, requireAuth } from '../auth';
import { toPublic } from '../game/characterMapper';
import { catchUpIfNeeded } from '../game/huntManager';

export const characterRouter = Router();

characterRouter.use(requireAuth);

characterRouter.post('/', async (req: AuthedRequest, res) => {
  const { name, vocation } = req.body || {};
  if (typeof name !== 'string' || !VOCATIONS.includes(vocation)) {
    return res.status(400).json({ error: 'Nome e vocação válidos são obrigatórios.' });
  }
  const trimmedName = name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 20) {
    return res.status(400).json({ error: 'O nome deve ter entre 3 e 20 caracteres.' });
  }

  const existingCharacter = await prisma.character.findUnique({ where: { userId: req.userId! } });
  if (existingCharacter) return res.status(409).json({ error: 'Você já possui um personagem.' });

  const nameTaken = await prisma.character.findUnique({ where: { name: trimmedName } });
  if (nameTaken) return res.status(409).json({ error: 'Esse nome já está em uso.' });

  const def = VOCATION_DEFINITIONS[vocation as keyof typeof VOCATION_DEFINITIONS];
  const attrs = def.startingAttributes;
  const hp = maxHpFor(def.id, 1, attrs.VIT);
  const mp = maxMpFor(def.id, 1, attrs.INT);

  const character = await prisma.character.create({
    data: {
      userId: req.userId!,
      name: trimmedName,
      vocation: def.id,
      hp,
      mp,
      attrStr: attrs.STR,
      attrDex: attrs.DEX,
      attrInt: attrs.INT,
      attrVit: attrs.VIT,
    },
  });

  res.status(201).json({ character: toPublic(character) });
});

characterRouter.get('/me', async (req: AuthedRequest, res) => {
  const character = await prisma.character.findUnique({ where: { userId: req.userId! } });
  if (!character) return res.status(404).json({ error: 'Nenhum personagem encontrado.' });

  const fresh = await catchUpIfNeeded(character);
  res.json({ character: toPublic(fresh) });
});

characterRouter.post('/attributes/spend', async (req: AuthedRequest, res) => {
  const { attribute, amount } = req.body || {};
  const points = Number(amount);
  if (!ATTRIBUTE_KEYS.includes(attribute) || !Number.isInteger(points) || points <= 0) {
    return res.status(400).json({ error: 'Atributo ou quantidade inválidos.' });
  }

  const character = await prisma.character.findUnique({ where: { userId: req.userId! } });
  if (!character) return res.status(404).json({ error: 'Nenhum personagem encontrado.' });
  if (character.unspentAttributePoints < points) {
    return res.status(400).json({ error: 'Pontos de atributo insuficientes.' });
  }

  const attributeData =
    attribute === 'STR'
      ? { attrStr: { increment: points } }
      : attribute === 'DEX'
      ? { attrDex: { increment: points } }
      : attribute === 'INT'
      ? { attrInt: { increment: points } }
      : { attrVit: { increment: points } };

  const updated = await prisma.character.update({
    where: { id: character.id },
    data: {
      ...attributeData,
      unspentAttributePoints: { decrement: points },
    },
  });

  res.json({ character: toPublic(updated) });
});
