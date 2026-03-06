import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Use import.meta.glob to find and bundle all route files at build time
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

function getHonoPath(path: string): string {
  // path is like '../src/app/api/contractors/route.js'
  const parts = path.split('/');
  const apiIndex = parts.indexOf('api');
  const routeParts = parts.slice(apiIndex + 1, -1); // segments between 'api' and 'route.js'

  if (routeParts.length === 0) return '/';

  return '/' + routeParts.map(segment => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...' ? `:${param}{.+}` : `:${param}`;
    }
    return segment;
  }).join('/');
}

async function registerRoutes() {
  // Clear existing routes if needed (though usually not necessary in prod)
  api.routes = [];

  for (const path in routeModules) {
    const route: any = routeModules[path];
    const honoPath = getHonoPath(path);

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      if (route[method]) {
        const handler: Handler = async (c) => {
          const params = c.req.param();
          return await route[method](c.req.raw, { params });
        };

        const m = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
        api[m](honoPath, handler);
      }
    }
  }
}

// Register all routes
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept((newSelf) => {
    registerRoutes().catch((err) => {
      console.error('Error reloading routes:', err);
    });
  });
}

export { api, API_BASENAME };
