'use strict';

const _ = require('lodash');

/**
  * Helper function to determine if a request is private
  * @param {koa-request} ctx The context of the request/response
  * @return True if the request query string contains ?private=1
  */
function isPrivate(ctx) {
	return ctx.query.private && ctx.query.private !== 'false';
}

/**
  * Helper to present a record as JSON
  * Checks to see if the request is for private or public and calls
  * record.toPrivate() or record.toPublic() respectively placing the
  * result on ctx.body.data
  *
  * @param {koa-request} ctx Koa request context
  * @param {Model} ctx.state.data Model that responds to toPublic/toPrivate
  * @param {async function} next Next middleware
  */
async function presentRecord(ctx, next) {
	const method = isPrivate(ctx) ? 'toPrivate' : 'toPublic';

	const data = await ctx.state.data[method]()

	ctx.body = {
		data
	};

	await next();
}

/**
  * Helper to present an array of records
  * Checks to see if the request is for private or public and maps the array
  * in ctx.state.body.data calling toPrivate() or toPublic() on each
  * element
  *
  * @param {koa-request} ctx Koa request context
  * @param {Model[]} ctx.state.data.collection Array of records that respond to toPublic/toPrivate
  * @param {object} ctx.state.data.pagination Pagination information
  * @param {async function} next Next middleware
  */
async function presentArray(ctx, next) {
	const method = isPrivate(ctx) ? 'toPrivate' : 'toPublic';

	let collection = ctx.state.data.collection.map(r => r[method]());
	collection = await Promise.all(collection);

	ctx.body = _.omit(ctx.state.data, ['collection']);
	ctx.body.data = collection;

	await next();
}

module.exports = {
	presentArray,
	presentRecord,
	isPrivate,
};
