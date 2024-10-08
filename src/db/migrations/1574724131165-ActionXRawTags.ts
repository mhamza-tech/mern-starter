import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXRawTags1574724131165 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" RENAME COLUMN "tags" TO "rawTags"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" RENAME COLUMN "rawTags" TO "tags"')
  }

}
