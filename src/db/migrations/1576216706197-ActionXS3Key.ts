import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXS3Key1576216706197 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "s3Key" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "s3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "s3Key"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "s3Key"')
  }

}
