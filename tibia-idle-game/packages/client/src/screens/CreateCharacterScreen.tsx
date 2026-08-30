import { useState } from 'react';
import { VOCATIONS, VOCATION_DEFINITIONS, Vocation } from '@tibia-idle/shared';
import { api } from '../api';
import { useGameStore } from '../store';
import PixelSprite from '../components/PixelSprite';

export default function CreateCharacterScreen() {
  const [name, setName] = useState('');
  const [vocation, setVocation] = useState<Vocation>('KNIGHT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useGameStore((s) => s.token)!;
  const setCharacter = useGameStore((s) => s.setCharacter);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.createCharacter(token, name.trim(), vocation);
      setCharacter(res.character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-character-screen">
      <h1 className="game-title">Crie seu caçador</h1>

      <div className="vocation-grid">
        {VOCATIONS.map((v) => {
          const def = VOCATION_DEFINITIONS[v];
          return (
            <button
              key={v}
              type="button"
              className={`vocation-card ${vocation === v ? 'selected' : ''}`}
              onClick={() => setVocation(v)}
            >
              <PixelSprite color={def.spriteColor} size={56} attacking={false} />
              <h3>{def.name}</h3>
              <p>{def.description}</p>
            </button>
          );
        })}
      </div>

      <div className="create-character-form">
        <label>
          Nome do personagem
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={20}
            placeholder="Ex: Aranthor"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary" onClick={handleCreate} disabled={loading || name.trim().length < 3}>
          {loading ? 'Criando...' : 'Começar aventura'}
        </button>
      </div>
    </div>
  );
}
