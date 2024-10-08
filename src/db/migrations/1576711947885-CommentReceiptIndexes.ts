import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptIndexes1576711947885 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_f736cb6fa80cb5ebe23eb132fd"')
    await queryRunner.query('CREATE INDEX "IDX_8e4c48883528e50fb55ab6e68f" ON "comment_receipt" ("sessionUserId", "receiptType", "isRead") ')
    await queryRunner.query('CREATE INDEX "IDX_60f1bdc39bf1451f479aa8a388" ON "comment_receipt" ("sessionUserId", "collectionId", "receiptType", "isRead") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_60f1bdc39bf1451f479aa8a388"')
    await queryRunner.query('DROP INDEX "IDX_8e4c48883528e50fb55ab6e68f"')
    await queryRunner.query('CREATE INDEX "IDX_f736cb6fa80cb5ebe23eb132fd" ON "comment_receipt" ("receiptType", "collectionId", "sessionUserId") ')
  }

}
