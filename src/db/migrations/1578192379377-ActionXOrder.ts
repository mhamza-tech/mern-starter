import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXOrder1578192379377 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "order" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "order"')
  }

}
