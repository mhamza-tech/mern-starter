import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeTypeInterest1576013330694 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_0030a10250e4dac762a479cd85"')
    await queryRunner.query('DROP INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3"')
    await queryRunner.query('DROP INDEX "IDX_6c9641aa3e5d202059389c4b85"')
    await queryRunner.query('DROP INDEX "IDX_ef01278590ed1b7c4122884f3a"')
    await queryRunner.query('DROP INDEX "IDX_28fb24cef45d23bf5ac89a69d4"')
    await queryRunner.query('ALTER TYPE "public"."edge_edgetype_enum" RENAME TO "edge_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\', \'Interest\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum" USING "edgeType"::"text"::"edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum_old"')
    await queryRunner.query('DROP INDEX "IDX_d497bdb63fa876ee87527963df"')
    await queryRunner.query('ALTER TYPE "public"."edge_stats_edgetype_enum" RENAME TO "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\', \'Interest\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum" USING "edgeType"::"text"::"edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_0030a10250e4dac762a479cd85" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_6c9641aa3e5d202059389c4b85" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ef01278590ed1b7c4122884f3a" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_28fb24cef45d23bf5ac89a69d4" ON "edge" ("thisEntityId", "thatEntityId", "edgeType") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d497bdb63fa876ee87527963df" ON "edge_stats" ("entityId", "edgeDirection", "edgeType") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_d497bdb63fa876ee87527963df"')
    await queryRunner.query('DROP INDEX "IDX_28fb24cef45d23bf5ac89a69d4"')
    await queryRunner.query('DROP INDEX "IDX_ef01278590ed1b7c4122884f3a"')
    await queryRunner.query('DROP INDEX "IDX_6c9641aa3e5d202059389c4b85"')
    await queryRunner.query('DROP INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3"')
    await queryRunner.query('DROP INDEX "IDX_0030a10250e4dac762a479cd85"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum_old" USING "edgeType"::"text"::"edge_stats_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_stats_edgetype_enum_old" RENAME TO  "edge_stats_edgetype_enum"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d497bdb63fa876ee87527963df" ON "edge_stats" ("entityId", "edgeDirection", "edgeType") ')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\', \'ActionX\', \'Tile\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum_old" USING "edgeType"::"text"::"edge_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_edgetype_enum_old" RENAME TO  "edge_edgetype_enum"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_28fb24cef45d23bf5ac89a69d4" ON "edge" ("thisEntityId", "thatEntityId", "edgeType") ')
    await queryRunner.query('CREATE INDEX "IDX_ef01278590ed1b7c4122884f3a" ON "edge" ("thisEntityId", "edgeType", "createdAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_6c9641aa3e5d202059389c4b85" ON "edge" ("thatEntityId", "edgeType", "createdAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3" ON "edge" ("thatEntityId", "edgeType", "order", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_0030a10250e4dac762a479cd85" ON "edge" ("thisEntityId", "edgeType", "order", "isDeleted") ')
  }

}
