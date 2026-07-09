import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { create } = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('groq-sdk', () => ({
  default: class GroqMock {
    chat = { completions: { create } };
  },
}));

import { expandSearchTerms, analyzeProductImage, GROQ_MODEL, VALID_CATEGORIES } from '../../../src/infrastructure/config/ai';

describe('ai config', () => {
  const originalApiKey = process.env.GROQ_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
  });

  afterEach(() => {
    process.env.GROQ_API_KEY = originalApiKey;
  });

  it('expone categorías válidas y modelo por defecto', () => {
    expect(VALID_CATEGORIES).toContain('other');
    expect(GROQ_MODEL).toBeTruthy();
  });

  it('expandSearchTerms devuelve vacío para consulta en blanco', async () => {
    await expect(expandSearchTerms('   ')).resolves.toEqual([]);
    expect(create).not.toHaveBeenCalled();
  });

  it('expandSearchTerms devuelve la consulta si no hay API key', async () => {
    delete process.env.GROQ_API_KEY;

    await expect(expandSearchTerms('Arduino')).resolves.toEqual(['Arduino']);
    expect(create).not.toHaveBeenCalled();
  });

  it('expandSearchTerms agrega términos devueltos por Groq', async () => {
    create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              terms: ['arduino uno', 'microcontrolador'],
            }),
          },
        },
      ],
    });

    const terms = await expandSearchTerms('Arduino');

    expect(create).toHaveBeenCalledOnce();
    expect(terms).toEqual(['arduino', 'arduino uno', 'microcontrolador']);
  });

  it('expandSearchTerms usa la consulta original si Groq falla', async () => {
    create.mockRejectedValue(new Error('network'));

    await expect(expandSearchTerms('Sensor')).resolves.toEqual(['Sensor']);
  });

  it('analyzeProductImage parsea la sugerencia devuelta por Groq', async () => {
    create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              name: 'Arduino Uno',
              description: 'Placa de desarrollo',
              category: 'microcontrollers',
              condition: 'good',
            }),
          },
        },
      ],
    });

    const suggestion = await analyzeProductImage('base64-image', 'image/jpeg');

    expect(suggestion).toEqual({
      name: 'Arduino Uno',
      description: 'Placa de desarrollo',
      category: 'microcontrollers',
      condition: 'good',
    });
  });

  it('analyzeProductImage devuelve valores por defecto si el JSON es inválido', async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: 'respuesta inválida' } }],
    });

    const suggestion = await analyzeProductImage('base64-image', 'image/jpeg');

    expect(suggestion).toEqual({
      name: 'Artículo',
      description: 'Artículo publicado para intercambio universitario.',
      category: 'other',
      condition: 'good',
    });
  });
});
