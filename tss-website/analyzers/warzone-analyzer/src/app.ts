import { FastifyInstance } from 'fastify';

export default async function app(): Promise<FastifyInstance> {
  const fastify = fastify({ logger: true });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Proxy requests to Docker container
  fastify.post('/api/upload', async (request, reply) => {
    return request.raw.req.pipe(
      reply.raw,
      {
        headers: request.raw.headers,
        getHeader: (name) => request.raw.headers.get(name),
      },
    );
  });

  return fastify;
}
