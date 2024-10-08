import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldCollectionIdIndex1571945001470 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('UPDATE "field" SET "collectionId" = \'newsfeeditem/\' || "thisEntityId" || \'/field\' ')
    await queryRunner.query('DROP INDEX "IDX_a273434bbfe829e01f3a304070"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "collectionId" DROP DEFAULT')
    await queryRunner.query('CREATE INDEX "IDX_a273434bbfe829e01f3a304070" ON "field" ("collectionId", "updatedAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_971c9f0b322104f5a2ffd4629f" ON "field" ("collectionId", "name") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_971c9f0b322104f5a2ffd4629f"')
    await queryRunner.query('DROP INDEX "IDX_a273434bbfe829e01f3a304070"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "collectionId" SET DEFAULT \'\'')
    await queryRunner.query('CREATE INDEX "IDX_a273434bbfe829e01f3a304070" ON "field" ("updatedAt", "collectionId") ')
  }

}
