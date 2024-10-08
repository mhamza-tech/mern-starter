import {MigrationInterface, QueryRunner } from 'typeorm'

export class CompletedActionIndexes1573692013015 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_55f89ac8c976336221202b11fe"')
    await queryRunner.query('DROP INDEX "IDX_81faa3af5daab30f4b5dd3feaa"')
    await queryRunner.query('CREATE INDEX "IDX_451c489e83453450eb36aaa047" ON "completed_action" ("sessionUserId", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_f8eca635bed9e7a005e89676d2" ON "completed_action" ("contextId", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_f8eca635bed9e7a005e89676d2"')
    await queryRunner.query('DROP INDEX "IDX_451c489e83453450eb36aaa047"')
    await queryRunner.query('CREATE INDEX "IDX_81faa3af5daab30f4b5dd3feaa" ON "completed_action" ("sessionUserId") ')
    await queryRunner.query('CREATE INDEX "IDX_55f89ac8c976336221202b11fe" ON "completed_action" ("contextId") ')
  }

}
