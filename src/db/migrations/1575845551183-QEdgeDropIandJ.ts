import {MigrationInterface, QueryRunner } from 'typeorm'

export class QEdgeDropIandJ1575845551183 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "i"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "j"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "q_edge" ADD "j" integer')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "i" integer')
  }

}
