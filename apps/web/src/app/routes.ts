import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

type Tree = {
	path: string;
	children: Tree[];
	hasPage: boolean;
};

function generateRoutes(node: Tree): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	if (node.hasPage) {
		const componentPath = `./${node.path ? node.path + '/' : ''}page.jsx`;

		if (node.path === '') {
			routes.push(index(componentPath));
		} else {
			// Handle parameter routes
			let routePath = node.path;

			// Replace all parameter segments in the path
			const segments = routePath.split('/');
			const processedSegments = segments.map((segment) => {
				if (segment.startsWith('[') && segment.endsWith(']')) {
					const paramName = segment.slice(1, -1);

					// Handle catch-all parameters (e.g., [...ids] becomes *)
					if (paramName.startsWith('...')) {
						return '*'; // React Router's catch-all syntax
					}
					// Handle regular parameters (e.g., [id] becomes :id)
					return `:${paramName}`;
				}
				return segment;
			});

			routePath = processedSegments.join('/');
			routes.push(route(routePath, componentPath));
		}
	}

	for (const child of node.children) {
		routes.push(...generateRoutes(child));
	}

	return routes;
}

// Use lazy glob to avoid importing the modules here
const pages = import.meta.glob('./**/page.jsx');

const root: Tree = { path: '', children: [], hasPage: false };
const treeMap: Record<string, Tree> = { '': root };

for (const path in pages) {
	// path is like './account/logout/page.jsx' or './page.jsx'
	const relativePath = path.replace('./', '').replace('/page.jsx', '');

	if (path === './page.jsx' || relativePath === 'page.jsx') {
		root.hasPage = true;
		continue;
	}

	const segments = relativePath.split('/').filter(Boolean);
	let currentPath = '';

	for (const segment of segments) {
		const parentPath = currentPath;
		currentPath = currentPath ? `${currentPath}/${segment}` : segment;

		if (!treeMap[currentPath]) {
			const newNode: Tree = { path: currentPath, children: [], hasPage: false };
			treeMap[currentPath] = newNode;
			treeMap[parentPath].children.push(newNode);
		}
	}

	if (treeMap[currentPath]) {
		treeMap[currentPath].hasPage = true;
	}
}

const notFound = route('*?', './__create/not-found.tsx');
const routes = [...generateRoutes(root), notFound];

export default routes;
