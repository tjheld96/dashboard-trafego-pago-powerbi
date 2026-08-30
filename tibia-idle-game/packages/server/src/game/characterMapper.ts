import { Character as CharacterRow } from '@prisma/client';
import { CharacterPublic, Vocation, maxHpFor, maxMpFor } from '@tibia-idle/shared';

export function toPublic(row: CharacterRow): CharacterPublic {
  const vocation = row.vocation as Vocation;
  const attributes = { STR: row.attrStr, DEX: row.attrDex, INT: row.attrInt, VIT: row.attrVit };
  const maxHp = maxHpFor(vocation, row.level, attributes.VIT);
  const maxMp = maxMpFor(vocation, row.level, attributes.INT);
  let trophies: Record<string, number> = {};
  try {
    trophies = JSON.parse(row.trophiesJson);
  } catch {
    trophies = {};
  }
  return {
    id: row.id,
    name: row.name,
    vocation,
    level: row.level,
    experience: row.experience,
    gold: row.gold,
    hp: Math.min(row.hp, maxHp),
    maxHp,
    mp: Math.min(row.mp, maxMp),
    maxMp,
    attributes,
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
    currentGroundId: row.currentGroundId,
    huntStartedAt: row.huntStartedAt ? row.huntStartedAt.toISOString() : null,
    trophies,
    createdAt: row.createdAt.toISOString(),
  };
}
