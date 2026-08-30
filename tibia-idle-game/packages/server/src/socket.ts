import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { randomUUID } from 'crypto';
import { ChatMessage } from '@tibia-idle/shared';
import { verifyToken } from './auth';
import { prisma } from './prisma';

const chatHistory: ChatMessage[] = [];
const MAX_HISTORY = 50;
const onlineUserIds = new Set<string>();

function pushChatMessage(msg: ChatMessage) {
  chatHistory.push(msg);
  if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
}

export function createSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string') return next(new Error('unauthorized'));
    const payload = verifyToken(token);
    if (!payload) return next(new Error('unauthorized'));
    socket.data.userId = payload.userId;
    next();
  });

  io.on('connection', async (socket: Socket) => {
    const userId: string = socket.data.userId;
    socket.join(`user:${userId}`);
    socket.join('world');

    const wasEmpty = !onlineUserIds.has(userId);
    onlineUserIds.add(userId);
    if (wasEmpty) io.to('world').emit('world:online', onlineUserIds.size);

    socket.emit('chat:history', chatHistory);
    socket.emit('world:online', onlineUserIds.size);

    socket.on('chat:send', async (text: unknown) => {
      if (typeof text !== 'string') return;
      const trimmed = text.trim().slice(0, 300);
      if (!trimmed) return;

      const character = await prisma.character.findUnique({ where: { userId } });
      const msg: ChatMessage = {
        id: randomUUID(),
        authorName: character?.name || null,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      pushChatMessage(msg);
      io.to('world').emit('chat:message', msg);
    });

    socket.on('disconnect', () => {
      const stillConnected = [...io.sockets.sockets.values()].some((s) => s.data.userId === userId);
      if (!stillConnected) {
        onlineUserIds.delete(userId);
        io.to('world').emit('world:online', onlineUserIds.size);
      }
    });
  });

  return io;
}
