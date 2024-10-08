import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectIsDestination1594839537917 implements MigrationInterface {

  name = 'UnObjectIsDestination1594839537917'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "isDestination" boolean NOT NULL DEFAULT false')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "isDestination"')
  }

}
