import {MigrationInterface, QueryRunner} from 'typeorm'

export class UserTimezoneKey1592812340119 implements MigrationInterface {

  name = 'UserTimezoneKey1592812340119'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD "timezoneOffset" integer NOT NULL DEFAULT 0')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "timezoneOffset"')
  }

}
