import { FastifyRequest, FastifyReply } from 'fastify';

async function authMiddleware(_request: FastifyRequest, _reply: FastifyReply) {
  // TODO: re-enable JWT verification before any non-local deployment
  return;
}

export { authMiddleware };
