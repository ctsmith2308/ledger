import { FastifyInstance } from 'fastify';

async function intelligenceRoutes(app: FastifyInstance) {
  app.get('/intelligence', async (_request, reply) => {
    return reply
      .code(200)
      .send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}

export { intelligenceRoutes };
