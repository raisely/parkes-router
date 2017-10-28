const ParkesRouter = require('../index');

const context = describe;

describe('presenter', () => {
	describe('isPrivate', () => {
		context('when private=1', () => {
			it('is true', () => {
				const ctx = { query: { private: 1 } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).toBeTruthy();
			});
		});
		context('when private=false', () => {
			it('is false', () => {
				const ctx = { query: { private: false } };
				const result = ParkesRouter.isPrivate(ctx);
				expect(result).toBeFalsy();
			});
		});
	});
});
