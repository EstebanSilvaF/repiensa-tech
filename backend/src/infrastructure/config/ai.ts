import Groq from 'groq-sdk';

function readEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value;
}

export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() || 'meta-llama/llama-4-scout-17b-16e-instruct';

let client: Groq | null = null;

function getGroqClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: readEnv('GROQ_API_KEY') });
  }
  return client;
}

export interface ProductSuggestion {
  name:        string;
  description: string;
  category:    string;
  condition:   string;
}

export const VALID_CATEGORIES = [
  'microcontrollers', 'sensors', 'memory', 'displays', 'cables', 'power',
  'books_notes', 'lab_science', 'art_design', 'tools_hardware',
  'sports_fitness', 'clothing_accessories', 'furniture_decor',
  'musical_instruments', 'stationery_office', 'home_kitchen',
  'services', 'other',
] as const;

const VALID_CONDITIONS = ['new', 'good', 'regular'] as const;

const PROMPT = `Eres un asistente para Re-Pensa, una plataforma universitaria de compra, venta e intercambio de artículos entre estudiantes de CUALQUIER carrera: electrónica, libros, laboratorio, arte, herramientas, ropa, instrumentos musicales, útiles, deporte, muebles, cocina/hogar, servicios, y cualquier otra cosa.

Analiza esta imagen del artículo publicado y responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "name": "nombre corto y claro del artículo (máximo 60 caracteres)",
  "description": "descripción breve del artículo, su uso típico y su estado visual aparente (máximo 200 caracteres)",
  "category": "una de estas opciones exactas: ${VALID_CATEGORIES.join(', ')}",
  "condition": "una de estas opciones exactas: new, good, regular"
}

Criterios para condition:
- new: se ve sin uso, sin rayones ni desgaste
- good: uso moderado, funcional, pequeños desgastes
- regular: uso notable, rayones o desgaste visible

No incluyas texto fuera del JSON. No uses bloques de código. Solo el JSON.`;

function parseSuggestion(text: string): ProductSuggestion {
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const suggestion = JSON.parse(clean) as ProductSuggestion;

    if (!VALID_CATEGORIES.includes(suggestion.category as (typeof VALID_CATEGORIES)[number])) {
      suggestion.category = 'other';
    }
    if (!VALID_CONDITIONS.includes(suggestion.condition as (typeof VALID_CONDITIONS)[number])) {
      suggestion.condition = 'good';
    }

    return suggestion;
  } catch {
    return {
      name:        'Artículo',
      description: 'Artículo publicado para intercambio universitario.',
      category:    'other',
      condition:   'good',
    };
  }
}

export async function analyzeProductImage(base64Image: string, mimeType: string): Promise<ProductSuggestion> {
  const response = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  const text = response.choices[0]?.message?.content?.trim() ?? '';
  return parseSuggestion(text);
}

export async function expandSearchTerms(query: string): Promise<string[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return [normalizedQuery];
  }

  try {
    const response = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Respondes ÚNICAMENTE con un objeto JSON válido, sin explicaciones, sin markdown, sin texto adicional antes o después.',
        },
        {
          role: 'user',
          content: `Expande esta búsqueda de Re-Pensa, una plataforma universitaria donde estudiantes de CUALQUIER carrera compran, venden e intercambian artículos (electrónica, libros, laboratorio, arte, herramientas, ropa, instrumentos musicales, útiles, deporte, muebles, cocina/hogar, servicios, y cualquier otra cosa). Piensa en objetos concretos que un vendedor pondría en el título de su anuncio, incluyendo sinónimos, marcas comunes y variantes singular/plural. Consulta: "${normalizedQuery}"

Responde con este formato exacto: {"terms": ["termino1", "termino2", ...]} con 6 a 10 términos en español.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';

    try {
      const parsed = JSON.parse(text) as { terms?: unknown };
      const rawTerms = Array.isArray(parsed.terms) ? parsed.terms : [];

      const terms = rawTerms
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

      if (terms.length > 0) {
        return Array.from(new Set([normalizedQuery.toLowerCase(), ...terms].slice(0, 10)));
      }
    } catch (parseError) {
      console.error('Error parseando JSON de expandSearchTerms:', parseError, 'Texto recibido:', text);
    }
  } catch (err) {
    console.error('Error llamando a Groq en expandSearchTerms:', err);
  }

  return [normalizedQuery];
}