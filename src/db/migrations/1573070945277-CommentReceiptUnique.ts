import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptUnique1573070945277 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e" UNIQUE ("commentId", "sessionUserId", "receiptType")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e"')
  }

}
