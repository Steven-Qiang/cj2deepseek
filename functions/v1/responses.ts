import { handleResponses } from '../../src/responses';

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  if (request.method === 'POST') {
    return handleResponses(request);
  }
  return new Response('Method Not Allowed', { status: 405 });
}
