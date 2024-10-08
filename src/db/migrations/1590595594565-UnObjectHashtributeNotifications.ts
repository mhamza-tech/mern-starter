import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectHashtributeNotifications1590595594565 implements MigrationInterface {

  name = 'UnObjectHashtributeNotifications1590595594565'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "allowHashtributeNotifications" boolean NOT NULL DEFAULT true')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "allowHashtributeNotifications"')
  }

}
