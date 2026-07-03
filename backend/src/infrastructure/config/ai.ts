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
      suggestion.condition