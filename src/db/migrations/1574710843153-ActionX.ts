import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionX1574710843153 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "action_x_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\')')
    await queryRunner.query('CREATE TYPE "action_x_type_enum" AS ENUM(\'Action\')')
    await queryRunner.query('CREATE TABLE "action_x" ("id" character varying NOT NULL, "entityType" "action_x_entitytype_enum" NOT NULL DEFAULT \'ActionX\', "type" "action_x_type_enum" NOT NULL, "createdByUserId" character varying, "unObjectId" character varying, "name" character varying NOT NULL, "text" character varying NOT NULL, "description" character varying NOT NULL, "entryId" character varying, "backgroundColor" character varying NOT NULL, "package" character varying NOT NULL, "tags" character varying NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "UQ_19a74dfae2274ddcdaa61723b6a" UNIQUE ("name"), CONSTRAINT "PK_de862298d58a271c8996b204416" PRIMARY KEY ("id"))')
    await queryRunner.query('ALTER TYPE "public"."un_object_entitytype_enum" RENAME TO "un_object_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum" USING "entityType"::"text"::"un_object_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."completed_action_entitytype_enum" RENAME TO "completed_action_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\')')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum" USING "entityType"::"text"::"completed_action_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'')
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\')')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum_old" USING "entityType"::"text"::"completed_action_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'')
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "completed_action_entitytype_enum_old" RENAME TO  "completed_action_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum_old" USING "entityType"::"text"::"un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "un_object_entitytype_enum_old" RENAME TO  "un_object_entitytype_enum"')
    await queryRunner.query('DROP TABLE "action_x"')
    await queryRunner.query('DROP TYPE "action_x_type_enum"')
    await queryRunner.query('DROP TYPE "action_x_entitytype_enum"')
  }

}
