const _ = require('lodash');

const defaultActions = ['index', 'show', 'create', 'update', 'remove'];

class MockController {
	constructor(options) {
		this.options = options || {};

		const actions = this.options.actions || defaultActions;

		actions.forEach((action) => {
			this[action] = async function actionFunction(ctx, next) {
				const data = new SimpleRecord({ action });
				data.name = options.name;
				data.path = ctx.request.path;
				Object.assign(data, _.pick(ctx, ['query', 'params']));

				// Index must pass data as an array
				if (action === 'index') {
					ctx.state = { collection: [data] };
				} else {
					ctx.state = { data };
				}

				await next();
			};
		});
	}
}

/**
  * @description
  * A simple object that provides toPublic
  */
class SimpleRecord {
	constructor(values) {
		if (values) Object.assign({}, values);
	}
}

// Create simple methods for presenter to succeed
['toPublic', 'toPrivate'].forEach((method) => {
	SimpleRecord[method] = function addMethodName() {
		this.presentationMethod = method;
		return this;
	};
});

module.exports = MockController;
