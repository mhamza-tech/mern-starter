import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldCollectionId1571944590027 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_74c518296e8b964f0061e180fd"')
    await queryRunner.query('DROP INDEX "IDX_93b5ecbee5bda9a63e2b107c5f"')
    await queryRunner.query('DROP INDEX "IDX_587d17b1cb6c63181e0f1f9074"')
    await queryRunner.query('ALTER TABLE "field" ADD "collectionId" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('CREATE INDEX "IDX_a273434bbfe829e01f3a304070" ON "field" ("collectionId", "updatedAt") ')
    await queryRunner.query('CREATE INDEX "IDX_8b2319303d48c1e48d8ac0e7ff" ON "field" ("thisEntityId", "updatedAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_8b2319303d48c1e48d8ac0e7ff"')
    await queryRunner.query('DROP INDEX "IDX_a273434bbfe829e01f3a304070"')
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "collectionId"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_587d17b1cb6c63181e0f1f9074" ON "field" ("name", "thisEntityId") ')
    await queryRunner.query('CREATE INDEX "IDX_93b5ecbee5bda9a63e2b107c5f" ON "field" ("thisEntityId", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_74c518296e8b964f0061e180fd" ON "field" ("thisEntityId") ')
  }

}
