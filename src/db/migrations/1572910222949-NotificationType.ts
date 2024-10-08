import {MigrationInterface, QueryRunner } from 'typeorm'

export class NotificationType1572910222949 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"')
    await queryRunner.query('CREATE TYPE "notification_type_enum" AS ENUM(\'ChatRoomInviteNotification\', \'ChatRoomCommentNotification\', \'NewsfeedItemCommentNotification\', \'NewsfeedItemReactionNotification\', \'CommentReactionNotification\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum" USING "type"::"text"::"notification_type_enum"')
    await queryRunner.query('DROP TYPE "notification_type_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "notification_type_enum_old" AS ENUM(\'ChatRoomInvite\', \'ChatRoomComment\', \'NewsfeedItemComment\', \'NewsfeedItemReaction\', \'CommentReaction\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum_old" USING "type"::"text"::"notification_type_enum_old"')
    await queryRunner.query('DROP TYPE "notification_type_enum"')
    await queryRunner.query('ALTER TYPE "notification_type_enum_old" RENAME TO  "notification_type_enum"')
  }

}
