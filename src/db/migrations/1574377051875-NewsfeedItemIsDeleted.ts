import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemIsDeleted1574377051875 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_7a3e557bde1b993ae14f9d782e"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "isDeleted" boolean NOT NULL DEFAULT false')
    await queryRunner.query('CREATE INDEX "IDX_2f545fa1e196771e15ec7965e0" ON "newsfeed_item" ("isDeleted", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_2f545fa1e196771e15ec7965e0"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "isDeleted"')
    await queryRunner.query('CREATE INDEX "IDX_7a3e557bde1b993ae14f9d782e" ON "newsfeed_item" ("createdAt") ')
  }

}
