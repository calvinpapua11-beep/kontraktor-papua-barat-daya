import { handle } from '@hono/node-server/vercel';
import server from '../__create/index';

export default handle(server);
