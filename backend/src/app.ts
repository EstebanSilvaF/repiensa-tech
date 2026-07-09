import express from 'express';
import { corsMiddleware } from './infrastructure/config/cors';
import { isSwaggerEnabled, swaggerRouter } from './infrastructure/config/swagger';
import { errorHandler } from './presentation/middlewares/error.middleware';
import authRoutes from './presentation/routes/auth.routes';
import universityRoutes from './presentation/routes/university.routes';
import notificationRoutes from './presentation/routes/notification.routes';
import productRoutes from './presentation/routes/product.routes';
import chatRoutes from './presentation/routes/chat.routes';
import reservationRoutes from './presentation/routes/reservation.routes';
import transactionRoutes from './presentation/routes/transaction.routes';
import uploadRoutes from './presentation/routes/upload.routes';

const app = express();

app.disable('x-powered-by');

app.use(corsMiddleware());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (isSwaggerEnabled()) {
  app.use('/api/docs', swaggerRouter());
}

app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ping', (req, res) => {
  res.json({ status: 'Este es un ping' });
});

app.use(errorHandler);

export default app;
