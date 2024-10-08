import {MigrationInterface, QueryRunner } from 'typeorm'

export class TileS3Key1576216664542 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ADD "s3Key" character varying')
    await queryRunner.query('ALTER TABLE "tile" ADD "s3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "s3Key"')
    await queryRunner.query('ALTER TABLE "comment" DROP COLUMN "s3Key"')
  }

}
