import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXArgs1580076207144 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "args" json')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "args"')
  }

}
