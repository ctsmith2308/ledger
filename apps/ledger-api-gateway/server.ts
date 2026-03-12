import { buildApp } from './app';
// import { getSecrets } from './utils/secrets';

async function start() {
  // TODO;
  // Pull secrets before anything initializes

  const app = await buildApp();

  await app.listen({ port: 3000, host: '::' });

  console.log('Gateway running on :3000');
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
