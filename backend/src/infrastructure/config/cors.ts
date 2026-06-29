import cors, { CorsOptions } from 'cors';

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return DEFAULT_ORIGINS;

  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function corsMiddleware() {
  const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

  const options: CorsOptions = {
    origin(origin, callback) {
      // Postman, curl y server-to-server no envían Origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  return cors(options);
}
