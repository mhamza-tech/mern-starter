import {MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableChatRoom1571867738740 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "chat_room_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\')')
    await queryRunner.query('CREATE TABLE "chat_room" ("id" character varying NOT NULL, "entityType" "chat_room_entitytype_enum" NOT NULL DEFAULT \'ChatRoom\', "type" character varying NOT NULL DEFAULT \'ChatRoom\', "playerEids" character varying NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_127bd3b4c945e62ae2d50591ce" ON "chat_room" ("playerEids") ')
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('ALTER TYPE "public"."edge_edgetype_enum" RENAME TO "edge_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum" USING "edgeType"::"text"::"edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum_old"')
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TYPE "public"."edge_stats_edgetype_enum" RENAME TO "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum" USING "edgeType"::"text"::"edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeType", "edgeDirection")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum_old" USING "edgeType"::"text"::"edge_stats_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_stats_edgetype_enum_old" RENAME TO  "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeDirection", "edgeType")')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum_old" USING "edgeType"::"text"::"edge_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_edgetype_enum_old" RENAME TO  "edge_edgetype_enum"')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('DROP INDEX "IDX_127bd3b4c945e62ae2d50591ce"')
    await queryRunner.query('DROP TABLE "chat_room"')
    await queryRunner.query('DROP TYPE "chat_room_entitytype_enum"')
  }

}
