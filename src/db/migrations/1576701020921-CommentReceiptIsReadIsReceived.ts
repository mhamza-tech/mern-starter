import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptIsReadIsReceived1576701020921 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD "isRead" boolean NOT NULL DEFAULT false')
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD "isReceived" boolean NOT NULL DEFAULT false')
    await queryRunner.query('DROP INDEX "IDX_f736cb6fa80cb5ebe23eb132fd"')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e"')
    await queryRunner.query('ALTER TYPE "public"."comment_receipt_receipttype_enum" RENAME TO "comment_receipt_receipttype_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_receipt_receipttype_enum" AS ENUM(\'Received\', \'Read\', \'Receipt\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "receiptType" TYPE "comment_receipt_receipttype_enum" USING "receiptType"::"text"::"comment_receipt_receipttype_enum"')
    await queryRunner.query('DROP TYPE "comment_receipt_receipttype_enum_old"')
    await queryRunner.query('ALTER TABLE "receipt" DROP CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6"')
    await queryRunner.query('ALTER TYPE "public"."receipt_type_enum" RENAME TO "receipt_type_enum_old"')
    await queryRunner.query('CREATE TYPE "receipt_type_enum" AS ENUM(\'Received\', \'Read\', \'Receipt\')')
    await queryRunner.query('ALTER TABLE "receipt" ALTER COLUMN "type" TYPE "receipt_type_enum" USING "type"::"text"::"receipt_type_enum"')
    await queryRunner.query('DROP TYPE "receipt_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_f736cb6fa80cb5ebe23eb132fd" ON "comment_receipt" ("sessionUserId", "collectionId", "receiptType") ')
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e" UNIQUE ("commentId", "sessionUserId", "receiptType")')
    await queryRunner.query('ALTER TABLE "receipt" ADD CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6" UNIQUE ("entityEid", "sessionUserId", "type")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "receipt" DROP CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6"')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e"')
    await queryRunner.query('DROP INDEX "IDX_f736cb6fa80cb5ebe23eb132fd"')
    await queryRunner.query('CREATE TYPE "receipt_type_enum_old" AS ENUM(\'Read\', \'Received\')')
    await queryRunner.query('ALTER TABLE "receipt" ALTER COLUMN "type" TYPE "receipt_type_enum_old" USING "type"::"text"::"receipt_type_enum_old"')
    await queryRunner.query('DROP TYPE "receipt_type_enum"')
    await queryRunner.query('ALTER TYPE "receipt_type_enum_old" RENAME TO  "receipt_type_enum"')
    await queryRunner.query('ALTER TABLE "receipt" ADD CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6" UNIQUE ("type", "entityEid", "sessionUserId")')
    await queryRunner.query('CREATE TYPE "comment_receipt_receipttype_enum_old" AS ENUM(\'Read\', \'Received\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "receiptType" TYPE "comment_receipt_receipttype_enum_old" USING "receiptType"::"text"::"comment_receipt_receipttype_enum_old"')
    await queryRunner.query('DROP TYPE "comment_receipt_receipttype_enum"')
    await queryRunner.query('ALTER TYPE "comment_receipt_receipttype_enum_old" RENAME TO  "comment_receipt_receipttype_enum"')
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e" UNIQUE ("receiptType", "commentId", "sessionUserId")')
    await queryRunner.query('CREATE INDEX "IDX_f736cb6fa80cb5ebe23eb132fd" ON "comment_receipt" ("receiptType", "collectionId", "sessionUserId") ')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP COLUMN "isReceived"')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP COLUMN "isRead"')
  }

}
