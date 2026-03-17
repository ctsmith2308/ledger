import { initTRPC } from '@trpc/server';

type Context = {
  headers: Headers;
};

const t = initTRPC.context<Context>().create();

const router = t.router;
const createCallerFactory = t.createCallerFactory;

export { t, router, createCallerFactory };
export type { Context };
