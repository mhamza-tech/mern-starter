import {MigrationInterface, QueryRunner} from 'typeorm'

export class IsVerifiedAccount1590006729909 implements MigrationInterface {

  name = 'IsVerifiedAccount1590006729909'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD "isVerifiedAccount" boolean NOT NULL DEFAULT false', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "isVerifiedAccount"', undefined)
  }

}
