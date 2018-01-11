A [Koa Router](https://github.com/alexmingoia/koa-router) extension supporting
dynamic CRUD resource nesting via controllers.

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

// include the controllers you need
const fruitController = require('./path/to/controller-1');
const appleController = require('./path/to/controller-2');
const dairyController = require('./path/to/controller-3');

// setup the parkes-router
const router = new ParkesRouter();
router
	.resource('fruit', fruitController, (parent) => {
		parent.resource('apple', appleController, ['index']);
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
pakes-router lets you use `router.resource()` to generate RESTful CRUD routes
and nest resources.

parkes-router expects controllers to have methods specific to the CRUD
actions it preforms.

| action | HTTP method | URL path | example |
| --- | --- | ---- |
| index | GET | _/resource_ | GET /apples |
| show | GET | _/resource/:resource_ | GET /apples/1 |
| create | POST | _/resource_ | POST /apples |
| update | PATCH | _/resource_ | PATCH /apples/1 |
| destroy | DELETE | _/resource/:resource_ | DELETE /apples/1 |

## Implementation

Collection names are automatically pluralized, so names such as `apple` will become
`apples` when mapped as endpoints.

For actions requiring a resource id (`create`, `update`, `destroy`), the route has a
parameter by the name of the resource (singular).
(eg `/apples/:apple`)

### Non nested resource

```js
// with all CRUD actions allowed
router.resource('collection-name', controller)

// bound to specific CRUD actions
router.resource('collection-name', controller, ['show', 'index', 'create', 'update', 'destroy'])
```

### Nested collection resource

When nesting resources, it is considered a best practice to only have a `create` and
`index` method for parent controllers. This allows the grouping of specifc items
(in example: `GET /fruit/1/apples`, `PATCH /apples/1`).

```js
router.resource('parent-controller', parentController, (parent) => {
	// child with all methods allowed
	parent.resource('child-controller-1', childController1);
	// child with limited CRUD actions
	parent.resource('child-controller-2', childController2, ['index', 'create', 'destroy']);
});
```

## Method overview

### GET `show`
Displays a specific item (by key) within a controller collection.
```js
parent.resource('collection', controller, ['show']);
// mounted as (GET) /collection/:key
```

### GET `index`
Displays a paginated item list within a controller collection.
```js
router.resource('collection', controller, ['index']);
// mounted as (GET) /collection
```

### POST `create`
Allows the creation of items within a controller collection.
```js
router.resource('collection', controller, ['create']);
// mounted as (POST) /collection
```

### PATCH `update`
Allows the updating of a specific item within a controller collection.
```js
router.resource('collection', controller, ['update']);
// mounted as (PATCH) /collection/:key
```

### DELETE `destroy`
Allows the deletion (or disabling) of a specific item within a controller collection.
```js
router.resource('collection', controller, ['destroy']);
// mounted as (DELETE) /collection/:key
```

© 2017 Agency Ventures
