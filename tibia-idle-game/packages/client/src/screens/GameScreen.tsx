import { useState } from 'react';
import { useGameStore } from '../store';
import { api } from '../api';
import Header from '../components/Header';
import AttributesPanel from '../components/AttributesPanel';
import SkillsPanel from '../components/SkillsPanel';
import GroundSelector from '../components/GroundSelector';
import HuntScene from '../components/HuntScene';
import CombatLog from '../components/CombatLog';
import SidePanel from '../components/SidePanel';

export default function GameScreen() {
  const character = useGameStore((s) => s.character)!;
  const setCharacter = useGameStore((s) => s.setCharacter);
  const token = useGameStore((s) => s.token)!;
  const logout = useGameStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(groundId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.startHunt(token, groundId);
      setCharacter(res.character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStop() {
    setLoading(true);
    try {
      const res = await api.stopHunt(token);
      setCharacter(res.character);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="game-screen">
      <Header character={character} />

      <div className="game-layout">
        <aside className="left-column">
          <AttributesPanel character={character} />
          <SkillsPanel character={character} />
          <button className="btn-secondary logout-btn" onClick={logout}>
            Sair
          </button>
        </aside>

        <main className="center-column">
          {error && <p className="form-error">{error}</p>}
          {character.currentGroundId ? (
            <HuntScene character={character} onStop={handleStop} />
          ) : (
            <GroundSelector character={character} onStart={handleStart} loading={loading} />
          )}
          <CombatLog />
        </main>

        <aside className="right-column">
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}
