import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeDeleteIndexes1572304718027 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_a3fbc984762377c88914bb393d"')
    await queryRunner.query('DROP INDEX "IDX_999672a732844c621fa8377683"')
    await queryRunner.query('ALTER TABLE "edge" DROP CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_28fb24cef45d23bf5ac89a69d4" ON "edge" ("thisEntityId", "thatEntityId", "edgeType") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_28fb24cef45d23bf5ac89a69d4"')
    await queryRunner.query('ALTER TABLE "edge" ADD CONSTRAINT "UQ_28fb24cef45d23bf5ac89a69d4a" UNIQUE ("thisEntityId", "thatEntityId", "edgeType")')
    await queryRunner.query('CREATE INDEX "IDX_999672a732844c621fa8377683" ON "edge" ("thisEntityId") ')
    await queryRunner.query('CREATE INDEX "IDX_a3fbc984762377c88914bb393d" ON "edge" ("createdAt") ')
  }

}
