import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXInstance1585261748883 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "action_x_instance_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\')')
    await queryRunner.query('CREATE TABLE "action_x_instance" ("id" character varying NOT NULL, "entityType" "action_x_instance_entitytype_enum" NOT NULL DEFAULT \'ActionXInstance\', "playerId" character varying NOT NULL, "actionName" character varying NOT NULL, "metadata" json, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_82f21749114e88b0783c5a4dcc3" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_a1d728cdb0f9c41a3a97567c16" ON "action_x_instance" ("playerId", "actionName", "createdAt", "isDeleted") ')
    await queryRunner.query('ALTER TYPE "public"."action_x_entitytype_enum" RENAME TO "action_x_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "action_x_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\')')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" TYPE "action_x_entitytype_enum" USING "entityType"::"text"::"action_x_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" SET DEFAULT \'ActionX\'')
    await queryRunner.query('DROP TYPE "action_x_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."un_object_entitytype_enum" RENAME TO "un_object_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum" USING "entityType"::"text"::"un_object_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."completed_action_entitytype_enum" RENAME TO "completed_action_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\')')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum" USING "entityType"::"text"::"completed_action_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'')
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\')')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum_old" USING "entityType"::"text"::"completed_action_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'')
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "completed_action_entitytype_enum_old" RENAME TO  "completed_action_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum_old" USING "entityType"::"text"::"un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "un_object_entitytype_enum_old" RENAME TO  "un_object_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "action_x_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\')')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" TYPE "action_x_entitytype_enum_old" USING "entityType"::"text"::"action_x_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" SET DEFAULT \'ActionX\'')
    await queryRunner.query('DROP TYPE "action_x_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "action_x_entitytype_enum_old" RENAME TO  "action_x_entitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_a1d728cdb0f9c41a3a97567c16"')
    await queryRunner.query('DROP TABLE "action_x_instance"')
    await queryRunner.query('DROP TYPE "action_x_instance_entitytype_enum"')
  }

}
