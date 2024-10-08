import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemOptimisticId1578679967455 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "optimisticId" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "optimisticId"')
  }

}
