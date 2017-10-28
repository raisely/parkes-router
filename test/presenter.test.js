const ParkesRouter = require('../index');
const { expect } = require('chai');

const context = describe;

/* eslint-disable no-unused-expressions */

describe('presenter', () => {
	describe('isPrivate', () => {
		context('when private=1', () => {
			it('is true', () => {
				const ctx = { query: { private: 1 } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).to.be.true;
			});
		});
		context('when private=false', () => {
			it('is false', () => {
				const ctx = { query: { private: false } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).to.be.false;
			});
		});
	});
});
