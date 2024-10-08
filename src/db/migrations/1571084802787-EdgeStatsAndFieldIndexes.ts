import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeStatsAndFieldIndexes1571084802787 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_f935e331637f4f6f6c9382cdfd" ON "edge_stats" ("entityId") ')
    await queryRunner.query('CREATE INDEX "IDX_9edac445f965ca77305caeb285" ON "edge_stats" ("edgeDirection") ')
    await queryRunner.query('CREATE INDEX "IDX_3cd48972e2e8e56ee562be7bcc" ON "edge_stats" ("edgeType") ')
    await queryRunner.query('CREATE INDEX "IDX_75c210b1125a6ddbe6d85d9389" ON "edge_stats" ("createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_b743da1a9fc251319cbcce3fec" ON "field" ("createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_b743da1a9fc251319cbcce3fec"')
    await queryRunner.query('DROP INDEX "IDX_75c210b1125a6ddbe6d85d9389"')
    await queryRunner.query('DROP INDEX "IDX_3cd48972e2e8e56ee562be7bcc"')
    await queryRunner.query('DROP INDEX "IDX_9edac445f965ca77305caeb285"')
    await queryRunner.query('DROP INDEX "IDX_f935e331637f4f6f6c9382cdfd"')
  }

}
