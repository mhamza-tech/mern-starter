import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeSortKeys1579390208005 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge" ADD "sortKey1" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('ALTER TABLE "edge" ADD "sortKey2" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('CREATE INDEX "IDX_d27712be1128d67d4e81015e2f" ON "edge" ("thisEntityId", "collectionId", "collectionName", "isDeleted", "sortKey2", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_cacbdd1b46ac1ae88ab607a037" ON "edge" ("thisEntityId", "collectionId", "collectionName", "isDeleted", "sortKey1", "order") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_cacbdd1b46ac1ae88ab607a037"')
    await queryRunner.query('DROP INDEX "IDX_d27712be1128d67d4e81015e2f"')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "sortKey2"')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "sortKey1"')
  }

}
