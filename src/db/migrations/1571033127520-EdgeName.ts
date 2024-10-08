import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeName1571033127520 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge" ADD "name" character varying')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('ALTER TYPE "public"."edge_edgetype_enum" RENAME TO "edge_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum" USING "edgeType"::"text"::"edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum_old"')
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TYPE "public"."edge_stats_edgetype_enum" RENAME TO "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'Follows\', \'Actor\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum" USING "edgeType"::"text"::"edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum_old"')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeType", "edgeDirection")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum_old" USING "edgeType"::"text"::"edge_stats_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_stats_edgetype_enum_old" RENAME TO  "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeDirection", "edgeType")')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum_old" AS ENUM(\'Likes\', \'Follows\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum_old" USING "edgeType"::"text"::"edge_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_edgetype_enum_old" RENAME TO  "edge_edgetype_enum"')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "name"')
  }

}
