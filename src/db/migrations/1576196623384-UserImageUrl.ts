import {MigrationInterface, QueryRunner } from 'typeorm'

export class UserImageUrl1576196623384 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" ADD "imageUrl" character varying')
    await queryRunner.query('ALTER TYPE "public"."user_entitytype_enum" RENAME TO "user_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum" USING "entityType"::"text"::"user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."device_info_entitytype_enum" RENAME TO "device_info_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum" USING "entityType"::"text"::"device_info_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum_old" USING "entityType"::"text"::"device_info_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "device_info_entitytype_enum_old" RENAME TO  "device_info_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum_old" USING "entityType"::"text"::"user_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "user_entitytype_enum_old" RENAME TO  "user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "imageUrl"')
  }

}
