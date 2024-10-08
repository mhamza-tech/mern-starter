# UnReal GQL Server

1. [Getting Started](#getting-started)
1. [src/ outline](#src-outline)
1. [State Machine Engine](#engine)
1. [Testing](#testing)
1. [DB Arch](./db.md)
1. [Firebase](#firebase)
1. [GraphQL API](./gql-playground.md)
1. [Performance Monitoring](#perf-monitoring)
1. [Job Queue](https://gitlab.com/unrealfun/be/unreal-gql/-/merge_requests/243)

<a name="getting-started"> </a>

## Steps to Get Started

#### [Install Node Version Manager (NVM)](https://github.com/nvm-sh/nvm#installing-and-updating)
#### Install and use Node version 12.16.1
- `$ nvm install 12.16.1`
- `$ nvm use 12.16.1`

#### Install docker

#### Clone the repository from GitLab
`$ git clone https://gitlab.com/unrealfun/be/unreal-gql.git`

#### Change local directory
`$ cd unreal-gql`

#### Install all the project dependencies
`$ npm install`

### Be sure your .env file is created and standard values are applied
You can copy and paste from `.env.sample`
or
`$ cp .env.sample .env`

#### Start docker containers
`$ docker-compose up -d`

#### Starting the local development server 
`$ npm run start.dev`

#### Starting production builds (mostly for testing purposes)
`$ npm run build`
`$ npm run start`

If all goes well you should see this in the console:

  Database connection established
  🚀 GraphQL Server ready at http://localhost:3334/
  🚀 GraphQL Subscriptions ready at ws://localhost:3334/graphql

**Note:** this will watch for file changes and automatically restart the server.


#### (Optional) install [AVN for automatic version switching](https://github.com/wbyoung/avn)


#### Troubleshooting: Ensure you have node_modules write access

[https://flaviocopes.com/npm-fix-missing-write-access-error/](https://flaviocopes.com/npm-fix-missing-write-access-error/)

`$ sudo chown -R $USER /usr/local/lib/node_modules`


#### Speed up local server start/reload times

you can set your local .env variable `FAST_BOOT=true` to disable several boot operations.

Among other things, it won't parse actions and unobjects yaml files. So do enable it if you need them parsed.


<a name="src-outline"> </a>

## src/ Outline

* [src/db](src/db)
    * typeorm entity definitions
    * migration scripts
    * db utils
* [src/graphql](src/graphql)
    * GQL api
    * bulk of the backend runtime code
    * file naming pattern:
        * user.type.ts
            * GQL type defs
        * user.resolvers.ts
            * GQL resolvers
        * user.model.ts
            * CRUD DB apis
        * user.cache.ts
            * cache defs
        * user.authz.ts
            * authz routines
        * user.error.ts
            * defined errors 
        * user.store.ts 
            * currently being refactored from src/graphql/store.ts
            * layer above DB that uses the cache
* [src/maker](src/maker)
    * game modules
    * [src/maker/api](src/maker/api): "handler api" -> backend runtime
* [src/enginev3](src/enginev3)
    * action router
        * routes actions from FE -> game dev module
    * actions yaml parser 
    * unobjects yaml parser 
* [src/services](src/services)
    * firebase
    * sendgrid
    * internal cross-microservice APIs 
        * dead
        * from back when the backend was separated into microservices 
* [src/utils](src/utils)
    * misc utils
* [src/storylines](src/storylines)
    * dead (prev version)
* [src/engine](src/engine) 
    * dead (prev version)
* [src/test](src/test) 
    * dead 
    * see [Testing](#testing)



<a name="engine"> </a>

## State Machine Engine

**NOTE: we are now using engine v3!!!**

* V3 (ActionResolvers / action handlers): See [src/maker](src/maker) and [src/enginev3](src/enginev3)
* **deprecated** V2 (maker page): See [engine.v2.md](engine.v2.md)
* **deprecated** V1 (yaml parser): See [engine.v1.md](engine.v1.md)

   

<a name="testing"> </a>

## Testing
* Unit tests can be written using [Jest](https://jestjs.io/)
* Tests should named with the following format `{name}.spec.ts`
* You can perform TDD with Jest's watch mode using `npm run test.watch` [Docs](https://jestjs.io/docs/en/cli.html)

[https://gitlab.com/unrealfun/be/unreal-workers/blob/master/src/test](https://gitlab.com/unrealfun/be/unreal-workers/blob/master/src/test)



<a name="firebase"> </a>

## Firebase

* three envs
    * unreal-dev
    * unreal-staging
    * unreal-prod
* [src/services/firebase.ts](src/services/firebase.ts): serviceAccount read from ENV var
* services in use: 
    * fcm
* **mobile_config**: firestore collection 
    * read by app
    * controls "app_maintenance" and minimum_version fields

<a name="perf-monitoring"> </a>

## Performance Monitoring

[https://engine.apollographql.com/account/gh.rob4lderman/graphs](https://engine.apollographql.com/account/gh.rob4lderman/graphs)

(free personal account - only rob4lderman (via github) can access)

To set up a new account (the gist of it IIRC):

1. create account on engine.apollographql.com
1. create a "graph" on engine.apollographql.com
    * this should present you an ENGINE_API_KEY
1. configure ENGINE_API_KEY in the unreal-gql env files
1. run this command: `npx apollo service:push --endpoint=https://gql-dev.unreal.fun/`
    * set the --endpoint to whichever GQL server you want to track

## NGROK Tunnels
1. ./ngrok http -subdomain=unreal-brewery 3334