import { FastifyInstance } from 'fastify';

const CORE_API_URL = process.env.CORE_API_URL ?? 'http://localhost:3001';

async function appHealthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    return reply
      .code(200)
      .send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // app.get('/api-health', async (_request, reply) => {
  //   try {
  //     const res = await fetch(`${CORE_API_URL}/health`);

  //     if (!res.ok) {
  //       return reply.code(503).send({
  //         status: 'error',
  //         upstream: { core: 'down' },
  //       });
  //     }

  //     return reply.code(200).send({
  //       status: 'ok',
  //       upstream: { core: 'up' },
  //     });
  //   } catch {
  //     return reply.code(503).send({
  //       status: 'error',
  //       upstream: { core: 'unreachable' },
  //     });
  //   }
  // });
}

export { appHealthRoutes };
