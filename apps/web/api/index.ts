import { handle } from '@hono/node-server/vercel';
import { app } from '../__create/index';

export default handle(app);
