'use strict';

const KoaRouter = require('koa-router');
const pluralize = require('pluralize');
const presenter = require('./presenter');
const _ = require('lodash');

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
class ParkesRouter extends KoaRouter {
	constructor(opts) {
		super();
		this.$$options = opts || {};
		const options = this.$$options;

		options.presentArray = presenter.presentArray;
		options.presentRecord = presenter.presentRecord;

		if (!(options.nested || options.noHeaders)) {
			this.use(poweredBy());
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
		if (!controller) throw new Error('Value of controller cannot be null');

		// Proper singular / plural
		const collectionName = pluralize(name);
		const itemName = pluralize.singular(name);

		// Allow methods to be omitted
		if (!Array.isArray(methods)) {
			// eslint-disable-next-line no-param-reassign
			nestedFunc = methods;
			// eslint-disable-next-line no-param-reassign
			// eslint-disable-next-line no-param-reassign
			methods = null;
		}

		const nestedMethods = this.$$options.inParent ? ['index', 'create'] :
			['show', 'update', 'destroy'];
		const allMethods = ['show', 'index', 'create', 'update', 'destroy'];

		const selectedMethods = methods || (this.$$options.nested ? nestedMethods : allMethods);

		const routes = {
			index: ['get', `/${collectionName}`, controller.index, this.$$options.presentArray],
			show: ['get', `/${collectionName}/:${itemName}`, controller.show, this.$$options.presentRecord],
			create: ['post', `/${collectionName}`, controller.create, this.$$options.presentRecord],
			update: ['patch', `/${collectionName}/:${itemName}`, controller.update, this.$$options.presentRecord],
			destroy: ['delete', `/${collectionName}/:${itemName}`, controller.destroy, this.$$options.presentRecord],
		};

		// Bind method to controller
		Object.keys(routes).forEach((routeName) => {
			const route = routes[routeName];
			if (route[2]) {
				route[2] = _.bind(route[2], controller);
			}
		});

		selectedMethods.forEach((route) => {
			const args = routes[route];
			if (!args) throw new Error(`(${name}) Unknown action ${route}. (Valid actions are ${allMethods.join(', ')})`);

			const controllerMethod = args[2];
			if (!controllerMethod) throw new Error(`Controller for resource ${name} has no ${route} method`);

			const httpMethod = args.shift();
			this[httpMethod](...args);
		});

		// Callback for nesting resources
		if (nestedFunc) {
			const resource = new ParkesRouter({ nested: true, inParent: true });
			nestedFunc(resource);
			this.use(`/${collectionName}/:${itemName}`, resource.routes());
		}

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

ParkesRouter.isPrivate = presenter.isPrivate;

module.exports = ParkesRouter;
