import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

function loadOpenApiSpec(): Record<string, unknown> {
  const specPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
  const source = fs.readFileSync(specPath, 'utf8');
  return yaml.load(source) as Record<string, unknown>;
}

export function isSwaggerEnabled(): boolean {
  if (process.env.ENABLE_SWAGGER === 'true') return true;
  if (process.env.ENABLE_SWAGGER === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export function swaggerRouter(): Router {
  const router = Router();
  const document = loadOpenApiSpec();

  router.use('/', swaggerUi.serve);
  router.get(
    '/',
    swaggerUi.setup(document, {
      customSiteTitle: 'Re-Pensa Tech API',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  return router;
}
