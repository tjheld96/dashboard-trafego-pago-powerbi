import {
  Attributes,
  CombatLogEvent,
  HUNTING_GROUNDS,
  MONSTERS,
  Skills,
  SkillProgress,
  Vocation,
  attackerHitChance,
  ATTRIBUTE_POINTS_PER_LEVEL,
  levelFromXp,
  maxHpFor,
  maxMpFor,
  monsterHitChance,
  playerDamageTaken,
  primaryAttack,
  primarySkillFor,
  skillPointsNeeded,
  xpForLevel,
} from '@tibia-idle/shared';

export interface HuntRuntimeState {
  characterId: string;
  userId: string;
  name: string;
  vocation: Vocation;
  level: number;
  experience: number;
  gold: number;
  attributes: Attributes;
  unspentAttributePoints: number;
  skills: Skills;
  skillProgress: SkillProgress;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  deaths: number;
  trophies: Record<string, number>;
  groundId: string | null;
  monsterId: string;
  monsterHp: number;
  monsterMaxHp: number;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnMonster(state: HuntRuntimeState) {
  const ground = HUNTING_GROUNDS.find((g) => g.id === state.groundId);
  if (!ground) return;
  const monsterId = ground.monsterIds[randInt(0, ground.monsterIds.length - 1)];
  const monster = MONSTERS[monsterId];
  state.monsterId = monsterId;
  state.monsterHp = monster.hp;
  state.monsterMaxHp = monster.hp;
}

function applySkillGain(state: HuntRuntimeState, skillKey: keyof Skills) {
  state.skillProgress[skillKey] += 1;
  let needed = skillPointsNeeded(state.skills[skillKey]);
  while (state.skillProgress[skillKey] >= needed) {
    state.skillProgress[skillKey] -= needed;
    state.skills[skillKey] += 1;
    needed = skillPointsNeeded(state.skills[skillKey]);
  }
}

export function initRuntimeState(base: Omit<HuntRuntimeState, 'monsterId' | 'monsterHp' | 'monsterMaxHp' | 'groundId'>, groundId: string): HuntRuntimeState {
  const state: HuntRuntimeState = { ...base, groundId, monsterId: '', monsterHp: 0, monsterMaxHp: 0 };
  spawnMonster(state);
  return state;
}

/** Resolves a single combat round in place, returning the log events it produced. */
export function runOneRound(state: HuntRuntimeState): CombatLogEvent[] {
  if (!state.groundId) return [];
  const ground = HUNTING_GROUNDS.find((g) => g.id === state.groundId);
  const monster = MONSTERS[state.monsterId];
  if (!ground || !monster) return [];

  const events: CombatLogEvent[] = [];
  const now = Date.now();
  const primarySkillKey = primarySkillFor(state.vocation);
  const attackSkillLevel = state.skills[primarySkillKey];

  if (Math.random() < attackerHitChance(attackSkillLevel, monster.defense)) {
    const range = primaryAttack(state.vocation, state.attributes, attackSkillLevel);
    const dmg = randInt(range.min, range.max);
    state.monsterHp = Math.max(0, state.monsterHp - dmg);
    events.push({
      type: 'attack',
      text: `Você acertou ${monster.name} por ${dmg} de dano.`,
      damage: dmg,
      monsterId: monster.id,
      monsterName: monster.name,
      monsterHp: state.monsterHp,
      monsterMaxHp: state.monsterMaxHp,
      timestamp: now,
    });
  } else {
    events.push({
      type: 'attack',
      text: `Você errou o ataque contra ${monster.name}.`,
      damage: 0,
      monsterId: monster.id,
      monsterName: monster.name,
      monsterHp: state.monsterHp,
      monsterMaxHp: state.monsterMaxHp,
      timestamp: now,
    });
  }
  applySkillGain(state, primarySkillKey);

  if (state.monsterHp <= 0) {
    const xp = monster.xpReward;
    const gold = randInt(monster.goldMin, monster.goldMax);
    state.experience += xp;
    state.gold += gold;

    let trophyName: string | undefined;
    if (Math.random() < monster.trophyChance) {
      trophyName = monster.trophyName;
      state.trophies[trophyName] = (state.trophies[trophyName] || 0) + 1;
    }

    events.push({
      type: 'monster-death',
      text: trophyName
        ? `${monster.name} foi derrotado! +${xp} XP, +${gold} gold. Você encontrou: ${trophyName}.`
        : `${monster.name} foi derrotado! +${xp} XP, +${gold} gold.`,
      xpGained: xp,
      goldGained: gold,
      monsterName: monster.name,
      trophyName,
      timestamp: now,
    });

    const newLevel = levelFromXp(state.experience);
    if (newLevel > state.level) {
      state.unspentAttributePoints += (newLevel - state.level) * ATTRIBUTE_POINTS_PER_LEVEL;
      state.level = newLevel;
      state.maxHp = maxHpFor(state.vocation, state.level, state.attributes.VIT);
      state.maxMp = maxMpFor(state.vocation, state.level, state.attributes.INT);
      state.hp = state.maxHp;
      state.mp = state.maxMp;
      events.push({ type: 'level-up', text: `Você alcançou o nível ${newLevel}!`, newLevel, timestamp: now });
    }

    spawnMonster(state);
    return events;
  }

  if (Math.random() < monsterHitChance(state.skills.SHIELDING)) {
    const dmg = playerDamageTaken(monster.attack, state.skills.SHIELDING, state.attributes.VIT);
    state.hp -= dmg;
    events.push({ type: 'monster-attack', text: `${monster.name} acertou você por ${dmg} de dano.`, damage: dmg, timestamp: now });
    applySkillGain(state, 'SHIELDING');
  } else {
    events.push({ type: 'monster-attack', text: `${monster.name} errou o ataque.`, damage: 0, timestamp: now });
  }

  if (state.hp <= 0) {
    state.deaths += 1;
    const floor = xpForLevel(state.level);
    const lost = Math.max(0, Math.round((state.experience - floor) * 0.1));
    state.experience = Math.max(floor, state.experience - lost);
    state.level = levelFromXp(state.experience);
    state.maxHp = maxHpFor(state.vocation, state.level, state.attributes.VIT);
    state.maxMp = maxMpFor(state.vocation, state.level, state.attributes.INT);
    state.hp = state.maxHp;
    state.mp = state.maxMp;
    state.groundId = null;
    events.push({
      type: 'player-death',
      text: `Você morreu para ${monster.name} e foi levado de volta à cidade! Perdeu ${lost} XP.`,
      timestamp: now,
    });
  }

  return events;
}
