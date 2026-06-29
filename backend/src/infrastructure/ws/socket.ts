import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { AuthPayload } from '../../domain/types/user.types';
import { chatRepository } from '../persistence/repositories/chat.repository';
import { assertChatAccess } from '../../domain/validators/chat.validator';

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return DEFAULT_ORIGINS;
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

let io: Server | null = null;

interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthPayload;
  };
}

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: parseOrigins(process.env.CORS_ORIGIN),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      next(new Error('Token no proporcionado'));
      return;
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
      (socket as AuthenticatedSocket).data.user = payload;
      next();
    } catch {
      next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const { userId } = socket.data.user;
    socket.join(`user:${userId}`);

    socket.on('chat:join', async (chatId: string) => {
      try {
        const chat = await chatRepository.findById(chatId);
        assertChatAccess(chat, userId);
        socket.join(`chat:${chatId}`);
      } catch {
        socket.emit('chat:error', { message: 'No se pudo unir al chat' });
      }
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error('Socket.io no inicializado');
  }
  return io;
}
