import {MigrationInterface, QueryRunner } from 'typeorm'

export class UnObjectHandlerUnObjectId1574137032743 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "handlerUnObjectId" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "handlerUnObjectId"')
  }

}
