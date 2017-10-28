const ParkesRouter = require('../index');
const pluralize = require('pluralize');

const server = require("./testServer");
const request = require("supertest");


function shouldRouteCorrectly(name, actions, options) {
	const collectionName = pluralize(name);
	const id = pluralize.singular(name);

	const routes = {
		index: { method: 'get', path: `/${collectionName}` },
		show: { method: 'get', path: `/${collectionName}/${id}` },
		create: { method: 'post', path: `/${collectionName}/` },
		update: { method: 'patch', path: `/${collectionName}${id}` },
		remove: { method: 'delete', path: `/${collectionName}` },
	};

	routes.forEach((action) => {
		const route = routes[action];
		if (!route) throw new Error(`Unknown action ${action}`);

		describe(action, () => {
			beforeEach(() => {

			});
			const response = await req[route.method](route.path);

			expect(response.status).toEqual(200);
			expect(response.body.data.path).toEqual(route.path);
			expect(response.body.data.name).toEqual(route.name);
			expect(response.body.data.action).toEqual(action);
		})
	});
}

describe('ParkesRouter', () => {
	describe('isPrivate', () => {
		context('when private=1', () => {
			it('is true', () => {
				const ctx = { query: { private: 1 } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).to.be.true();
			});
		});
		context('when private=false', () => {
			it('is false', () => {
				const ctx = { query: { private: false } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).to.be.false();
			});
		});
	});

	describe('resource', () => {
		let req;

		beforeEach(() => {
			req = request(server);
		});

		afterEach(() => {
			server.close();
		})

		context('child', () => {
			const routes = ['index', 'create'];

			routes.forEach((route) => {
				shouldRouteCorrectly(route);
			});
			// it defines findAll and create
			// routes to public presenter
		});
		context('parent', () => {

		});
		context('limited actions', () => {
			const routes = ['index', 'show'];

			routes.forEach((route) => {
				shouldRouteCorrectly(route);
			});

			it('should not route to create', () => {

			});
		});
	});
});
