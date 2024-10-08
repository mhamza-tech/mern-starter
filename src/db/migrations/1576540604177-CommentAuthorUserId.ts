import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentAuthorUserId1576540604177 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ADD "authorUserId" character varying NOT NULL DEFAULT \'\'')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" DROP COLUMN "authorUserId"')
  }

}
