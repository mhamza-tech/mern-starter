import {MigrationInterface, QueryRunner } from 'typeorm'

export class LocationDropVersionLock1583811969298 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "location" DROP COLUMN "versionLock"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "location" ADD "versionLock" integer')
  }

}
