import { CharacterPublic, SKILL_KEYS, SkillKey, primarySkillFor, skillPointsNeeded } from '@tibia-idle/shared';

const LABELS: Record<SkillKey, string> = {
  MELEE: 'Combate Corpo a Corpo',
  DISTANCE: 'Combate à Distância',
  MAGIC: 'Nível Mágico',
  SHIELDING: 'Escudo',
};

export default function SkillsPanel({ character }: { character: CharacterPublic }) {
  const primary = primarySkillFor(character.vocation);

  return (
    <section className="panel skills-panel">
      <h2>Skills</h2>
      <ul>
        {SKILL_KEYS.map((key) => {
          const level = character.skills[key];
          const needed = skillPointsNeeded(level);
          const progress = character.skillProgress[key];
          const percent = Math.min(100, Math.round((progress / needed) * 100));
          return (
            <li key={key} className={key === primary ? 'primary-skill' : ''}>
              <div className="skill-row">
                <span>{LABELS[key]}</span>
                <span className="skill-level">{level}</span>
              </div>
              <div className="bar bar-skill">
                <div className="bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
