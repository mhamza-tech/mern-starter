import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXBackgroundColorDefault1575328684346 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "backgroundColor" SET DEFAULT \'ffffff\'')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "rawTags" DROP NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "rawTags" SET NOT NULL')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "backgroundColor" DROP DEFAULT')
  }

}
