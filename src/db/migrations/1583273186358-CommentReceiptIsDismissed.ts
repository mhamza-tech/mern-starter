import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentReceiptIsDismissed1583273186358 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD "isDismissed" boolean NOT NULL DEFAULT false')
    await queryRunner.query('DROP INDEX "IDX_8e4c48883528e50fb55ab6e68f"')
    await queryRunner.query('DROP INDEX "IDX_60f1bdc39bf1451f479aa8a388"')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e"')
    await queryRunner.query('ALTER TYPE "public"."comment_receipt_receipttype_enum" RENAME TO "comment_receipt_receipttype_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_receipt_receipttype_enum" AS ENUM(\'Received\', \'Read\', \'Dismissed\', \'Receipt\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "receiptType" TYPE "comment_receipt_receipttype_enum" USING "receiptType"::"text"::"comment_receipt_receipttype_enum"')
    await queryRunner.query('DROP TYPE "comment_receipt_receipttype_enum_old"')
    await queryRunner.query('ALTER TABLE "receipt" DROP CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6"')
    await queryRunner.query('ALTER TYPE "public"."receipt_type_enum" RENAME TO "receipt_type_enum_old"')
    await queryRunner.query('CREATE TYPE "receipt_type_enum" AS ENUM(\'Received\', \'Read\', \'Dismissed\', \'Receipt\')')
    await queryRunner.query('ALTER TABLE "receipt" ALTER COLUMN "type" TYPE "receipt_type_enum" USING "type"::"text"::"receipt_type_enum"')
    await queryRunner.query('DROP TYPE "receipt_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_8e4c48883528e50fb55ab6e68f" ON "comment_receipt" ("sessionUserId", "receiptType", "isRead") ')
    await queryRunner.query('CREATE INDEX "IDX_60f1bdc39bf1451f479aa8a388" ON "comment_receipt" ("sessionUserId", "collectionId", "receiptType", "isRead") ')
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e" UNIQUE ("commentId", "sessionUserId", "receiptType")')
    await queryRunner.query('ALTER TABLE "receipt" ADD CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6" UNIQUE ("entityEid", "sessionUserId", "type")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "receipt" DROP CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6"')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e"')
    await queryRunner.query('DROP INDEX "IDX_60f1bdc39bf1451f479aa8a388"')
    await queryRunner.query('DROP INDEX "IDX_8e4c48883528e50fb55ab6e68f"')
    await queryRunner.query('CREATE TYPE "receipt_type_enum_old" AS ENUM(\'Read\', \'Receipt\', \'Received\')')
    await queryRunner.query('ALTER TABLE "receipt" ALTER COLUMN "type" TYPE "receipt_type_enum_old" USING "type"::"text"::"receipt_type_enum_old"')
    await queryRunner.query('DROP TYPE "receipt_type_enum"')
    await queryRunner.query('ALTER TYPE "receipt_type_enum_old" RENAME TO  "receipt_type_enum"')
    await queryRunner.query('ALTER TABLE "receipt" ADD CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6" UNIQUE ("type", "entityEid", "sessionUserId")')
    await queryRunner.query('CREATE TYPE "comment_receipt_receipttype_enum_old" AS ENUM(\'Read\', \'Receipt\', \'Received\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "receiptType" TYPE "comment_receipt_receipttype_enum_old" USING "receiptType"::"text"::"comment_receipt_receipttype_enum_old"')
    await queryRunner.query('DROP TYPE "comment_receipt_receipttype_enum"')
    await queryRunner.query('ALTER TYPE "comment_receipt_receipttype_enum_old" RENAME TO  "comment_receipt_receipttype_enum"')
    await queryRunner.query('ALTER TABLE "comment_receipt" ADD CONSTRAINT "UQ_14b817fb9127a1e6f0e163b163e" UNIQUE ("receiptType", "commentId", "sessionUserId")')
    await queryRunner.query('CREATE INDEX "IDX_60f1bdc39bf1451f479aa8a388" ON "comment_receipt" ("receiptType", "collectionId", "sessionUserId", "isRead") ')
    await queryRunner.query('CREATE INDEX "IDX_8e4c48883528e50fb55ab6e68f" ON "comment_receipt" ("receiptType", "sessionUserId", "isRead") ')
    await queryRunner.query('ALTER TABLE "comment_receipt" DROP COLUMN "isDismissed"')
  }

}
