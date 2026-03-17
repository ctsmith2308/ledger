import { router } from '@/trpc/init';

import { register } from './register';

const identityRouter = router({ register });

export { identityRouter };
