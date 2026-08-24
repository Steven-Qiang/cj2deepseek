import { AVAILABLE_MODELS, CORS_HEADERS } from './utils';

export function handleModels(): Response {
  const data = {
    object: 'list',
    data: AVAILABLE_MODELS.map((id) => ({
      id,
      object: 'model',
      created: 1740000000,
      owned_by: 'system',
      permission: [],
    })),
  };

  return new Response(JSON.stringify(data), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
