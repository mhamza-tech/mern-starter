import {MigrationInterface, QueryRunner} from 'typeorm'

export class UserCompletedSignup1597699478103 implements MigrationInterface {

  name = 'UserCompletedSignup1597699478103'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD "hasCompletedSignup" boolean NOT NULL DEFAULT false')
    await queryRunner.query('UPDATE "user" set "hasCompletedSignup" = true')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "hasCompletedSignup"')
  }

}
