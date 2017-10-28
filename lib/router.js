'use strict';

import KoaRouter from 'koa-router';
import * as presenter from './presenter';

/**
  * @class ParkesRouter
  *
  * @description
  * Router to simply define restful resouces
  *
  * @example
  * api = new ParkesRouter();
  * api
  *		.get('/login', auth.login)
  * 	.use(auth.authenticate);
  *		.resource('user', userController, (nested) => {
  *			nested.resource('post', postController)
  *		})
  *		.resource('archive', archiveController, ['findAll', 'findOne'])
  */
class ParkesRouter {
	constructor(opts) {
		this.$$options = opts || {};
		const options = this.$$options;
		this.$$api = options.api || new KoaRouter(opts);

		options.presentArray = presenter.presentArray;
		options.presentRecord = presenter.presentRecord;

		if (!(options.nested || options.noHeaders)) {
			this.$$api.use(poweredBy());
		}
	}

	/**
	  * @method resource
	  * @description Shorthand for defining a RESTful resource
	  * @param {string} name Name of the resource
	  * @param {Object} controller An object that defines functions for the REST methods
	  * @param {Object} methods Optional list of methods to apply to the resource
	  * @param {function} nestedFunc Optional method to define nested resources with
	  * @return {ParkesRouter} The same router for chaining
	  */
	resource(name, controller, methods, nestedFunc) {
		// Proper singular / plural
		const path = `/${name}s`;

		// Allow methods to be omitted
		if (!Array.isArray(methods)) {
			// eslint-disable-next-line no-param-reassign
			nestedFunc = methods;
			// eslint-disable-next-line no-param-reassign
			// eslint-disable-next-line no-param-reassign
			methods = null;
		}

		const nestedMethods = ['findAll', 'create'];
		const allMethods = ['findOne', 'findAll', 'create', 'update', 'remove'];

		const selectedMethods = methods || this.$$options.nested ? nestedMethods : allMethods;

		const routes = {
			findAll: ['get', '/', controller.findAll, this.$$options.presentArray],
			findOne: ['get', `/:${name}`, controller.findOne, this.$$options.presentRecord],
			create: ['post', '/', controller.create, this.$$options.presentRecord],
			patch: ['update', `/:${name}`, controller.update, this.$$options.presentRecord],
			remove: ['delete', `/:${name}`, controller.remove, this.$$options.presentRecord],
		};

		const resource = new ParkesRouter({ nested: true });

		selectedMethods.forEach((route) => {
			const args = routes[route];

			const httpMethod = args.shift();
			resource[httpMethod](...args);
		});

		// Callback for nesting resources
		if (nestedFunc) nestedFunc(resource);

		// Mount this resource
		this.$$api.use(`/${path}`, resource.routes());

		return this;
	}
}

function poweredBy(name) {
	// eslint-disable-next-line no-param-reassign
	name = name || 'Parkes';

	return async (ctx, next) => {
		await next();
		ctx.set('X-Powered-By', name);
	};
}

// Methods that are chained (so response should be the ParkesRouter)
const chainingMethods = ['get', 'put', 'patch', 'post', 'delete', 'all', 'param',
	'use', 'redirect'];
// Methods where the return should be passed through to the caller
const passthroughMethods = ['routes', 'allowedMethods', 'route', 'url'];

// Define pass through methods for all of KoaRouters methods
[...chainingMethods, ...passthroughMethods].forEach((method) => {
	ParkesRouter.prototype[method] = function proxy(...args) {
		const response = this.api[method].call(this.api, ...args);

		return chainingMethods.includes(method) ? this : response;
	};
});

ParkesRouter.isPrivate = presenter.isPrivate;

module.exports = ParkesRouter;
