import {MigrationInterface, QueryRunner } from 'typeorm'

export class CompletedActionContextId1573691594274 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_a0d063d768f6187e68168f108b"')
    await queryRunner.query('ALTER TABLE "completed_action" RENAME COLUMN "contextEid" TO "contextId"')
    await queryRunner.query('CREATE INDEX "IDX_55f89ac8c976336221202b11fe" ON "completed_action" ("contextId") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_55f89ac8c976336221202b11fe"')
    await queryRunner.query('ALTER TABLE "completed_action" RENAME COLUMN "contextId" TO "contextEid"')
    await queryRunner.query('CREATE INDEX "IDX_a0d063d768f6187e68168f108b" ON "completed_action" ("contextEid") ')
  }

}
