export type Vocation = 'KNIGHT' | 'PALADIN' | 'SORCERER' | 'DRUID';

export const VOCATIONS: Vocation[] = ['KNIGHT', 'PALADIN', 'SORCERER', 'DRUID'];

export type AttributeKey = 'STR' | 'DEX' | 'INT' | 'VIT';

export const ATTRIBUTE_KEYS: AttributeKey[] = ['STR', 'DEX', 'INT', 'VIT'];

export type SkillKey = 'MELEE' | 'DISTANCE' | 'MAGIC' | 'SHIELDING';

export const SKILL_KEYS: SkillKey[] = ['MELEE', 'DISTANCE', 'MAGIC', 'SHIELDING'];

export interface Attributes {
  STR: number;
  DEX: number;
  INT: number;
  VIT: number;
}

export interface Skills {
  MELEE: number;
  DISTANCE: number;
  MAGIC: number;
  SHIELDING: number;
}

export interface SkillProgress {
  MELEE: number;
  DISTANCE: number;
  MAGIC: number;
  SHIELDING: number;
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldMin: number;
  goldMax: number;
  trophyName: string;
  trophyChance: number;
  color: string;
  shape: 'blob' | 'spider' | 'skeleton' | 'wolf' | 'dragon';
}

export interface HuntingGround {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  monsterIds: string[];
  backgroundGradient: string;
}

export interface CharacterPublic {
  id: string;
  name: string;
  vocation: Vocation;
  level: number;
  experience: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attributes: Attributes;
  unspentAttributePoints: number;
  skills: Skills;
  skillProgress: SkillProgress;
  currentGroundId: string | null;
  huntStartedAt: string | null;
  trophies: Record<string, number>;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  vocation: Vocation;
  level: number;
  experience: number;
}

export interface ChatMessage {
  id: string;
  authorName: string | null;
  text: string;
  createdAt: string;
  system?: boolean;
}

export type CombatEventType = 'attack' | 'monster-attack' | 'monster-death' | 'level-up' | 'player-death' | 'hunt-started' | 'hunt-stopped';

export interface CombatLogEvent {
  type: CombatEventType;
  text: string;
  damage?: number;
  monsterId?: string;
  monsterName?: string;
  monsterHp?: number;
  monsterMaxHp?: number;
  xpGained?: number;
  goldGained?: number;
  trophyName?: string;
  newLevel?: number;
  timestamp: number;
}
