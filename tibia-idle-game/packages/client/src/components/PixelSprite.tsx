interface Props {
  color: string;
  size?: number;
  attacking?: boolean;
  facing?: 'left' | 'right';
}

export default function PixelSprite({ color, size = 72, attacking = false, facing = 'right' }: Props) {
  return (
    <div
      className={`pixel-sprite ${attacking ? 'attacking' : 'idle-bob'}`}
      style={{ width: size, height: size, transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
    >
      <div className="sprite-head" />
      <div className="sprite-eyes">
        <span />
        <span />
      </div>
      <div className="sprite-body" style={{ backgroundColor: color }} />
      <div className="sprite-legs">
        <span />
        <span />
      </div>
      <div className="sprite-weapon" />
    </div>
  );
}
