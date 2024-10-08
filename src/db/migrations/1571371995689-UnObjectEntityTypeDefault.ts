import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class UnObjectEntityTypeDefault1571371995689 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TABLE "action" ("id" character varying NOT NULL, "createdByUserId" character varying NOT NULL, "storyboardId" character varying NOT NULL, "unObjectId" character varying, "buttonText" character varying NOT NULL, "extendState" character varying, "startState" character varying NOT NULL, "endState" character varying NOT NULL, "card" json NOT NULL, "newsfeedText" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_2d9db9cf5edfbbae74eb56e3a39" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "action_result" ("id" character varying NOT NULL, "trackingId" character varying, "unObjectId" character varying NOT NULL, "userId" character varying NOT NULL, "userAction" character varying NOT NULL, "confidence" double precision NOT NULL, "startState" character varying NOT NULL, "endState" character varying NOT NULL, "action" character varying NOT NULL, "newsfeedText" character varying, "emoji" character varying, "card" json NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "session" json NOT NULL, CONSTRAINT "PK_fe619ffb24dcc4b356241fd0e12" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "action_with_context" ("id" character varying NOT NULL, "createdByUserId" character varying NOT NULL, "actionId" character varying NOT NULL, "action" json, "myPlayerContextId" character varying NOT NULL, "myPlayerContext" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, "trackingId" character varying, CONSTRAINT "PK_e23af51f7e52f26c740290c38bc" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "player_context" ("id" character varying NOT NULL, "storyboardId" character varying NOT NULL, "userId" character varying NOT NULL, "currentState" character varying NOT NULL, "actionStubs" json NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, "trackingId" character varying, CONSTRAINT "UQ_327456fe413fd3012ad121f96b3" UNIQUE ("userId", "storyboardId"), CONSTRAINT "PK_8048ef93d37285df2ccd8985344" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TYPE "storyboard_status_enum" AS ENUM(\'Published\', \'Draft\')')
    await queryRunner.query('CREATE TABLE "storyboard" ("id" character varying NOT NULL, "createdByUserId" character varying NOT NULL, "unObjectId" character varying NOT NULL, "name" character varying, "status" "storyboard_status_enum", "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_186e16045f5790981f3715bfaf9" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TYPE "storyboard_edge_edgetype_enum" AS ENUM(\'PUBLISHED\', \'DRAFT\')')
    await queryRunner.query('CREATE TABLE "storyboard_edge" ("id" character varying NOT NULL, "unObjectId" character varying NOT NULL, "storyboardId" character varying NOT NULL, "edgeType" "storyboard_edge_edgetype_enum", "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "trackingId" character varying, CONSTRAINT "UQ_43a23f1d7469625a4c7a0b82c55" UNIQUE ("unObjectId", "storyboardId", "edgeType"), CONSTRAINT "PK_b52e60c8ab7e1d44bb9fed4d22f" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TABLE "storyline_session" ("id" character varying NOT NULL, "unObjectId" character varying NOT NULL, "userId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "session" json NOT NULL, CONSTRAINT "UQ_887272435b2eab658e81ae2133e" UNIQUE ("userId", "unObjectId"), CONSTRAINT "PK_b6386eb1ec21b589250e30d3328" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('CREATE TABLE "un_object" ("id" character varying NOT NULL, "entityType" "un_object_entitytype_enum" NOT NULL DEFAULT \'UnObject\', "createdByUserId" character varying NOT NULL, "name" character varying NOT NULL, "text" character varying, "emoji" character varying, "entryId" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_d8324b326641afcaec48aa9258d" PRIMARY KEY ("id"))')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP TABLE "un_object"')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"')
    await queryRunner.query('DROP TABLE "storyline_session"')
    await queryRunner.query('DROP TABLE "storyboard_edge"')
    await queryRunner.query('DROP TYPE "storyboard_edge_edgetype_enum"')
    await queryRunner.query('DROP TABLE "storyboard"')
    await queryRunner.query('DROP TYPE "storyboard_status_enum"')
    await queryRunner.query('DROP TABLE "player_context"')
    await queryRunner.query('DROP TABLE "action_with_context"')
    await queryRunner.query('DROP TABLE "action_result"')
    await queryRunner.query('DROP TABLE "action"')
  }

}
