import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptSessionUserCollectionReceiptTypeIndex1576541498370 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_f736cb6fa80cb5ebe23eb132fd" ON "comment_receipt" ("sessionUserId", "collectionId", "receiptType") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_f736cb6fa80cb5ebe23eb132fd"')
  }

}
