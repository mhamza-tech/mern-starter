import {MigrationInterface, QueryRunner } from 'typeorm'

export class UnObjectGradientS3Key1580496307007 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "gradientS3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "gradientS3Key"')
  }

}
