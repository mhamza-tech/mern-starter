import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldThisEntityIdCollectionNameIndex1576054707548 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_2d0501511ca234c078054b90af"')
    await queryRunner.query('DROP INDEX "IDX_0dcb328aa83a523e3e6e1a6067"')
    await queryRunner.query('DROP INDEX "IDX_403c12777fc2e5ed7f27e7f436"')
    await queryRunner.query('CREATE INDEX "IDX_19ad19dce806abeaa6f21d2fd4" ON "field" ("thisEntityId", "collectionName", "isDeleted", "updatedAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_19ad19dce806abeaa6f21d2fd4"')
    await queryRunner.query('CREATE INDEX "IDX_403c12777fc2e5ed7f27e7f436" ON "field" ("updatedAt", "collectionId", "collectionName", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_0dcb328aa83a523e3e6e1a6067" ON "field" ("collectionId", "collectionName", "order", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_2d0501511ca234c078054b90af" ON "field" ("type", "collectionId", "order", "isDeleted") ')
  }

}
