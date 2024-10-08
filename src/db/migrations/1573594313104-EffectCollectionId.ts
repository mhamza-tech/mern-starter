import {MigrationInterface, QueryRunner } from 'typeorm'

export class EffectCollectionId1573594313104 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_d4900a930b9443cc63c6f8002d"')
    await queryRunner.query('ALTER TABLE "effect" RENAME COLUMN "contextId" TO "collectionId"')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "collectionId" SET NOT NULL')
    await queryRunner.query('CREATE INDEX "IDX_846ca4f42bf2fbd61927569018" ON "effect" ("collectionId") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_846ca4f42bf2fbd61927569018"')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "collectionId" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "effect" RENAME COLUMN "collectionId" TO "contextId"')
    await queryRunner.query('CREATE INDEX "IDX_d4900a930b9443cc63c6f8002d" ON "effect" ("contextId") ')
  }

}
