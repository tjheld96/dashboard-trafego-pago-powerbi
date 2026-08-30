import { Attributes, SkillKey, Vocation } from './types';
import { VOCATION_DEFINITIONS } from './gameData';

/** Cumulative experience required to reach a given level. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(25 * Math.pow(level, 2.5));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level += 1;
    if (level > 2000) break;
  }
  return level;
}

export function xpProgressWithinLevel(xp: number, level: number) {
  const currentFloor = xpForLevel(level);
  const nextCeil = xpForLevel(level + 1);
  const span = Math.max(1, nextCeil - currentFloor);
  return {
    currentFloor,
    nextCeil,
    percent: Math.min(1, Math.max(0, (xp - currentFloor) / span)),
  };
}

export function maxHpFor(vocation: Vocation, level: number, vit: number): number {
  const def = VOCATION_DEFINITIONS[vocation];
  return Math.round(def.baseHp + def.hpPerLevel * (level - 1) + vit * 4);
}

export function maxMpFor(vocation: Vocation, level: number, int: number): number {
  const def = VOCATION_DEFINITIONS[vocation];
  return Math.round(def.baseMp + def.mpPerLevel * (level - 1) + int * 5);
}

export interface DamageRange {
  min: number;
  max: number;
}

function damageRange(base: number): DamageRange {
  return { min: Math.max(1, Math.round(base * 0.7)), max: Math.max(2, Math.round(base * 1.3)) };
}

export function meleeDamageRange(str: number, meleeSkill: number, weaponBase: number): DamageRange {
  return damageRange(weaponBase + meleeSkill * 1.1 + str * 0.7);
}

export function distanceDamageRange(dex: number, distanceSkill: number, weaponBase: number): DamageRange {
  return damageRange(weaponBase + distanceSkill * 1.1 + dex * 0.7);
}

export function magicDamageRange(int: number, magicLevel: number, weaponBase: number): DamageRange {
  return damageRange(weaponBase + magicLevel * 1.4 + int * 0.9);
}

export function attackerHitChance(attackSkill: number, targetDefense: number): number {
  const chance = 0.75 + attackSkill * 0.005 - targetDefense * 0.01;
  return Math.min(0.95, Math.max(0.35, chance));
}

export function monsterHitChance(shieldingSkill: number): number {
  const chance = 0.8 - shieldingSkill * 0.004;
  return Math.min(0.9, Math.max(0.3, chance));
}

export function playerDamageTaken(monsterAttack: number, shieldingSkill: number, vit: number): number {
  const reduction = shieldingSkill * 0.5 + vit * 0.3;
  const base = Math.max(1, monsterAttack - reduction);
  const jitter = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.round(base * jitter));
}

export function primaryAttack(
  vocation: Vocation,
  attributes: Attributes,
  skillLevel: number,
): DamageRange {
  const def = VOCATION_DEFINITIONS[vocation];
  if (def.primarySkill === 'MELEE') return meleeDamageRange(attributes.STR, skillLevel, def.weaponBase);
  if (def.primarySkill === 'DISTANCE') return distanceDamageRange(attributes.DEX, skillLevel, def.weaponBase);
  return magicDamageRange(attributes.INT, skillLevel, def.weaponBase);
}

/** Skill progress points required to advance from `currentLevel` to the next. */
export function skillPointsNeeded(currentLevel: number): number {
  return Math.round(50 * Math.pow(1.15, currentLevel - 1));
}

export function primarySkillFor(vocation: Vocation): SkillKey {
  return VOCATION_DEFINITIONS[vocation].primarySkill;
}

export const ATTRIBUTE_POINTS_PER_LEVEL_DEFAULT = 3;
