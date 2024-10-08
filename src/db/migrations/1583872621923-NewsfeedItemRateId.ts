import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemRateId1583872621923 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "rateId" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "rateId"')
  }

}
