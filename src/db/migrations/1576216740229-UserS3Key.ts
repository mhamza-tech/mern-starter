import {MigrationInterface, QueryRunner } from 'typeorm'

export class UserS3Key1576216740229 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" ADD "s3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "s3Key"')
  }

}
