import { useState } from 'react';
import { ATTRIBUTE_KEYS, AttributeKey, CharacterPublic } from '@tibia-idle/shared';
import { api } from '../api';
import { useGameStore } from '../store';

const LABELS: Record<AttributeKey, { name: string; hint: string }> = {
  STR: { name: 'Força', hint: 'Aumenta o dano corpo a corpo.' },
  DEX: { name: 'Destreza', hint: 'Aumenta o dano à distância e a chance de acerto.' },
  INT: { name: 'Inteligência', hint: 'Aumenta o dano mágico e a mana máxima.' },
  VIT: { name: 'Vitalidade', hint: 'Aumenta a vida máxima e a defesa.' },
};

export default function AttributesPanel({ character }: { character: CharacterPublic }) {
  const token = useGameStore((s) => s.token)!;
  const setCharacter = useGameStore((s) => s.setCharacter);
  const [pending, setPending] = useState<AttributeKey | null>(null);

  async function spend(attr: AttributeKey) {
    if (character.unspentAttributePoints <= 0) return;
    setPending(attr);
    try {
      const res = await api.spendAttribute(token, attr, 1);
      setCharacter(res.character);
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="panel attributes-panel">
      <h2>Atributos</h2>
      {character.unspentAttributePoints > 0 && (
        <p className="points-available">{character.unspentAttributePoints} ponto(s) disponível(is)</p>
      )}
      <ul>
        {ATTRIBUTE_KEYS.map((key) => (
          <li key={key} title={LABELS[key].hint}>
            <span className="attr-name">{LABELS[key].name}</span>
            <span className="attr-value">{character.attributes[key]}</span>
            <button
              className="btn-small"
              disabled={character.unspentAttributePoints <= 0 || pending === key}
              onClick={() => spend(key)}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
