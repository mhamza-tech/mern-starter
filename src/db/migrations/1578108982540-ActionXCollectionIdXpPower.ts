import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXCollectionIdXpPower1578108982540 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "collectionId" character varying')
    await queryRunner.query('ALTER TABLE "action_x" ADD "xp" integer NOT NULL DEFAULT 0')
    await queryRunner.query('ALTER TABLE "action_x" ADD "power" integer NOT NULL DEFAULT 0')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "power"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "xp"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "collectionId"')
  }

}
