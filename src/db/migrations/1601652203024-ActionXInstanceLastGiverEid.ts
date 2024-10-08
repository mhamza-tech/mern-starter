import {MigrationInterface, QueryRunner} from 'typeorm'

export class ActionXInstanceLastGiverEid1601652203024 implements MigrationInterface {

  name = 'ActionXInstanceLastGiverEid1601652203024'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "action_x_instance" ADD "lastGiverEid" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "action_x_instance" DROP COLUMN "lastGiverEid"')
  }

}
