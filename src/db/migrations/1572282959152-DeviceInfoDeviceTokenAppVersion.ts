import {MigrationInterface, QueryRunner } from 'typeorm'

export class DeviceInfoDeviceTokenAppVersion1572282959152 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "device_info" DROP CONSTRAINT "UQ_53406d97f051ec36972d16203b0"')
    await queryRunner.query('ALTER TABLE "device_info" DROP COLUMN "version"')
    await queryRunner.query('ALTER TABLE "device_info" DROP COLUMN "fcmToken"')
    await queryRunner.query('ALTER TABLE "device_info" ADD "osVersion" character varying')
    await queryRunner.query('ALTER TABLE "device_info" ADD "appVersion" character varying')
    await queryRunner.query('ALTER TABLE "device_info" ADD "deviceToken" character varying')
    await queryRunner.query('ALTER TYPE "public"."user_entitytype_enum" RENAME TO "user_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum" USING "entityType"::"text"::"user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."device_info_entitytype_enum" RENAME TO "device_info_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum" USING "entityType"::"text"::"device_info_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "device_info" ADD CONSTRAINT "UQ_b26bf5790c15d91977b0b8b9630" UNIQUE ("userId", "deviceToken")')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "device_info" DROP CONSTRAINT "UQ_b26bf5790c15d91977b0b8b9630"')
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\')')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" TYPE "device_info_entitytype_enum_old" USING "entityType"::"text"::"device_info_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "device_info" ALTER COLUMN "entityType" SET DEFAULT \'DeviceInfo\'')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "device_info_entitytype_enum_old" RENAME TO  "device_info_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum_old" USING "entityType"::"text"::"user_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "user_entitytype_enum_old" RENAME TO  "user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "device_info" DROP COLUMN "deviceToken"')
    await queryRunner.query('ALTER TABLE "device_info" DROP COLUMN "appVersion"')
    await queryRunner.query('ALTER TABLE "device_info" DROP COLUMN "osVersion"')
    await queryRunner.query('ALTER TABLE "device_info" ADD "fcmToken" character varying')
    await queryRunner.query('ALTER TABLE "device_info" ADD "version" character varying')
    await queryRunner.query('ALTER TABLE "device_info" ADD CONSTRAINT "UQ_53406d97f051ec36972d16203b0" UNIQUE ("fcmToken", "userId")')
  }

}
