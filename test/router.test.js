const pluralize = require('pluralize');

const server = require('./testServer');
const describeApi = require('parkes-api-test');

function describeRoute(name, actions, options) {
	const collectionName = pluralize(name);
	const id = pluralize.singular(name);
	const { parent } = options;

	const prefix = parent ? `/${pluralize(parent)}/${pluralize.singular(parent)}` : '';

	const routes = {
		index: { method: 'get', path: `${prefix}/${collectionName}` },
		show: { method: 'get', path: `${prefix}/${collectionName}/${id}` },
		create: { method: 'post', path: `${prefix}/${collectionName}/` },
		update: { method: 'patch', path: `${prefix}/${collectionName}/${id}` },
		remove: { method: 'delete', path: `${prefix}/${collectionName}` },
	};
	const testRoutes = [];

	// Validate list of actions
	actions.forEach((action) => {
		if (!routes[action]) throw new Error(`Unknown action ${action}`);
	});

	Object.keys(routes).forEach((action) => {
		const route = routes[action];

		// Ensure correct routing
		if (actions.includes(action)) {
			if (action === 'index') {
				route.expect = {
					name,
					path: route.path,
					action: route.action,
					presentationMethod: 'toPublic',
				};
			}

			if (['index', 'show'].includes(action)) {
				testRoutes.push(privateAction(route));
			}
		} else {
			// Otherwise the route shouldn't be defined
			route.status = 404;
		}

		testRoutes.push(route);
	});

	describeApi(options.name || name, server, testRoutes);
}

describe('ParkesRouter', () => {
	describe('resource', () => {
		describeRoute('parent');
		describeRoute('child', ['index', 'create'], { parent: 'parent' });
		describeRoute('sibling', ['index', 'show'], { name: 'limited actions' });
	});
});

function privateAction(route) {
	const privateRoute = Object.assign({}, route);
	privateRoute.path += '?private=true';
	privateRoute.presentationMethod = 'toPrivate';
	return privateRoute;
}
