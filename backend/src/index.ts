import { createServer } from 'http';
import 'dotenv/config';
import app from './app';
import { prisma } from './infrastructure/persistence/prisma';
import { env } from './infrastructure/config/env';
import { scheduleJobs } from './application/jobs/scheduleJobs';
import { initSocketServer } from './infrastructure/ws/socket';

async function bootstrap() {
  try {
    await prisma.$connect();
    scheduleJobs();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
