import {MigrationInterface, QueryRunner } from 'typeorm'

export class CompletedActionActorEid1573865649874 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "completed_action" ADD "actorEid" character varying NOT NULL DEFAULT \'\'')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "completed_action" DROP COLUMN "actorEid"')
  }

}
