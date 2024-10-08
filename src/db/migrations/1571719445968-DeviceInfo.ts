import {MigrationInterface, QueryRunner } from 'typeorm'

export class DeviceInfo1571719445968 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "device_info_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\')')
    await queryRunner.query('CREATE TABLE "device_info" ("id" character varying NOT NULL, "entityType" "device_info_entitytype_enum" NOT NULL DEFAULT \'DeviceInfo\', "os" character varying, "version" character varying, "fcmToken" character varying, "userId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "UQ_53406d97f051ec36972d16203b0" UNIQUE ("userId", "fcmToken"), CONSTRAINT "PK_b1c15a80b0a4e5f4eebadbdd92c" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_f93494a957eb9b931d4c70c2b5" ON "device_info" ("userId") ')
    await queryRunner.query('ALTER TYPE "public"."user_entitytype_enum" RENAME TO "user_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "user_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum" USING "entityType"::"text"::"user_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "user_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" TYPE "user_entitytype_enum_old" USING "entityType"::"text"::"user_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "entityType" SET DEFAULT \'User\'')
    await queryRunner.query('DROP TYPE "user_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "user_entitytype_enum_old" RENAME TO  "user_entitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_f93494a957eb9b931d4c70c2b5"')
    await queryRunner.query('DROP TABLE "device_info"')
    await queryRunner.query('DROP TYPE "device_info_entitytype_enum"')
  }

}
