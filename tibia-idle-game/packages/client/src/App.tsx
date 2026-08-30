import { useEffect, useState } from 'react';
import type { CharacterPublic, ChatMessage, CombatLogEvent } from '@tibia-idle/shared';
import { useGameStore } from './store';
import { api, ApiError } from './api';
import { connectSocket, disconnectSocket } from './socket';
import AuthScreen from './screens/AuthScreen';
import CreateCharacterScreen from './screens/CreateCharacterScreen';
import GameScreen from './screens/GameScreen';

type Status = 'loading' | 'no-character' | 'ready';

export default function App() {
  const token = useGameStore((s) => s.token);
  const character = useGameStore((s) => s.character);
  const setCharacter = useGameStore((s) => s.setCharacter);
  const updateCharacter = useGameStore((s) => s.updateCharacter);
  const setOnlineCount = useGameStore((s) => s.setOnlineCount);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);
  const setChatMessages = useGameStore((s) => s.setChatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);
  const pushCombatEvents = useGameStore((s) => s.pushCombatEvents);
  const setMonster = useGameStore((s) => s.setMonster);
  const logout = useGameStore((s) => s.logout);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('loading');
      return;
    }
    let cancelled = false;
    api
      .getMe(token)
      .then((res) => {
        if (cancelled) return;
        setCharacter(res.character);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setStatus('no-character');
      });
    return () => {
      cancelled = true;
    };
  }, [token, setCharacter]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    socket.on('world:online', (count: number) => setOnlineCount(count));
    socket.on('chat:history', (messages: ChatMessage[]) => setChatMessages(messages));
    socket.on('chat:message', (message: ChatMessage) => addChatMessage(message));
    socket.on('combat:events', (events: CombatLogEvent[]) => {
      pushCombatEvents(events);
      const lastAttack = [...events].reverse().find((e) => e.monsterId);
      if (lastAttack) {
        setMonster({
          id: lastAttack.monsterId!,
          hp: lastAttack.monsterHp ?? 0,
          maxHp: lastAttack.monsterMaxHp ?? 1,
        });
      }
    });
    socket.on('character:update', (partial: Partial<CharacterPublic> & { monsterId?: string; monsterHp?: number; monsterMaxHp?: number }) => {
      updateCharacter(partial);
      if (partial.monsterId) {
        setMonster({ id: partial.monsterId, hp: partial.monsterHp ?? 0, maxHp: partial.monsterMaxHp ?? 1 });
      }
    });
    socket.on('leaderboard:dirty', () => {
      api.getLeaderboard(token).then((res) => setLeaderboard(res.entries)).catch(() => {});
    });
    socket.on('connect_error', (err: Error) => {
      if (err.message === 'unauthorized') logout();
    });

    api.getLeaderboard(token).then((res) => setLeaderboard(res.entries)).catch(() => {});

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return <AuthScreen />;
  if (status === 'loading') return <div className="loading-screen">Carregando...</div>;
  if (status === 'no-character' && !character) return <CreateCharacterScreen />;
  if (!character) return <div className="loading-screen">Carregando...</div>;
  return <GameScreen />;
}
