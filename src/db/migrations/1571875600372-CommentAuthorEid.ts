import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentAuthorEid1571875600372 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" RENAME COLUMN "authorDocumentId" TO "authorEid"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" RENAME COLUMN "authorEid" TO "authorDocumentId"')
  }

}
