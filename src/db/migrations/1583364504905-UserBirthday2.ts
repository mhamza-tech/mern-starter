import {MigrationInterface, QueryRunner } from 'typeorm'

export class UserBirthday21583364504905 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" ADD "birthday" date')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "birthday"')
  }

}
