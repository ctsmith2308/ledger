import { FastifyInstance } from 'fastify';

async function webhookRoutes(app: FastifyInstance) {
  app.get('/webhook', async (_request, reply) => {
    return reply
      .code(200)
      .send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}

export { webhookRoutes };
