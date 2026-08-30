import { useEffect, useRef, useState } from 'react';
import { CharacterPublic, HUNTING_GROUNDS, MONSTERS, VOCATION_DEFINITIONS } from '@tibia-idle/shared';
import { useGameStore } from '../store';
import PixelSprite from './PixelSprite';
import MonsterSprite from './MonsterSprite';

interface Floater {
  id: number;
  text: string;
  side: 'player' | 'monster';
  kind: 'damage' | 'miss' | 'heal';
}

let floaterId = 0;

function usePulse(ms: number): [boolean, () => void] {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function trigger() {
    setActive(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActive(false), ms);
  }
  return [active, trigger];
}

export default function HuntScene({ character, onStop }: { character: CharacterPublic; onStop: () => void }) {
  const combatLog = useGameStore((s) => s.combatLog);
  const monster = useGameStore((s) => s.monster);
  const [attacking, attack] = usePulse(350);
  const [monsterHit, hitMonster] = usePulse(300);
  const [playerHit, hitPlayer] = usePulse(300);
  const [monsterDying, killMonster] = usePulse(450);
  const [levelUp, flashLevelUp] = usePulse(1400);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const processedRef = useRef(0);

  const def = VOCATION_DEFINITIONS[character.vocation];
  const ground = HUNTING_GROUNDS.find((g) => g.id === character.currentGroundId);
  const monsterDef = monster ? MONSTERS[monster.id] : null;

  function addFloater(text: string, side: Floater['side'], kind: Floater['kind']) {
    const id = floaterId++;
    setFloaters((f) => [...f, { id, text, side, kind }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
  }

  useEffect(() => {
    const fresh = combatLog.slice(processedRef.current);
    processedRef.current = combatLog.length;
    for (const evt of fresh) {
      if (evt.type === 'attack') {
        attack();
        if (evt.damage && evt.damage > 0) {
          hitMonster();
          addFloater(`-${evt.damage}`, 'monster', 'damage');
        } else {
          addFloater('Errou', 'monster', 'miss');
        }
      } else if (evt.type === 'monster-attack') {
        if (evt.damage && evt.damage > 0) {
          hitPlayer();
          addFloater(`-${evt.damage}`, 'player', 'damage');
        } else {
          addFloater('Errou', 'player', 'miss');
        }
      } else if (evt.type === 'monster-death') {
        killMonster();
      } else if (evt.type === 'level-up') {
        flashLevelUp();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatLog]);

  const monsterHpPercent = monster ? Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100)) : 0;

  return (
    <section className="panel hunt-scene-panel">
      <div className="hunt-scene-header">
        <h2>{ground?.name || 'Caçando'}</h2>
        <button className="btn-secondary" onClick={onStop}>
          Parar caçada
        </button>
      </div>

      <div className="hunt-scene" style={{ background: ground?.backgroundGradient }}>
        {levelUp && <div className="level-up-flash">LEVEL UP!</div>}

        <div className={`scene-actor player-actor ${playerHit ? 'flash-hit' : ''}`}>
          <PixelSprite color={def.spriteColor} size={84} attacking={attacking} facing="right" />
          {floaters
            .filter((f) => f.side === 'player')
            .map((f) => (
              <span key={f.id} className={`floater floater-${f.kind}`}>
                {f.text}
              </span>
            ))}
        </div>

        {monsterDef && (
          <div className={`scene-actor monster-actor ${monsterDying ? 'dying' : ''}`}>
            <MonsterSprite monster={monsterDef} hit={monsterHit} dead={monsterDying} />
            <div className="monster-name">{monsterDef.name}</div>
            <div className="bar bar-monster-hp">
              <div className="bar-fill" style={{ width: `${monsterHpPercent}%` }} />
            </div>
            {floaters
              .filter((f) => f.side === 'monster')
              .map((f) => (
                <span key={f.id} className={`floater floater-${f.kind}`}>
                  {f.text}
                </span>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
