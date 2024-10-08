import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeStatsIndex1573506600078 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_f935e331637f4f6f6c9382cdfd"')
    await queryRunner.query('DROP INDEX "IDX_9edac445f965ca77305caeb285"')
    await queryRunner.query('DROP INDEX "IDX_75c210b1125a6ddbe6d85d9389"')
    await queryRunner.query('DROP INDEX "IDX_3cd48972e2e8e56ee562be7bcc"')
    await queryRunner.query('ALTER TABLE "edge_stats" DROP CONSTRAINT "UQ_d497bdb63fa876ee87527963df9"')
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"')
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"')
    await queryRunner.query('DROP TYPE "field_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_91795dfe84ceecb9661700c2b0" ON "edge_stats" ("entityId", "createdAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d497bdb63fa876ee87527963df" ON "edge_stats" ("entityId", "edgeDirection", "edgeType") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_d497bdb63fa876ee87527963df"')
    await queryRunner.query('DROP INDEX "IDX_91795dfe84ceecb9661700c2b0"')
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'ActionsField\', \'BooleanField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'DateField\', \'NewsfeedItemCard\', \'NumberField\', \'StringField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"')
    await queryRunner.query('DROP TYPE "field_type_enum"')
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO  "field_type_enum"')
    await queryRunner.query('ALTER TABLE "edge_stats" ADD CONSTRAINT "UQ_d497bdb63fa876ee87527963df9" UNIQUE ("entityId", "edgeDirection", "edgeType")')
    await queryRunner.query('CREATE INDEX "IDX_3cd48972e2e8e56ee562be7bcc" ON "edge_stats" ("edgeType") ')
    await queryRunner.query('CREATE INDEX "IDX_75c210b1125a6ddbe6d85d9389" ON "edge_stats" ("createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_9edac445f965ca77305caeb285" ON "edge_stats" ("edgeDirection") ')
    await queryRunner.query('CREATE INDEX "IDX_f935e331637f4f6f6c9382cdfd" ON "edge_stats" ("entityId") ')
  }

}
