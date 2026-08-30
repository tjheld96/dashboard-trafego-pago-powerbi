import { FormEvent, useState } from 'react';
import { VOCATION_DEFINITIONS } from '@tibia-idle/shared';
import { useGameStore } from '../store';
import { getSocket } from '../socket';

export default function SidePanel() {
  const onlineCount = useGameStore((s) => s.onlineCount);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const character = useGameStore((s) => s.character);
  const [text, setText] = useState('');

  function sendChat(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket()?.emit('chat:send', trimmed);
    setText('');
  }

  return (
    <>
      <section className="panel online-panel">
        <h2>Mundo Online</h2>
        <p className="online-count">🟢 {onlineCount} caçador(es) online</p>
      </section>

      <section className="panel leaderboard-panel">
        <h2>Ranking</h2>
        <ol>
          {leaderboard.slice(0, 10).map((entry) => (
            <li key={entry.id} className={character?.id === entry.id ? 'me' : ''}>
              <span className="rank-name">{entry.name}</span>
              <span className="rank-vocation">{VOCATION_DEFINITIONS[entry.vocation].name}</span>
              <span className="rank-level">Lv {entry.level}</span>
            </li>
          ))}
          {leaderboard.length === 0 && <p className="log-empty">Ninguém no ranking ainda.</p>}
        </ol>
      </section>

      <section className="panel chat-panel">
        <h2>Chat Global</h2>
        <div className="chat-messages">
          {chatMessages.map((m) => (
            <p key={m.id} className={m.system ? 'chat-system' : ''}>
              <strong>{m.authorName || 'Anônimo'}:</strong> {m.text}
            </p>
          ))}
          {chatMessages.length === 0 && <p className="log-empty">Nenhuma mensagem ainda.</p>}
        </div>
        <form className="chat-form" onSubmit={sendChat}>
          <input
            type="text"
            value={text}
            maxLength={300}
            placeholder="Diga algo..."
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-small">
            Enviar
          </button>
        </form>
      </section>
    </>
  );
}
