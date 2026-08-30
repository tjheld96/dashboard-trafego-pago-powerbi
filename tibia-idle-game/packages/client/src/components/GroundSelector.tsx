import { HUNTING_GROUNDS, CharacterPublic } from '@tibia-idle/shared';

interface Props {
  character: CharacterPublic;
  onStart: (groundId: string) => void;
  loading: boolean;
}

export default function GroundSelector({ character, onStart, loading }: Props) {
  return (
    <section className="panel ground-selector">
      <h2>Áreas de Caça</h2>
      <div className="ground-list">
        {HUNTING_GROUNDS.map((ground) => {
          const locked = character.level < ground.minLevel;
          return (
            <div key={ground.id} className={`ground-card ${locked ? 'locked' : ''}`} style={{ background: ground.backgroundGradient }}>
              <div className="ground-card-overlay">
                <h3>{ground.name}</h3>
                <p>{ground.description}</p>
                <span className="ground-level">Nível mínimo: {ground.minLevel}</span>
                <button className="btn-primary" disabled={locked || loading} onClick={() => onStart(ground.id)}>
                  {locked ? 'Bloqueado' : 'Caçar aqui'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
