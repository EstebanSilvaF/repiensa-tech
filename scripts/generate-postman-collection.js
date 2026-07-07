/**
 * Generates repensa-postman-collection.json from schema definitions.
 * Run: node scripts/generate-postman-collection.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT, 'postman', 'schemas');

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, `${name}.json`), 'utf8'));
}

function schemaLiteral(name) {
  return JSON.stringify(loadSchema(name));
}

function testLines(status, extra = []) {
  return [
    `pm.test('Status ${status}', () => pm.response.to.have.status(${status}));`,
    ...extra,
  ];
}

function authBearer(tokenVar = 'token') {
  return {
    type: 'bearer',
    bearer: [{ key: 'token', value: `{{${tokenVar}}}`, type: 'string' }],
  };
}

function jsonBody(raw) {
  return {
    mode: 'raw',
    raw: typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2),
    options: { raw: { language: 'json' } },
  };
}

function skipExternalScript() {
  return [
    "if (pm.environment.get('skipExternal') === 'true') {",
    "  pm.execution.skipRequest();",
    '}',
  ];
}

function skipGroqScript() {
  return [
    "if (pm.environment.get('skipGroq') === 'true') {",
    "  pm.execution.skipRequest();",
    '}',
  ];
}

function schemaTest(varName, schemaName) {
  const schema = schemaLiteral(schemaName);
  return `pm.test('Contrato ${schemaName}', () => pm.response.to.have.jsonSchema(${schema}));`;
}

function request(name, method, urlPath, opts = {}) {
  const {
    auth,
    body,
    formdata,
    tests = [],
    prerequest = [],
    description = '',
    tokenVar,
  } = opts;

  const headers = [{ key: 'Content-Type', value: 'application/json', disabled: method === 'GET' }];
  if (formdata) {
    headers[0].disabled = true;
  }

  const item = {
    name,
    request: {
      method,
      header: headers.filter((h) => !h.disabled),
      url: `{{baseUrl}}${urlPath}`,
      description,
    },
    event: [],
  };

  if (auth) {
    item.request.auth = typeof auth === 'string' ? authBearer(auth) : auth;
  }

  if (body) {
    item.request.body = body;
  }

  if (formdata) {
    item.request.body = { mode: 'formdata', formdata };
  }

  if (prerequest.length) {
    item.event.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: prerequest } });
  }

  if (tests.length) {
    item.event.push({ listen: 'test', script: { type: 'text/javascript', exec: tests } });
  }

  if (tokenVar) {
    item.request.auth = authBearer(tokenVar);
  }

  return item;
}

const collection = {
  info: {
    name: 'Re-Pensa Tech API',
    description:
      'Colección API + contrato Re-Pensa Tech. No requiere db:reset: cada ejecución crea sus propios datos (producto, reserva, chat). Ejecutar: npm run test:api',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'token', value: '' },
    { key: 'adminToken', value: '' },
    { key: 'carlosToken', value: '' },
    { key: 'registeredToken', value: '' },
    { key: 'userId', value: '' },
    { key: 'carlosUserId', value: '' },
    { key: 'runId', value: '' },
    { key: 'flowProductId', value: '' },
    { key: 'chatId', value: '' },
    { key: 'messageId', value: '' },
    { key: 'appointmentMessageId', value: '' },
    { key: 'newUniversityId', value: '' },
    { key: 'notificationId', value: '' },
    { key: 'image_url', value: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
    { key: 'image_public_id', value: '' },
    { key: 'registeredEmail', value: '' },
    { key: 'registeredPassword', value: 'Register1!' },
    { key: 'tempPassword', value: 'TempPass2!' },
    { key: 'newUniversityDomain', value: '' },
    { key: 'productName', value: '' },
    { key: 'universityId', value: '' },
  ],
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          "if (!pm.collectionVariables.get('runId')) {",
          "  pm.collectionVariables.set('runId', Date.now().toString());",
          '}',
        ],
      },
    },
  ],
  item: [
    {
      name: '01 Health',
      item: [
        request('GET /health', 'GET', '/health', {
          tests: [
            ...testLines(200),
            schemaTest('health', 'health-response'),
            "pm.test('status ok', () => pm.expect(pm.response.json().status).to.eql('ok'));",
          ],
        }),
      ],
    },
    {
      name: '02 Auth',
      item: [
        request('Login Student (María)', 'POST', '/api/auth/login', {
          body: jsonBody({
            email: '{{studentEmail}}',
            password: '{{studentPassword}}',
          }),
          tests: [
            ...testLines(200),
            schemaTest('login', 'login-response'),
            'const body = pm.response.json();',
            "pm.collectionVariables.set('token', body.token);",
            "pm.collectionVariables.set('userId', body.user.id);",
            "pm.collectionVariables.set('universityId', body.user.university_id);",
          ],
        }),
        request('Login Carlos', 'POST', '/api/auth/login', {
          body: jsonBody({ email: '{{carlosEmail}}', password: '{{carlosPassword}}' }),
          tests: [
            ...testLines(200),
            'const body = pm.response.json();',
            "pm.collectionVariables.set('carlosToken', body.token);",
            "pm.collectionVariables.set('carlosUserId', body.user.id);",
          ],
        }),
        request('Login Admin', 'POST', '/api/auth/login', {
          body: jsonBody({ email: '{{adminEmail}}', password: '{{adminPassword}}' }),
          tests: [
            ...testLines(200),
            "pm.collectionVariables.set('adminToken', pm.response.json().token);",
          ],
        }),
        request('Login inválido', 'POST', '/api/auth/login', {
          body: jsonBody({ email: '{{studentEmail}}', password: 'wrong-password' }),
          tests: [
            ...testLines(401),
            schemaTest('error', 'api-error'),
          ],
        }),
        request('Register usuario único', 'POST', '/api/auth/register', {
          prerequest: [
            "const email = `test+${pm.collectionVariables.get('runId')}@uniempresarial.edu.co`;",
            "pm.collectionVariables.set('registeredEmail', email);",
          ],
          body: jsonBody({
            university_id: '{{universityId}}',
            full_name: 'Usuario Prueba API',
            email: '{{registeredEmail}}',
            password: '{{registeredPassword}}',
          }),
          tests: [
            ...testLines(201),
            schemaTest('register', 'register-response'),
            "pm.collectionVariables.set('registeredUserId', pm.response.json().user.id);",
          ],
        }),
        request('Login usuario registrado', 'POST', '/api/auth/login', {
          body: jsonBody({
            email: '{{registeredEmail}}',
            password: '{{registeredPassword}}',
          }),
          tests: [
            ...testLines(200),
            "pm.collectionVariables.set('registeredToken', pm.response.json().token);",
          ],
        }),
        request('Change password (nueva)', 'PATCH', '/api/auth/change-password', {
          tokenVar: 'registeredToken',
          body: jsonBody({
            current_password: '{{registeredPassword}}',
            new_password: '{{tempPassword}}',
          }),
          tests: [
            ...testLines(200),
            "pm.test('mensaje de éxito', () => pm.expect(pm.response.json().message).to.be.a('string'));",
          ],
        }),
        request('Change password (revertir)', 'PATCH', '/api/auth/change-password', {
          tokenVar: 'registeredToken',
          body: jsonBody({
            current_password: '{{tempPassword}}',
            new_password: '{{registeredPassword}}',
          }),
          tests: [...testLines(200)],
        }),
      ],
    },
    {
      name: '03 Universities',
      item: [
        request('GET /api/universities', 'GET', '/api/universities', {
          tests: [
            ...testLines(200),
            'pm.test("es array", () => pm.expect(pm.response.json()).to.be.an("array"));',
            'pm.test("hay al menos una universidad", () => pm.expect(pm.response.json().length).to.be.above(0));',
            `pm.test('Contrato university', () => {`,
            `  const first = pm.response.json()[0];`,
            `  pm.expect(first).to.have.property('id');`,
            `  pm.expect(first).to.have.property('email_domain');`,
            `  if (!pm.collectionVariables.get('universityId')) {`,
            `    pm.collectionVariables.set('universityId', first.id);`,
            `  }`,
            '});',
          ],
        }),
        request('POST /api/universities (admin)', 'POST', '/api/universities', {
          tokenVar: 'adminToken',
          prerequest: [
            "const runId = pm.collectionVariables.get('runId');",
            "pm.collectionVariables.set('newUniversityDomain', `testuni-${runId}.edu.co`);",
          ],
          body: jsonBody({
            name: 'Universidad Prueba API',
            email_domain: '{{newUniversityDomain}}',
            subscription_start: '2026-01-01T00:00:00.000Z',
            subscription_end: '2026-12-31T23:59:59.999Z',
          }),
          tests: [
            ...testLines(201),
            schemaTest('university', 'university'),
            "pm.collectionVariables.set('newUniversityId', pm.response.json().id);",
          ],
        }),
        request('PATCH /api/universities/:id/status (admin)', 'PATCH', '/api/universities/{{newUniversityId}}/status', {
          tokenVar: 'adminToken',
          body: jsonBody({ status: 'inactive' }),
          tests: [
            ...testLines(200),
            "pm.test('estado actualizado', () => pm.expect(pm.response.json().subscription_status).to.eql('inactive'));",
          ],
        }),
      ],
    },
    {
      name: '04 Upload',
      item: [
        request('POST /api/upload/product-image', 'POST', '/api/upload/product-image', {
          tokenVar: 'token',
          prerequest: skipExternalScript(),
          formdata: [
            {
              key: 'image',
              type: 'file',
              src: path.join('postman', 'fixtures', 'sample.jpg').replace(/\\/g, '/'),
            },
          ],
          tests: [
            ...testLines(201),
            "const body = pm.response.json();",
            "pm.collectionVariables.set('image_url', body.image_url);",
            "pm.collectionVariables.set('image_public_id', body.image_public_id || '');",
            "pm.test('image_url presente', () => pm.expect(body.image_url).to.be.a('string'));",
          ],
        }),
      ],
    },
    {
      name: '05 Products',
      item: [
        request('POST /api/products (Carlos)', 'POST', '/api/products', {
          tokenVar: 'carlosToken',
          prerequest: [
            "const runId = pm.collectionVariables.get('runId');",
            "pm.collectionVariables.set('productName', `Producto API ${runId}`);",
          ],
          body: jsonBody({
            name: '{{productName}}',
            description: 'Producto creado por pruebas Newman',
            price: 12000,
            is_donation: false,
            category: 'microcontrollers',
            condition: 'good',
            image_url: '{{image_url}}',
            image_public_id: '{{image_public_id}}',
          }),
          tests: [
            ...testLines(201),
            schemaTest('product', 'product'),
            "pm.collectionVariables.set('flowProductId', pm.response.json().id);",
          ],
        }),
        request('GET /api/products/:id (flujo)', 'GET', '/api/products/{{flowProductId}}', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            schemaTest('product', 'product'),
            "pm.test('producto del flujo', () => pm.expect(pm.response.json().id).to.eql(pm.collectionVariables.get('flowProductId')));",
          ],
        }),
        request('GET /api/products', 'GET', '/api/products', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            'pm.test("es array", () => pm.expect(pm.response.json()).to.be.an("array"));',
          ],
        }),
        request('GET /api/products/mine', 'GET', '/api/products/mine', {
          tokenVar: 'token',
          tests: [...testLines(200)],
        }),
        request('POST /api/products/generate-description', 'POST', '/api/products/generate-description', {
          tokenVar: 'token',
          prerequest: [...skipExternalScript(), ...skipGroqScript()],
          formdata: [
            {
              key: 'image',
              type: 'file',
              src: path.join('postman', 'fixtures', 'sample.jpg').replace(/\\/g, '/'),
            },
          ],
          tests: [
            ...testLines(200),
            "pm.test('description generada', () => pm.expect(pm.response.json().description).to.be.a('string'));",
          ],
        }),
        request('GET /api/products/:id sin token', 'GET', '/api/products/{{flowProductId}}', {
          tests: [...testLines(401), schemaTest('error', 'api-error')],
        }),
      ],
    },
    {
      name: '06 Reservations',
      item: [
        request('POST /api/reservations producto propio (400)', 'POST', '/api/reservations', {
          tokenVar: 'carlosToken',
          body: jsonBody({ product_id: '{{flowProductId}}' }),
          tests: [...testLines(400), schemaTest('error', 'api-error')],
        }),
        request('POST /api/reservations (María)', 'POST', '/api/reservations', {
          tokenVar: 'token',
          body: jsonBody({ product_id: '{{flowProductId}}' }),
          tests: [
            ...testLines(201),
            schemaTest('reservation', 'reservation'),
          ],
        }),
        request('GET /api/reservations', 'GET', '/api/reservations', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            'pm.test("es array", () => pm.expect(pm.response.json()).to.be.an("array"));',
            "pm.test('incluye reserva del flujo', () => {",
            "  const ids = pm.response.json().map((r) => r.product_id);",
            "  pm.expect(ids).to.include(pm.collectionVariables.get('flowProductId'));",
            '});',
          ],
        }),
      ],
    },
    {
      name: '07 Chats',
      item: [
        request('POST /api/chats', 'POST', '/api/chats', {
          tokenVar: 'token',
          body: jsonBody({ product_id: '{{flowProductId}}' }),
          tests: [
            ...testLines(201),
            schemaTest('chat', 'chat'),
            "pm.collectionVariables.set('chatId', pm.response.json().id);",
          ],
        }),
        request('GET /api/chats', 'GET', '/api/chats', {
          tokenVar: 'token',
          tests: [...testLines(200)],
        }),
        request('GET /api/chats/:id', 'GET', '/api/chats/{{chatId}}', {
          tokenVar: 'token',
          tests: [...testLines(200), schemaTest('chat', 'chat')],
        }),
        request('POST mensaje texto', 'POST', '/api/chats/{{chatId}}/messages', {
          tokenVar: 'token',
          body: jsonBody({ type: 'text', content: 'Hola, ¿sigue disponible?' }),
          tests: [
            ...testLines(201),
            schemaTest('message', 'message'),
            "pm.collectionVariables.set('messageId', pm.response.json().id);",
          ],
        }),
        request('GET /api/chats/:id/messages', 'GET', '/api/chats/{{chatId}}/messages', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            'pm.test("mensajes array", () => pm.expect(pm.response.json()).to.be.an("array"));',
          ],
        }),
        request('POST mensaje appointment', 'POST', '/api/chats/{{chatId}}/messages', {
          tokenVar: 'token',
          body: jsonBody({
            type: 'appointment',
            appointment: {
              day: 'Lunes 10',
              time: '10:00',
              location: 'Biblioteca central',
            },
          }),
          tests: [
            ...testLines(201),
            schemaTest('message', 'message'),
            "pm.collectionVariables.set('appointmentMessageId', pm.response.json().id);",
          ],
        }),
        request('PATCH appointment accept (Carlos)', 'PATCH', '/api/chats/{{chatId}}/messages/{{appointmentMessageId}}/appointment', {
          tokenVar: 'carlosToken',
          body: jsonBody({ action: 'accept' }),
          tests: [...testLines(200)],
        }),
        request('PATCH confirm-delivery (Carlos)', 'PATCH', '/api/chats/{{chatId}}/confirm-delivery', {
          tokenVar: 'carlosToken',
          tests: [
            ...testLines(200),
            "pm.test('entrega confirmada', () => pm.expect(pm.response.json().message).to.include('Entrega confirmada'));",
          ],
        }),
      ],
    },
    {
      name: '08 Transactions',
      item: [
        request('GET /api/transactions (María)', 'GET', '/api/transactions', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            'pm.test("historial compras", () => pm.expect(pm.response.json().length).to.be.above(0));',
          ],
        }),
        request('GET /api/transactions (Carlos)', 'GET', '/api/transactions', {
          tokenVar: 'carlosToken',
          tests: [
            ...testLines(200),
            'pm.test("historial ventas", () => pm.expect(pm.response.json().length).to.be.above(0));',
          ],
        }),
      ],
    },
    {
      name: '09 Notifications',
      item: [
        request('GET /api/notifications', 'GET', '/api/notifications', {
          tokenVar: 'token',
          tests: [
            ...testLines(200),
            "pm.test('Contrato notifications-response', () => {",
            '  const payload = pm.response.json();',
            "  pm.expect(payload).to.have.property('notifications');",
            "  pm.expect(payload).to.have.property('unread');",
            "  pm.expect(payload.notifications).to.be.an('array');",
            '});',
            'const notifPayload = pm.response.json();',
            'if (notifPayload.notifications.length > 0) {',
            "  pm.collectionVariables.set('notificationId', notifPayload.notifications[0].id);",
            '}',
          ],
        }),
        request('PATCH /api/notifications/read-all', 'PATCH', '/api/notifications/read-all', {
          tokenVar: 'token',
          tests: [...testLines(200)],
        }),
        request('PATCH /api/notifications/:id/read', 'PATCH', '/api/notifications/{{notificationId}}/read', {
          tokenVar: 'token',
          prerequest: [
            "if (!pm.collectionVariables.get('notificationId')) {",
            "  pm.execution.skipRequest();",
            '}',
          ],
          tests: [...testLines(200)],
        }),
      ],
    },
    {
      name: '10 Cleanup',
      item: [
        request('DELETE /api/products/:id (omitido si vendido)', 'DELETE', '/api/products/{{flowProductId}}', {
          tokenVar: 'carlosToken',
          prerequest: [
            '// Tras confirm-delivery el producto queda vendido y no se puede eliminar',
            'pm.execution.skipRequest();',
          ],
          tests: [],
        }),
      ],
    },
  ],
};

const outPath = path.join(ROOT, 'repensa-postman-collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`Colección generada: ${outPath}`);
