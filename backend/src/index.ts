import { createServer } from 'node:http';
import 'dotenv/config';
import app from './app';
import { prisma } from './infrastructure/persistence/prisma';
import { connectMongo } from './infrastructure/persistence/mongo/connection';
import { env } from './infrastructure/config/env';
import { isSwaggerEnabled } from './infrastructure/config/swagger';
import { scheduleJobs } from './application/jobs/scheduleJobs';
import { initSocketServer } from './infrastructure/ws/socket';
import { ensureDefaultUniversity } from './infrastructure/seed/default-university';

async function bootstrap() {
  try {
    await connectMongo();
    await prisma.$connect();
    await ensureDefaultUniversity();
    scheduleJobs();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
      if (isSwaggerEnabled()) {
        console.log(`Documentación API: http://localhost:${env.port}/api/docs`);
      }
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
