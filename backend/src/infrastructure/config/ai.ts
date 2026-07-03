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

const PROMPT = `Eres un asistente para una plataforma universitaria de intercambio de hardware electrónico llamada Re-Pensa Tech.

Analiza esta imagen de un componente electrónico y responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "name": "nombre corto del componente (máximo 60 caracteres)",
  "description": "descripción breve del componente, su uso típico en laboratorios universitarios y su estado visual aparente (máximo 200 caracteres)",
  "category": "una de estas opciones exactas: microcontrollers, sensors, memory, displays, cables, power, other",
  "condition": "una de estas opciones exactas: new, good, regular"
}

Criterios para condition:
- new: se ve sin uso, sin rayones ni desgaste
- good: uso moderado, funcional, pequeños desgastes
- regular: uso notable, rayones o desgaste visible

No incluyas texto fuera del JSON. No uses bloques de código. Solo el JSON.`;

const VALID_CATEGORIES = ['microcontrollers', 'sensors', 'memory', 'displays', 'cables', 'power', 'other'] as const;
const VALID_CONDITIONS = ['new', 'good', 'regular'] as const;

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
      name:        'Componente electrónico',
      description: 'Componente electrónico para uso universitario.',
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
          role: 'user',
          content: `Expande esta búsqueda de una plataforma de intercambio de hardware universitario. Devuelve SOLO un JSON válido con un array de 5 a 8 términos relacionados, útiles para encontrar productos. Usa palabras cortas y claras. Consulta: ${normalizedQuery}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 120,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned) as unknown;
      if (Array.isArray(parsed)) {
        const terms = parsed
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);

        if (terms.length > 0) {
          return Array.from(new Set([normalizedQuery.toLowerCase(), ...terms].slice(0, 8)));
        }
      }
    } catch {
      // fall back to a simple tokenized version
    }
  } catch {
    // fall back to the original query when the AI service is unavailable
  }

  return [normalizedQuery];
}
