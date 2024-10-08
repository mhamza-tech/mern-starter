# UnReal Database


1. [DB Services](#db-services)
1. [DB Migration](#db-migration)

<a name="db-services"> </a>

## DB Services

* All production services (gql.unreal.fun) point to DB unreal-production.
    * [./aws/production/.ebextensions/environment-vars.config](./aws/production/.ebextensions/environment-vars.config)
    * DB server: unreal-production.ctyzwnpqnklk.us-west-2.rds.amazonaws.com
* All staging services (gql-staging.unreal.fun) point to DB unreal-staging.
    * [./aws/staging/.ebextensions/environment-vars.config](./aws/staging/.ebextensions/environment-vars.config)
    * DB server: unreal-staging.ctyzwnpqnklk.us-west-2.rds.amazonaws.com
* Dev services (gql-dev.unreal.fun) point to...
    * unreal-dev-2 (for activity DB)
    * unreal-rob-dev (for auth and state_machine/unreal DBs)
    * [./aws/development/.ebextensions/environment-vars.config](./aws/development/.ebextensions/environment-vars.config)
    * DB server: unreal-dev-2.ctyzwnpqnklk.us-west-2.rds.amazonaws.com
    * DB server: unreal-rob-dev.ctyzwnpqnklk.us-west-2.rds.amazonaws.com
* Local dev services (localhost:3334) point to DB unreal-rob-dev.
    * [./env](./.env)
    * DB server: unreal-rob-dev.ctyzwnpqnklk.us-west-2.rds.amazonaws.com




<a name="db-migration"> </a>

## DB Migrations

#### One-time setup

* set `TYPEORM_SYNCRHONIZE=false` everywhere, including dev env.  This forces us to use 
migration scripts (which we need anyway for staging and production).
* set `TYPEORM_MIGRATIONS_RUN=true` everywhere, including dev env.  This will run migration scripts at 
server startup.
* in [package.json](package.json), add this line to scripts (if not present): 
    * `"typeorm:gen": "ts-node ./node_modules/typeorm/cli migration:generate "`

#### Generate migration script

1. Make changes to the entity source code
    * if adding a new entity, add it to the entities list in both:
        * [ormconfig.json](ormconfig.json)
        * [src/db/connect.ts](src/db/connect.ts)
1. temporarily comment out in [.env](.env): `# TYPEORM_CONNECTION=postgres`
    * typeorm will load the connection config from the env if TYPEORM_CONNECTION is set
    * the CLI instead uses [ormconfig.json](ormconfig.json) for connection config
    * Why? cuz typeorm env config doesn't support multiple connections
1. specify the db connection on the generate command
    * `$ npm run typeorm:gen -- -c connName -n PickANameForThisMigrationScript`
    * EXAMPLE - generate for default connection: `$ npm run typeorm:gen -- -n ActivityEdgeCreatedAtIndex`
    * EXAMPLE - generate for specific connection: `$ npm run typeorm:gen -- -c connName -n ActivityEdgeCreatedAtIndex`
1. compile newly generated migration file from ts to js:    
    * `$ npm run postinstall`
    * **why?** cuz the server is configured to read the migrations scripts directly from the dist/ dir, for performance reasons
1. migration scripts are generated under [src/db/migrations](src/db/migrations)
    * migrations for each connection are generated under its own directory 
    * review each migration script to ensure it's not unnecessarily deleting data
1. uncomment in .env: `TYPEORM_CONNECTION=unreal_core`
1. restart the server.  
    * the server will run the migrations


#### Notes

useful commands:

    // creates an empty migration file for manual migrations
    $ npm run typeorm:cli -- migration:create -n UserFullName

    // generates a migration file automatically based on entity changes.
    // make sure TYPEORM_SYNCHRONIZE=false, otherwise typeorm will auto-sync
    // entity changes and the generated migrations will be empty.
    $ npm run typeorm:cli -- migration:generate -n User

    // manually run migrations from the CLI.
    // OR, set TYPEORM_MIGRATIONS_RUN=true, and migrations will run automatically
    // at server startup.
    $ npm run typeorm:cli -- migration:run

    $ npm install --save-dev @graphql-codegen/cli
    $ npm install --save-dev @graphql-codegen/typescript
    // setup codegen.yml
    $ npm run graphql-codegen

