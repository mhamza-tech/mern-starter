import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXOrderDefaultBlank1578325297099 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "order" SET DEFAULT \'\'')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "order" DROP DEFAULT')
  }

}
