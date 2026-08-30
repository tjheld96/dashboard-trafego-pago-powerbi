import type { CharacterPublic } from '@tibia-idle/shared';
import { VOCATION_DEFINITIONS, xpProgressWithinLevel } from '@tibia-idle/shared';

export default function Header({ character }: { character: CharacterPublic }) {
  const def = VOCATION_DEFINITIONS[character.vocation];
  const xp = xpProgressWithinLevel(character.experience, character.level);
  const hpPercent = Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (character.mp / character.maxMp) * 100));

  return (
    <header className="game-header">
      <div className="header-identity">
        <strong>{character.name}</strong>
        <span className="vocation-tag" style={{ borderColor: def.spriteColor }}>
          {def.name}
        </span>
        <span className="level-tag">Nível {character.level}</span>
      </div>

      <div className="header-bars">
        <div className="bar-row">
          <span className="bar-label">HP</span>
          <div className="bar bar-hp">
            <div className="bar-fill" style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="bar-value">
            {character.hp}/{character.maxHp}
          </span>
        </div>
        <div className="bar-row">
          <span className="bar-label">MP</span>
          <div className="bar bar-mp">
            <div className="bar-fill" style={{ width: `${mpPercent}%` }} />
          </div>
          <span className="bar-value">
            {character.mp}/{character.maxMp}
          </span>
        </div>
        <div className="bar-row">
          <span className="bar-label">XP</span>
          <div className="bar bar-xp">
            <div className="bar-fill" style={{ width: `${xp.percent * 100}%` }} />
          </div>
          <span className="bar-value">{Math.round(xp.percent * 100)}%</span>
        </div>
      </div>

      <div className="header-gold">🪙 {character.gold.toLocaleString('pt-BR')}</div>
    </header>
  );
}
