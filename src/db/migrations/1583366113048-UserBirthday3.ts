import {MigrationInterface, QueryRunner } from 'typeorm'

export class UserBirthday31583366113048 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "birthday"')
    await queryRunner.query('ALTER TABLE "user" ADD "birthday" TIMESTAMP WITH TIME ZONE')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "birthday"')
    await queryRunner.query('ALTER TABLE "user" ADD "birthday" date')
  }

}
