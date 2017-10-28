const pluralize = require('pluralize');
const _ = require('lodash');

const server = require('./testServer');
const describeApi = require('parkes-api-test');

function describeRoute(name, actions, options = {}) {
	const collectionName = pluralize(name);
	const id = pluralize.singular(name);
	const { parent } = options;

	const prefix = parent ? `/${pluralize(parent)}/${pluralize.singular(parent)}` : '';

	const routes = {
		index: { method: 'get', path: `${prefix}/${collectionName}` },
		show: { method: 'get', path: `${prefix}/${collectionName}/${id}` },
		create: { method: 'post', path: `${prefix}/${collectionName}/` },
		update: { method: 'patch', path: `${prefix}/${collectionName}/${id}` },
		remove: { method: 'delete', path: `${prefix}/${collectionName}/${id}` },
	};
	const testRoutes = [];

	// eslint-disable-next-line no-param-reassign
	actions = actions || Object.keys(routes);

	// Validate list of actions
	actions.forEach((action) => {
		if (!routes[action]) throw new Error(`Unknown action ${action}`);
	});

	Object.keys(routes).forEach((action) => {
		const route = routes[action];

		// Ensure correct routing
		if (actions.includes(action)) {
			route.expect = {
				action,
				name,
				params: {},
				path: route.path,
				presentationMethod: 'toPublic',
			};

			if (['show', 'update', 'delete'].includes(action)) {
				route.expect.params[id] = id;
			}

			// Expect collection from index
			if (action === 'index') route.expect = [route.expect];

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
	const privateRoute = _.cloneDeep(route);
	privateRoute.path += '?private=true';
	if (Array.isArray(privateRoute.expect)) {
		privateRoute.expect[0].presentationMethod = 'toPrivate';
	} else {
		privateRoute.expect.presentationMethod = 'toPrivate';
	}
	return privateRoute;
}
