import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectDisableButtonsUponAction1590695765194 implements MigrationInterface {

  name = 'UnObjectDisableButtonsUponAction1590695765194'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "disableButtonsUponAction" boolean NOT NULL DEFAULT false')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "disableButtonsUponAction"')
  }

}
