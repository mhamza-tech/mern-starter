import {MigrationInterface, QueryRunner } from 'typeorm'

export class CompletedAction1573690473159 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\')')
    await queryRunner.query('CREATE TYPE "completed_action_type_enum" AS ENUM(\'ChatRoomAction\')')
    await queryRunner.query('CREATE TABLE "completed_action" ("id" character varying NOT NULL, "entityType" "completed_action_entitytype_enum" NOT NULL DEFAULT \'CompletedAction\', "type" "completed_action_type_enum" NOT NULL, "contextEid" character varying NOT NULL, "sessionUserId" character varying NOT NULL, "trackingId" character varying, "input" json NOT NULL, "output" json, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_950c85b6f46b1771c4bbfde5063" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_81faa3af5daab30f4b5dd3feaa" ON "completed_action" ("sessionUserId") ')
    await queryRunner.query('CREATE INDEX "IDX_a0d063d768f6187e68168f108b" ON "completed_action" ("contextEid") ')
    await queryRunner.query('ALTER TYPE "public"."un_object_entitytype_enum" RENAME TO "un_object_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum" USING "entityType"::"text"::"un_object_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'SubmitAction\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum_old" USING "entityType"::"text"::"un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "un_object_entitytype_enum_old" RENAME TO  "un_object_entitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_a0d063d768f6187e68168f108b"')
    await queryRunner.query('DROP INDEX "IDX_81faa3af5daab30f4b5dd3feaa"')
    await queryRunner.query('DROP TABLE "completed_action"')
    await queryRunner.query('DROP TYPE "completed_action_type_enum"')
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum"')
  }

}
