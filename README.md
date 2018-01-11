A [Koa Router](https://github.com/alexmingoia/koa-router) extension supporting dynamic CRUD resource nesting with
[parkes-controllers](https://github.com/raisely/parkes-controller)

parkes-router helps reduce redundant syntax within resource routing by providing
a streamlined way to describe resources and it's supported methods (show, index,
create, update, and destroy).

## Dependencies
parkes-router is built for [koa 2](https://github.com/koajs/koa) and requires async/await in node 7.6

# Getting Started

`npm install --save raisely/parkes-router`

```js
const Koa = require('koa');
const ParkesRouter = require('parkes-router');

// include the parkes-controllers you need
const fruitController = require('./path/to/parkes/controller-1');
const appleController = require('./path/to/parkes/controller-2');
const dairyController = require('./path/to/parkes/controller-3');


// setup the parkes-router
const router = new ParkesRouter();
router
	.resource('fruit', fruitController, (campaign) => {
		campaign.resource('apples', appleController, ['index']);
	})
	.resource('dairy', dairyController, ['create', 'index', 'show']);


// bind it to your Koa instance
const app = new Koa();
app
	.use(bodyparser)
	.use(router.routes());


// could also be mounted just like Koa Router
const mount = require('koa-mount');
app.use(mount('/v1', router.routes()));

```
# Usage
pakes-router allows you to utilize a custom `router.resource()` method allowing the nesting
and chaning of parkes-controllers together, which can be limited to specific CRUD
actions.

## Implementation

### Non nested resource

```js
// with all CRUD actions allowed
router.resource('collection-name', parkesController)

// bound to specific CRUD actions
router.resource('collection-name', parkesController, ['show', 'index', 'create', 'update', 'destroy'])
```

### Nested collection resource

```js
router.resource('parent-controller', parentParkesController, (parent) => {
	// child with all methods allowed
	parent.resource('child-controller-1', childParkesController1);
	// child with limited CRUD actions
	parent.resource('child-controller-2', childParkesController2, ['index', 'create', 'destroy']);
});
```

## Method overview

### GET `show`
Displays a specific item (by key) within a parkes-controller collection.
```js
parent.resource('collection', controller, ['show']);
// mounted as (GET) /collection/:key
```

### GET `index`
Displays a paginated item list within a parkes-controller collection.
```js
router.resource('collection', controller, ['index']);
// mounted as (GET) /collection
```

### GET `show`
Displays a specific item (by key) within a parkes-controller collection.
```js
router.resource('collection', controller, ['show']);
// mounted as (GET) /collection/:key
```

### POST `create`
Allows the creation of items within a parkes-controller collection.
```js
router.resource('collection', controller, ['create']);
// mounted as (POST) /collection
```

### PUT or PATCH `update`
Allows the updating of a specific item within a parkers-controller collection.
```js
router.resource('collection', controller, ['update']);
// mounted as (PUT & PATCH) /collection/:key
```

### DELETE `destroy`
Allows the deletion (or disabling) of a specific item within a parkers-controller collection.
```js
router.resource('collection', controller, ['destroy']);
// mounted as (DELETE) /collection/:key
```

© 2017 Agency Ventures
