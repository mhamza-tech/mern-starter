import {MigrationInterface, QueryRunner } from 'typeorm'

export class NotificationPlayerEid1575686603080 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "notification" ADD "playerEid" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "notification" DROP COLUMN "playerEid"')
  }

}
