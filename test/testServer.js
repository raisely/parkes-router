'use strict';

const Koa = require('koa');
const ParkesRouter = require('../index');
const MockController = require('./mockController');

const PORT = process.env.PORT || 3001;

const parentController = new MockController({ name: 'parent' });
const childController = new MockController({ name: 'child', actions: ['index', 'create'] });
const siblingController = new MockController({ name: 'sibling', actions: ['index', 'show'] });

const api = new ParkesRouter();
api
	.resource('parent', parentController, (nested) => {
		nested.resource('child', childController);
	})
	.resource('sibling', siblingController, ['index', 'show']);

async function errorHandler(ctx, next) {
	try {
		await next();
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
	}
}

const app = new Koa();

app
	.use(errorHandler)
	.use(api.routes());

const server = app.listen(PORT);

module.exports = server;
