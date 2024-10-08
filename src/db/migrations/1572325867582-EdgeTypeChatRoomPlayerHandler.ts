import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeTypeChatRoomPlayerHandler1572325867582 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('DROP INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c"')
    await queryRunner.query('DROP INDEX "IDX_28fb24cef45d23bf5ac89a69d4"')
    await queryRunner.query('ALTER TYPE "public"."edge_edgetype_enum" RENAME TO "edge_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum" USING "edgeType"::"text"::"edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum_old"')
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TYPE "public"."edge_stats_edgetype_enum" RENAME TO "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\', \'ChatRoomPlayerHandler\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum" USING "edgeType"::"text"::"edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c" ON "edge" ("thatEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_28fb24cef45d23bf5ac89a69d4" ON "edge" ("thisEntityId", "thatEntityId", "edgeType") ')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeType", "edgeDirection")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('DROP INDEX "IDX_28fb24cef45d23bf5ac89a69d4"')
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('DROP INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum_old" USING "edgeType"::"text"::"edge_stats_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_stats_edgetype_enum_old" RENAME TO  "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeDirection", "edgeType")')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoomPlayer\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum_old" USING "edgeType"::"text"::"edge_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_edgetype_enum_old" RENAME TO  "edge_edgetype_enum"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_28fb24cef45d23bf5ac89a69d4" ON "edge" ("thisEntityId", "thatEntityId", "edgeType") ')
    await queryRunner.query('CREATE INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c" ON "edge" ("thatEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
  }

}
