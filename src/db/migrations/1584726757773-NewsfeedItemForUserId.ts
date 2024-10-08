import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemForUserId1584726757773 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_2f545fa1e196771e15ec7965e0"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "forUserId" character varying')
    await queryRunner.query('CREATE INDEX "IDX_f4b39f8cada8417d8cb5790e77" ON "newsfeed_item" ("isDeleted", "forUserId", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_f4b39f8cada8417d8cb5790e77"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "forUserId"')
    await queryRunner.query('CREATE INDEX "IDX_2f545fa1e196771e15ec7965e0" ON "newsfeed_item" ("createdAt", "isDeleted") ')
  }

}
