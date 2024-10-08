import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class ActivityEdgeCreatedAtIndex1570941101188 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "activity_activitytype_enum" AS ENUM(\'Activity\', \'ActionResult\', \'ActionWithContext\')')
    await queryRunner.query('CREATE TABLE "activity" ("id" character varying NOT NULL, "trackingId" character varying, "actionResultId" character varying, "userId" character varying, "unObjectId" character varying, "activityType" "activity_activitytype_enum" NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_caa645b86d8db66739106100a2" ON "activity" ("createdAt") ')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'FriendRequest\', \'Friend\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\', \'Interest\', \'Player\', \'NewsfeedItem\', \'Block\', \'ReactionEdge\')')
    await queryRunner.query('CREATE TABLE "edge" ("id" character varying NOT NULL, "thisEntityId" character varying NOT NULL, "thisEntityType" "edge_thisentitytype_enum" NOT NULL, "thatEntityId" character varying NOT NULL, "thatEntityType" "edge_thatentitytype_enum" NOT NULL, "edgeType" "edge_edgetype_enum" NOT NULL, "count" integer NOT NULL DEFAULT 1, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_bf6f43c9af56d05094d8c57b311" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_a3fbc984762377c88914bb393d" ON "edge" ("createdAt") ')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('CREATE TYPE "edge_stats_edgedirection_enum" AS ENUM(\'Inbound\', \'Outbound\')')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'FriendRequest\', \'Friend\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\', \'Interest\', \'Player\', \'NewsfeedItem\', \'Block\', \'ReactionEdge\')')
    await queryRunner.query('CREATE TABLE "edge_stats" ("id" SERIAL NOT NULL, "entityId" character varying NOT NULL, "edgeDirection" "edge_stats_edgedirection_enum" NOT NULL, "edgeType" "edge_stats_edgetype_enum" NOT NULL, "count" integer NOT NULL DEFAULT 0, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_f1b723f051df9552393761ef4e9" PRIMARY KEY ("id"))')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeDirection", "edgeType")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('DROP TABLE "edge_stats"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgedirection_enum"')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('DROP INDEX "IDX_a3fbc984762377c88914bb393d"')
    await queryRunner.query('DROP TABLE "edge"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_caa645b86d8db66739106100a2"')
    await queryRunner.query('DROP TABLE "activity"')
    await queryRunner.query('DROP TYPE "activity_activitytype_enum"')
  }

}
