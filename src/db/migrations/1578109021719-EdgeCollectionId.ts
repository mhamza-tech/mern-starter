import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeCollectionId1578109021719 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge" ADD "collectionId" character varying')
    await queryRunner.query('CREATE INDEX "IDX_de0729cef366afc8eedb281d77" ON "edge" ("thisEntityId", "collectionId", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_9546b8c01f03b2c380a63f7a9a" ON "edge" ("thisEntityId", "collectionId", "name") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_9546b8c01f03b2c380a63f7a9a"')
    await queryRunner.query('DROP INDEX "IDX_de0729cef366afc8eedb281d77"')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "collectionId"')
  }

}
