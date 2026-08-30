import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

const TYPE_CLASS: Record<string, string> = {
  attack: 'log-attack',
  'monster-attack': 'log-monster-attack',
  'monster-death': 'log-death',
  'level-up': 'log-level-up',
  'player-death': 'log-player-death',
};

export default function CombatLog() {
  const combatLog = useGameStore((s) => s.combatLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combatLog]);

  return (
    <section className="panel combat-log-panel">
      <h2>Registro de Combate</h2>
      <div className="combat-log" ref={scrollRef}>
        {combatLog.length === 0 && <p className="log-empty">Inicie uma caçada para ver o combate aqui.</p>}
        {combatLog.map((evt, i) => (
          <p key={i} className={TYPE_CLASS[evt.type] || ''}>
            {evt.text}
          </p>
        ))}
      </div>
    </section>
  );
}
