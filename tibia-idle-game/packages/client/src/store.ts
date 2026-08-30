import { create } from 'zustand';
import type { CharacterPublic, ChatMessage, CombatLogEvent, LeaderboardEntry } from '@tibia-idle/shared';

interface MonsterView {
  id: string;
  hp: number;
  maxHp: number;
}

interface GameStore {
  token: string | null;
  username: string | null;
  character: CharacterPublic | null;
  onlineCount: number;
  leaderboard: LeaderboardEntry[];
  chatMessages: ChatMessage[];
  combatLog: CombatLogEvent[];
  monster: MonsterView | null;
  lastEventTick: number;

  setAuth: (token: string, username: string) => void;
  logout: () => void;
  setCharacter: (character: CharacterPublic | null) => void;
  updateCharacter: (partial: Partial<CharacterPublic>) => void;
  setOnlineCount: (n: number) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  pushCombatEvents: (events: CombatLogEvent[]) => void;
  setMonster: (m: MonsterView | null) => void;
}

const TOKEN_KEY = 'tibia-idle-token';
const USERNAME_KEY = 'tibia-idle-username';

export const useGameStore = create<GameStore>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  username: localStorage.getItem(USERNAME_KEY),
  character: null,
  onlineCount: 0,
  leaderboard: [],
  chatMessages: [],
  combatLog: [],
  monster: null,
  lastEventTick: 0,

  setAuth: (token, username) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    set({ token, username });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    set({ token: null, username: null, character: null, combatLog: [], monster: null });
  },
  setCharacter: (character) => set({ character }),
  updateCharacter: (partial) =>
    set((s) => (s.character ? { character: { ...s.character, ...partial } } : s)),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setChatMessages: (chatMessages) => set({ chatMessages }),
  addChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages.slice(-49), message] })),
  pushCombatEvents: (events) =>
    set((s) => ({ combatLog: [...s.combatLog, ...events].slice(-40), lastEventTick: s.lastEventTick + 1 })),
  setMonster: (monster) => set({ monster }),
}));
