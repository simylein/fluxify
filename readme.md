# fluxify

## a neat little library powered by bun for building apis.

## learning by doing

- [scripts](#scripts)
- [bootstrap](#bootstrap)
- [entities](#entities)
- [services](#services)
- [controllers](#controllers)
- [authentication](#authentication)
- [logging](#logging)
- [seeding](#seeding)
- [documentation](#documentation)

## api reference

- [lib/auth](#auth)
- [lib/config](#config)
- [lib/core](#core)
- [lib/database](#database)
- [lib/docs](#docs)
- [lib/events](#events)
- [lib/exception](#exception)
- [lib/fake](#fake)
- [lib/logger](#logger)
- [lib/repository](#repository)
- [lib/router](#router)
- [lib/validation](#validation)

## learning by doing section

### create a new fluxify project

```sh
bun create simylein/fluxify
```

Please take a look at the little todo app example in the src directory for some basic examples on usage. If you would like to start fresh delete everything in the `src` directory and make sure to keep the `lib` one which is the library. Then create a `main.ts` file inside the `src` directory which will become your entrypoint.

### scripts

- `bun fmt` formats your code using prettier
- `bun lint` lints your code using eslint
- `bun check` type checks your code using tsc
- `bun bundle` bundles your code for portability
- `bun test:dev` runs your tests with hot reload
- `bun test:prod` runs your tests for production
- `bun start:dev` starts your http server with hot reload
- `bun start:prod` starts your http server for production
- `bun schema:init` initializes an new empty database
- `bun schema:drop` drops all registered tables
- `bun schema:sync` syncs all registered tables
- `bun schema:seed` runs all registered seeds

### config

configuration is done by environment variables in the `.env` file.
you can find an example in the `example.env` file.
default values are given below and will be used if none are provided.

`PORT=4000` the server will run on this port, the port must not be occupied
`NAME=fluxify` the name of you app, put anything you like, this will show in logs

`ALLOW_ORIGIN=*` used for cors, put your frontend address there, the star is a wildcard
`GLOBAL_PREFIX=` if you would like to prefix all your routes, should start with a slash

`JWT_SECRET=random` keep this secret, use a strong random value
`JWT_EXPIRY=1600` after that many seconds your token will expire

`CACHE_TTL=0` your cache's time to live in seconds, 0 means disabled
`CACHE_LIMIT=0` the maximum amount of items in the cache, 0 means disabled

`THROTTLE_TTL=0` your throttle's time to live in seconds, 0 means disabled
`THROTTLE_LIMIT=0` how many requests a single ip may do in the given ttl, 0 means disabled

`DATABASE_PATH=:memory:` provide a file path to a database on your system
`DATABASE_MODE=readwrite` can either be readwrite or readonly

`LOG_LEVEL=info` can be one of trace debug info warn error, trace will log the most info
`LOG_REQUESTS=false` set to true for logging incoming requests, useful in development
`LOG_RESPONSES=false` set to true for logging outgoing responses, useful in development

### bootstrap

to start up a fluxify http server use

`main.ts`

```ts
import { bootstrap } from 'lib/core';
// import any controllers you plan on using
// import './auth/auth.controller.ts';

bootstrap();
```

`bootstrap` returns a `FluxifyServer` object which enables you to build custom logging

`main.ts`

```ts
import { bootstrap } from 'lib/core';

const server = bootstrap();
server.logger({
	res: ({ id, timestamp, status, time }) => {
		console.log('fires on response', { id, timestamp, status, time });
	},
	info: ({ timestamp, message, context }) => {
		console.log('fires on info', { timestamp, message, context });
	},
});
```

you can also register global headers which will be sent in every response

`main.ts`

```ts
import { bootstrap } from 'lib/core';

const server = bootstrap();
server.header({ 'cache-control': 'no-cache' });
```

for those who do not like json feel free to override request and response serialization

`main.ts`

```ts
import { bootstrap } from 'lib/core';

const server = bootstrap();
server.serialize({ req: (request) => 'hello', res: (body) => 'world' });
```

### entities

every entity has to have an `id: primary()` column

`user.entity.ts`

```ts
import { Infer, column, entity, primary } from 'lib/database';

export const userEntity = entity('user', {
	id: primary('uuid'),
	username: column('varchar').length(16),
	password: column('varchar').length(64),
});

export type User = Infer<typeof userEntity>;
```

### services

use the repository to work with entities

`auth.service.ts`

```ts
import { repository } from 'lib/repository';
import { userEntity } from '../user/user.entity';
import { SignUpDto } from './dto/sign-up.dto';

const userRepository = repository(userEntity);

export const signUp = async (body: SignUpDto): Promise<void> => {
	await userRepository.insert(body);
};
```

### controllers

register routes

`auth.controller.ts`

```ts
import { router } from 'lib/router';

const app = router();

app.get('/hello', null, () => {
	return 'hello world'; // will become the response body
	return new Response(); // you can also directly control it
});
```

validate request bodies

`sign-up.dto.ts`

```ts
import { Infer, object, string } from 'lib/validation';

export const signUpDto = object({
	username: string().max(16),
	password: string().max(64),
});

export type SignUpDto = Infer<typeof signUpDto>;
```

`auth.controller.ts`

```ts
import { router } from 'lib/router';
import { signUp } from './auth.service';
import { signUpDto } from './dto/sign-up.dto';

const app = router('/auth');

app.post('/sign-up', { body: signUpDto }, ({ body }) => {
	return signUp(body); // enjoy the validated request body
});
```

validate query params

`user-query.dto.ts`

```ts
import { Infer, object, string } from 'lib/validation';

export const userQueryDto = object({
	username: string().optional().max(16),
});

export type UserQueryDto = Infer<typeof userQueryDto>;
```

`user.controller.ts`

```ts
import { router } from 'lib/router';
import { userQueryDto } from './dto/user-query.dto';
import { findUsers } from './user.service';

const app = router('/user');

app.get('', { query: userQueryDto }, ({ query }) => {
	return findUsers(query); // enjoy the validated query params
});
```

### authentication

require auth by adding the `jwt: jwtDto` in the schema

```ts
import { jwtDto } from 'lib/auth';
import { router } from 'lib/router';
import { findMe } from './auth.service';

const app = router('/auth');

app.get('/me', { jwt: jwtDto }, ({ jwt }) => {
	return findMe(jwt.id);
});
```

### logging

use the built in logger which also calls your custom logger

`any-service.service.ts`

```ts
import { debug, info, warn } from 'lib/logger';

debug('print a debug message');
info('print a info message');
warn('print a warn message');
```

### seeding

you can register seeds by naming a file `anything.seed.ts`

`user.seed.ts`

```ts
import { word, words } from 'lib/fake';
import { repository } from 'lib/repository';
import { userEntity } from '../user/user.entity';

const userRepository = repository(userEntity);

export const users = async (): Promise<void> => {
	await Promise.all(
		[
			...new Set(
				Array(8)
					.fill(null)
					.map(() => word(4)),
			),
		].map((username) => userRepository.insert({ username, password: words(4).split(' ').join('-') })),
	);
};
```

### documentation

you can return the openapi 3 standard in json

`docs.controller.ts`

```ts
import { generateDocs } from 'lib/docs';
import { router } from 'lib/router';

const app = router();

app.get('/docs', null, () => {
	return generateDocs();
});
```

## api reference section

### auth

`hash()` useful for hashing passwords. uses `createHash` from crypto under the hood

`signJwt()` signs json web tokens using the sha256 algorithm. depends on the configured `jwtSecret` and `jwtExpiry` from config. uses `createHmac` from crypto under the hood

`verifyJwt()` verifies json web tokens using the sha256 algorithm. depends on the configured `jwtSecret` and `jwtExpiry` from config. uses `createHmac` from crypto under the hood

`jwtDto` useful for marking a route with authentication. also performs validation to ensure proper content in jwt payload

### config

`config` holds the global configuration state of the application. change properties only if you know what you are doing

### core

`bootstrap()` used for bootstrapping the application

`FluxifyServer` the returned type from bootstrap

### database

`entity()` create entities by providing an table name and some columns. every entity needs at least an `id: primary()` column. pass the return to the `repository` for easy data manipulation

`primary()` this marks your id column as the primary key. uses non nullable uuids version 4

`column()` create database columns inside the `entity` function

`relation()` this marks a column as a foreign key. provide the entity you would like to relate against

`created()` creates a column which holds the date of creation of said row

`updated()` creates a column which holds the date of last update to said row

`deleted()` creates a column which holds the date on which the entity was soft deleted

`runQuery()` `selectMany()` `selectOne()` `insertOne()` raw methods in which you may write your sql directly. only use them if you cannot fulfill you needs using the `repository`

`Entity` the return type of the `entity` function

`Infer` provide any entity as the type argument for getting a inferred type which is bound to that entity. works like magic

### docs

`generateDocs()` returns a openapi v3 compliant spec of your api routes. return this from any route handler

### events

`subscribe()` used for server sent events. return this from a get route handler and provide a channel for listening

`emit()` emits an event with some optional data to the specified channel

### exception

`Accepted() NoContent() Unauthorized() Forbidden() NotFound() MethodNotAllowed() Conflict() Gone() IamTeapot() Locked() TooManyRequests() InternalServerError()` throw those for returning the corresponding http status codes. they accept an optional message which will override the default one

### fake

`word()` returns a random word from lorem ipsum with the specified length

`words()` returns the amount of specified random words from lorem ipsum separated by spaces

### logger

`trace() debug() info() warn() error()` they all call their console equivalent function internally. also call custom logger functions registered on bootstrap. they only fire if the log level matches or is higher than the specific function

### repository

`repository()` provide an entity and get access to rich data manipulation. use functions like `find()` `insert()` `update()` and `delete()` to work with the chosen entity

`IdEntity` the most basic entity possible. all entities must correspond to this type

`FindOptions FindOneOptions` the types used in `find` and `findOne` from repository. they require generics to work

### router

`router()` returns access to `get` `post` `put` `patch` and `delete` route handlers. accepts an optional prefix which will affect all routes

`get() post() put() patch() delete()` route handlers used to map http routes in your application. they accept an endpoint and optional schema for validation and a handler which will be called when a request hits said endpoint

### validation

`string() number() boolean() object() uuid() date() union() array()` they all validate types on the runtime while providing awesome intellisense in development

`Infer` provide any dto as the type argument for getting a inferred type which is bound to that dto. works like magic
