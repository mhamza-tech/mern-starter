import {MigrationInterface, QueryRunner} from 'typeorm'

export class PostNotifications1593529080247 implements MigrationInterface {

  name = 'PostNotifications1593529080247'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"')
    await queryRunner.query('CREATE TYPE "notification_type_enum" AS ENUM(\'ChatRoomInviteNotification\', \'ChatRoomCommentNotification\', \'ChatRoomActionNotification\', \'NewsfeedItemPostNotification\', \'NewsfeedItemCommentNotification\', \'NewsfeedItemReactionNotification\', \'CommentReactionNotification\', \'HandlerNotification\', \'NewFollowerNotification\', \'NewFriendRequestNotification\', \'FriendRequestAcceptedNotification\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum" USING "type"::"text"::"notification_type_enum"')
    await queryRunner.query('DROP TYPE "notification_type_enum_old"')
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "creatorEid" DROP DEFAULT')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "creatorEid" SET DEFAULT \'\'')
    await queryRunner.query('CREATE TYPE "notification_type_enum_old" AS ENUM(\'ChatRoomActionNotification\', \'ChatRoomCommentNotification\', \'ChatRoomInviteNotification\', \'CommentReactionNotification\', \'FriendRequestAcceptedNotification\', \'HandlerNotification\', \'NewFollowerNotification\', \'NewFriendRequestNotification\', \'NewsfeedItemCommentNotification\', \'NewsfeedItemReactionNotification\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum_old" USING "type"::"text"::"notification_type_enum_old"')
    await queryRunner.query('DROP TYPE "notification_type_enum"')
    await queryRunner.query('ALTER TYPE "notification_type_enum_old" RENAME TO  "notification_type_enum"')
  }

}
