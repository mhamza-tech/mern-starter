import {MigrationInterface, QueryRunner } from 'typeorm'

export class Receipt1573673087773 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "receipt_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('CREATE TYPE "receipt_type_enum" AS ENUM(\'Received\', \'Read\')')
    await queryRunner.query('CREATE TABLE "receipt" ("id" character varying NOT NULL, "entityType" "receipt_entitytype_enum" NOT NULL DEFAULT \'Receipt\', "type" "receipt_type_enum" NOT NULL, "entityCollectionId" character varying NOT NULL, "entityEid" character varying NOT NULL, "sessionUserId" character varying NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "UQ_f9f071fd7b9e5fb2f054b8191d6" UNIQUE ("entityEid", "sessionUserId", "type"), CONSTRAINT "PK_b4b9ec7d164235fbba023da9832" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_b4657799c2c92fd7c873749246" ON "receipt" ("entityEid") ')
    await queryRunner.query('ALTER TYPE "public"."edge_thisentitytype_enum" RENAME TO "edge_thisentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum" USING "thisEntityType"::"text"::"edge_thisentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."edge_thatentitytype_enum" RENAME TO "edge_thatentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum" USING "thatEntityType"::"text"::"edge_thatentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."effect_entitytype_enum" RENAME TO "effect_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "effect_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" TYPE "effect_entitytype_enum" USING "entityType"::"text"::"effect_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" SET DEFAULT \'Effect\'')
    await queryRunner.query('DROP TYPE "effect_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."newsfeed_item_entitytype_enum" RENAME TO "newsfeed_item_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" TYPE "newsfeed_item_entitytype_enum" USING "entityType"::"text"::"newsfeed_item_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" SET DEFAULT \'NewsfeedItem\'')
    await queryRunner.query('DROP TYPE "newsfeed_item_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."comment_entitytype_enum" RENAME TO "comment_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" TYPE "comment_entitytype_enum" USING "entityType"::"text"::"comment_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" SET DEFAULT \'Comment\'')
    await queryRunner.query('DROP TYPE "comment_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."comment_receipt_entitytype_enum" RENAME TO "comment_receipt_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_receipt_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" TYPE "comment_receipt_entitytype_enum" USING "entityType"::"text"::"comment_receipt_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" SET DEFAULT \'CommentReceipt\'')
    await queryRunner.query('DROP TYPE "comment_receipt_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."field_entitytype_enum" RENAME TO "field_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "field_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" TYPE "field_entitytype_enum" USING "entityType"::"text"::"field_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" SET DEFAULT \'Field\'')
    await queryRunner.query('DROP TYPE "field_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."field_thisentitytype_enum" RENAME TO "field_thisentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "field_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "thisEntityType" TYPE "field_thisentitytype_enum" USING "thisEntityType"::"text"::"field_thisentitytype_enum"')
    await queryRunner.query('DROP TYPE "field_thisentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."chat_room_entitytype_enum" RENAME TO "chat_room_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "chat_room_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" TYPE "chat_room_entitytype_enum" USING "entityType"::"text"::"chat_room_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" SET DEFAULT \'ChatRoom\'')
    await queryRunner.query('DROP TYPE "chat_room_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."notification_entitytype_enum" RENAME TO "notification_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "notification_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" TYPE "notification_entitytype_enum" USING "entityType"::"text"::"notification_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" SET DEFAULT \'Notification\'')
    await queryRunner.query('DROP TYPE "notification_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "notification_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" TYPE "notification_entitytype_enum_old" USING "entityType"::"text"::"notification_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "entityType" SET DEFAULT \'Notification\'')
    await queryRunner.query('DROP TYPE "notification_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "notification_entitytype_enum_old" RENAME TO  "notification_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "chat_room_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" TYPE "chat_room_entitytype_enum_old" USING "entityType"::"text"::"chat_room_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "chat_room" ALTER COLUMN "entityType" SET DEFAULT \'ChatRoom\'')
    await queryRunner.query('DROP TYPE "chat_room_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "chat_room_entitytype_enum_old" RENAME TO  "chat_room_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "field_thisentitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "thisEntityType" TYPE "field_thisentitytype_enum_old" USING "thisEntityType"::"text"::"field_thisentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "field_thisentitytype_enum"')
    await queryRunner.query('ALTER TYPE "field_thisentitytype_enum_old" RENAME TO  "field_thisentitytype_enum"')
    await queryRunner.query('CREATE TYPE "field_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" TYPE "field_entitytype_enum_old" USING "entityType"::"text"::"field_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "entityType" SET DEFAULT \'Field\'')
    await queryRunner.query('DROP TYPE "field_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "field_entitytype_enum_old" RENAME TO  "field_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "comment_receipt_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" TYPE "comment_receipt_entitytype_enum_old" USING "entityType"::"text"::"comment_receipt_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "comment_receipt" ALTER COLUMN "entityType" SET DEFAULT \'CommentReceipt\'')
    await queryRunner.query('DROP TYPE "comment_receipt_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "comment_receipt_entitytype_enum_old" RENAME TO  "comment_receipt_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "comment_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" TYPE "comment_entitytype_enum_old" USING "entityType"::"text"::"comment_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "entityType" SET DEFAULT \'Comment\'')
    await queryRunner.query('DROP TYPE "comment_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "comment_entitytype_enum_old" RENAME TO  "comment_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" TYPE "newsfeed_item_entitytype_enum_old" USING "entityType"::"text"::"newsfeed_item_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" SET DEFAULT \'NewsfeedItem\'')
    await queryRunner.query('DROP TYPE "newsfeed_item_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "newsfeed_item_entitytype_enum_old" RENAME TO  "newsfeed_item_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "effect_entitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" TYPE "effect_entitytype_enum_old" USING "entityType"::"text"::"effect_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "entityType" SET DEFAULT \'Effect\'')
    await queryRunner.query('DROP TYPE "effect_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "effect_entitytype_enum_old" RENAME TO  "effect_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum_old" USING "thatEntityType"::"text"::"edge_thatentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thatentitytype_enum_old" RENAME TO  "edge_thatentitytype_enum"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum_old" AS ENUM(\'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'DeviceInfo\', \'Effect\', \'Field\', \'NewsfeedItem\', \'Notification\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum_old" USING "thisEntityType"::"text"::"edge_thisentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thisentitytype_enum_old" RENAME TO  "edge_thisentitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_b4657799c2c92fd7c873749246"')
    await queryRunner.query('DROP TABLE "receipt"')
    await queryRunner.query('DROP TYPE "receipt_type_enum"')
    await queryRunner.query('DROP TYPE "receipt_entitytype_enum"')
  }

}
