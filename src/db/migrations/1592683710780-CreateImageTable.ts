import {MigrationInterface, QueryRunner} from 'typeorm'

export class CreateImageTable1592683710780 implements MigrationInterface {

  name = 'CreateImageTable1592683710780'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "image" ("id" character varying NOT NULL, "name" character varying NOT NULL, "storageService" character varying, "mimetype" character varying NOT NULL, "userId" character varying NOT NULL, "origImageId" character varying, "dimensions" character varying NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))')
    await queryRunner.query('ALTER TYPE "public"."user_entitytype_enum" RENAME TO "user_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum" USING "entityType"::"text"::"user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."device_info_entitytype_enum" RENAME TO "device_info_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum" USING "entityType"::"text"::"device_info_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."report_entitytype_enum" RENAME TO "report_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "report_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" TYPE "report_entitytype_enum" USING "entityType"::"text"::"report_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" SET DEFAULT \'Report\'')
    await queryRunner.query('DROP TYPE "report_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "report_entitytype_enum_old" AS ENUM(\'ActionX\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" TYPE "report_entitytype_enum_old" USING "entityType"::"text"::"report_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "report" ALTER COLUMN "entityType" SET DEFAULT \'Report\'')
    await queryRunner.query('DROP TYPE "report_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "report_entitytype_enum_old" RENAME TO  "report_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum_old" AS ENUM(\'ActionX\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum_old" USING "entityType"::"text"::"device_info_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "device_info_entitytype_enum_old" RENAME TO  "device_info_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum_old" AS ENUM(\'ActionX\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum_old" USING "entityType"::"text"::"user_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "user_entitytype_enum_old" RENAME TO  "user_entitytype_enum"')
    await queryRunner.query('DROP TABLE "image"')
  }

}
