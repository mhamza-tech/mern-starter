import {MigrationInterface, QueryRunner } from 'typeorm'

export class QEdgeQBeta1575524677915 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" ADD "qBeta" double precision NOT NULL DEFAULT 1')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "qBetaType" character varying NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "qBetaType"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "qBeta"')
  }

}
