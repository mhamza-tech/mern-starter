import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeCountDefault11576686306476 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "count" SET DEFAULT 1')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "count" SET DEFAULT 0')
  }

}
