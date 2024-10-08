import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXVersionLock1580253455426 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "versionLock" integer')
    await queryRunner.query('ALTER TABLE "un_object" ADD "versionLock" integer')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "versionLock"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "versionLock"')
  }

}
