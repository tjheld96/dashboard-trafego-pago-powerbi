import type { Monster } from '@tibia-idle/shared';

interface Props {
  monster: Monster;
  hit?: boolean;
  dead?: boolean;
}

const CLIP_PATHS: Record<Monster['shape'], string> = {
  blob: 'polygon(50% 0%, 80% 10%, 100% 40%, 90% 80%, 60% 100%, 40% 100%, 10% 80%, 0% 40%, 20% 10%)',
  spider: 'polygon(50% 15%, 70% 25%, 85% 45%, 80% 70%, 60% 90%, 40% 90%, 20% 70%, 15% 45%, 30% 25%)',
  skeleton: 'polygon(50% 0%, 65% 10%, 65% 40%, 85% 45%, 90% 90%, 65% 90%, 60% 55%, 40% 55%, 35% 90%, 10% 90%, 15% 45%, 35% 40%, 35% 10%)',
  wolf: 'polygon(15% 30%, 5% 10%, 20% 25%, 40% 10%, 45% 25%, 90% 20%, 100% 45%, 85% 55%, 85% 90%, 65% 90%, 65% 60%, 35% 60%, 35% 90%, 15% 90%, 15% 55%, 0% 45%)',
  dragon: 'polygon(10% 40%, 0% 20%, 20% 35%, 35% 10%, 50% 30%, 65% 10%, 80% 35%, 100% 20%, 90% 40%, 95% 65%, 75% 60%, 70% 90%, 55% 90%, 55% 65%, 45% 65%, 45% 90%, 30% 90%, 25% 60%, 5% 65%)',
};

export default function MonsterSprite({ monster, hit = false, dead = false }: Props) {
  return (
    <div className={`monster-sprite ${hit ? 'hit' : ''} ${dead ? 'dead' : ''}`}>
      <div
        className="monster-shape"
        style={{ backgroundColor: monster.color, clipPath: CLIP_PATHS[monster.shape] }}
      />
      <div className="monster-eyes">
        <span />
        <span />
      </div>
    </div>
  );
}
