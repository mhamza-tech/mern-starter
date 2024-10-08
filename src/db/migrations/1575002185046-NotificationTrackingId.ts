import {MigrationInterface, QueryRunner } from 'typeorm'

export class NotificationTrackingId1575002185046 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ADD "trackingId" character varying')
    await queryRunner.query('ALTER TABLE "notification" ADD "trackingId" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "notification" DROP COLUMN "trackingId"')
    await queryRunner.query('ALTER TABLE "comment" DROP COLUMN "trackingId"')
  }

}
