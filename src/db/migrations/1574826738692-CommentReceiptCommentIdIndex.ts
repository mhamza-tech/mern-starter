import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptCommentIdIndex1574826738692 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_5686608a4b7b23fb8a4567a798" ON "comment_receipt" ("commentId") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_5686608a4b7b23fb8a4567a798"')
  }

}
