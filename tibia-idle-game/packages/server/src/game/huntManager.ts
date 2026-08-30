import { Server as SocketIOServer } from 'socket.io';
import { Character as CharacterRow } from '@prisma/client';
import { CombatLogEvent, HUNTING_GROUNDS } from '@tibia-idle/shared';
import { prisma } from '../prisma';
import { toPublic } from './characterMapper';
import { HuntRuntimeState, initRuntimeState, runOneRound } from './combat';

export const TICK_MS = 2000;
const FLUSH_EVERY_N_TICKS = 5;
const OFFLINE_CAP_MS = 12 * 60 * 60 * 1000;

interface LiveEntry {
  state: HuntRuntimeState;
  ticksSinceFlush: number;
}

const activeHunts = new Map<string, LiveEntry>();

function rowToBaseState(row: CharacterRow): Omit<HuntRuntimeState, 'monsterId' | 'monsterHp' | 'monsterMaxHp' | 'groundId'> {
  return {
    characterId: row.id,
    userId: row.userId,
    name: row.name,
    vocation: row.vocation as any,
    level: row.level,
    experience: row.experience,
    gold: row.gold,
    attributes: { STR: row.attrStr, DEX: row.attrDex, INT: row.attrInt, VIT: row.attrVit },
    unspentAttributePoints: row.unspentAttributePoints,
    skills: {
      MELEE: row.skillMelee,
      DISTANCE: row.skillDistance,
      MAGIC: row.skillMagic,
      SHIELDING: row.skillShielding,
    },
    skillProgress: {
      MELEE: row.skillProgressMelee,
      DISTANCE: row.skillProgressDistance,
      MAGIC: row.skillProgressMagic,
      SHIELDING: row.skillProgressShielding,
    },
    hp: row.hp,
    maxHp: row.hp,
    mp: row.mp,
    maxMp: row.mp,
    deaths: row.deaths,
    trophies: JSON.parse(row.trophiesJson || '{}'),
  };
}

async function persistState(state: HuntRuntimeState) {
  await prisma.character.update({
    where: { id: state.characterId },
    data: {
      level: state.level,
      experience: state.experience,
      gold: state.gold,
      unspentAttributePoints: state.unspentAttributePoints,
      skillMelee: state.skills.MELEE,
      skillDistance: state.skills.DISTANCE,
      skillMagic: state.skills.MAGIC,
      skillShielding: state.skills.SHIELDING,
      skillProgressMelee: state.skillProgress.MELEE,
      skillProgressDistance: state.skillProgress.DISTANCE,
      skillProgressMagic: state.skillProgress.MAGIC,
      skillProgressShielding: state.skillProgress.SHIELDING,
      hp: state.hp,
      mp: state.mp,
      deaths: state.deaths,
      trophiesJson: JSON.stringify(state.trophies),
      currentGroundId: state.groundId,
      huntStartedAt: state.groundId ? undefined : null,
      lastTickAt: new Date(),
    },
  });
}

export class HuntError extends Error {}

export async function startHunt(characterId: string, groundId: string): Promise<CharacterRow> {
  const ground = HUNTING_GROUNDS.find((g) => g.id === groundId);
  if (!ground) throw new HuntError('Área de caça inválida.');

  const row = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  if (row.level < ground.minLevel) throw new HuntError(`Nível ${ground.minLevel} necessário para caçar aqui.`);
  if (row.currentGroundId) throw new HuntError('Personagem já está caçando.');
  if (row.hp <= 0) throw new HuntError('Personagem sem vida para caçar.');

  const state = initRuntimeState(rowToBaseState(row), groundId);
  activeHunts.set(characterId, { state, ticksSinceFlush: 0 });

  const updated = await prisma.character.update({
    where: { id: characterId },
    data: { currentGroundId: groundId, huntStartedAt: new Date(), lastTickAt: new Date() },
  });
  return updated;
}

export async function stopHunt(characterId: string): Promise<CharacterRow> {
  const entry = activeHunts.get(characterId);
  if (entry) {
    entry.state.groundId = null;
    await persistState(entry.state);
    activeHunts.delete(characterId);
  } else {
    await prisma.character.update({
      where: { id: characterId },
      data: { currentGroundId: null, huntStartedAt: null },
    });
  }
  return prisma.character.findUniqueOrThrow({ where: { id: characterId } });
}

export function isHuntingLive(characterId: string): boolean {
  return activeHunts.has(characterId);
}

/**
 * Ensures a character whose hunt was left running (offline, or server restart) gets
 * fast-forwarded to the present, then resumes live tracking if still hunting.
 */
export async function catchUpIfNeeded(row: CharacterRow): Promise<CharacterRow> {
  if (!row.currentGroundId || activeHunts.has(row.id)) return row;

  const since = row.lastTickAt || row.huntStartedAt || row.updatedAt;
  const elapsedMs = Math.min(Date.now() - since.getTime(), OFFLINE_CAP_MS);
  const rounds = Math.max(0, Math.floor(elapsedMs / TICK_MS));

  const state = initRuntimeState(rowToBaseState(row), row.currentGroundId);
  for (let i = 0; i < rounds; i += 1) {
    runOneRound(state);
    if (!state.groundId) break;
  }

  await persistState(state);

  if (state.groundId) {
    activeHunts.set(row.id, { state, ticksSinceFlush: 0 });
  }

  return prisma.character.findUniqueOrThrow({ where: { id: row.id } });
}

export function startTickLoop(io: SocketIOServer) {
  setInterval(async () => {
    for (const [characterId, entry] of activeHunts.entries()) {
      const events: CombatLogEvent[] = runOneRound(entry.state);
      if (events.length === 0) continue;

      io.to(`user:${entry.state.userId}`).emit('combat:events', events);
      io.to(`user:${entry.state.userId}`).emit('character:update', publicSnapshot(entry.state));

      entry.ticksSinceFlush += 1;
      const diedOrStopped = !entry.state.groundId;
      if (diedOrStopped || entry.ticksSinceFlush >= FLUSH_EVERY_N_TICKS) {
        entry.ticksSinceFlush = 0;
        try {
          await persistState(entry.state);
        } catch (err) {
          console.error('Failed to persist hunt state', err);
        }
        if (diedOrStopped) {
          activeHunts.delete(characterId);
          io.emit('leaderboard:dirty');
        }
      }
      if (events.some((e) => e.type === 'level-up')) {
        io.emit('leaderboard:dirty');
      }
    }
  }, TICK_MS);
}

function publicSnapshot(state: HuntRuntimeState) {
  return {
    id: state.characterId,
    name: state.name,
    vocation: state.vocation,
    level: state.level,
    experience: state.experience,
    gold: state.gold,
    hp: state.hp,
    maxHp: state.maxHp,
    mp: state.mp,
    maxMp: state.maxMp,
    attributes: state.attributes,
    unspentAttributePoints: state.unspentAttributePoints,
    skills: state.skills,
    skillProgress: state.skillProgress,
    currentGroundId: state.groundId,
    monsterId: state.monsterId,
    monsterHp: state.monsterHp,
    monsterMaxHp: state.monsterMaxHp,
    trophies: state.trophies,
  };
}

export { toPublic };
