import {MigrationInterface, QueryRunner } from 'typeorm'

export class QEdgeQFloat81575524098709 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "q"')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "q" double precision NOT NULL DEFAULT 0')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "q"')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "q" integer NOT NULL DEFAULT 0')
  }

}
