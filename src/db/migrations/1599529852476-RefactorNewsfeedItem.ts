import {MigrationInterface, QueryRunner} from 'typeorm'

export class RefactorNewsfeedItem1599529852476 implements MigrationInterface {

  name = 'RefactorNewsfeedItem1599529852476'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from "edge" where "collectionId" in (select id from "newsfeed_item" where "type" <> \'NewsfeedItemStatusUpdate\')')
    await queryRunner.query('delete from "newsfeed_item" where "type" <> \'NewsfeedItemStatusUpdate\'')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "type"')
    await queryRunner.query('DROP TYPE "public"."newsfeed_item_type_enum"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_layout_enum" AS ENUM(\'Post1\', \'Dynamic1\', \'Dynamic2\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "layout" "newsfeed_item_layout_enum" NOT NULL DEFAULT \'Post1\'')
    await queryRunner.query('ALTER TABLE "newsfeed_item" alter column "layout" drop default')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "isPublic" boolean NOT NULL DEFAULT false')
    await queryRunner.query('update "newsfeed_item" set "isPublic" = true')
    await queryRunner.query('ALTER TABLE "notification" ADD "isDeleted" boolean NOT NULL DEFAULT false')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "metadata" SET NOT NULL')
    await queryRunner.query('ALTER TYPE "public"."comment_type_enum" RENAME TO "comment_type_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE "comment_type_enum" USING "type"::"text"::"comment_type_enum"')
    await queryRunner.query('DROP TYPE "comment_type_enum_old"')
    await queryRunner.query('delete from "notification" where "type" = \'NewsfeedItemPostNotification\'')
    await queryRunner.query('ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"')
    await queryRunner.query('CREATE TYPE "notification_type_enum" AS ENUM(\'ChatRoomInviteNotification\', \'ChatRoomCommentNotification\', \'ChatRoomActionNotification\', \'NewsfeedItemNotification\', \'NewsfeedItemCommentNotification\', \'NewsfeedItemReactionNotification\', \'CommentReactionNotification\', \'HandlerNotification\', \'NewFollowerNotification\', \'NewFriendRequestNotification\', \'FriendRequestAcceptedNotification\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum" USING "type"::"text"::"notification_type_enum"')
    await queryRunner.query('DROP TYPE "notification_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_ce7328343678af8b2637713d82" ON "notification" ("userId", "isDeleted")')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "userId" character varying NOT NULL DEFAULT \'1234\'')
    await queryRunner.query('update "newsfeed_item" set "userId" = REPLACE("fromEid", \'user/\', \'\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" alter column "userId" drop default')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "stateId" character varying')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "isLive" boolean')
    await queryRunner.query('CREATE INDEX "IDX_85eaf7716abde05335e4e9677a" ON "newsfeed_item" ("userId", "stateId") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_85eaf7716abde05335e4e9677a"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "isLive"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "stateId"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "userId"')
    await queryRunner.query('DROP INDEX "IDX_ce7328343678af8b2637713d82"')
    await queryRunner.query('CREATE TYPE "notification_type_enum_old" AS ENUM(\'ChatRoomActionNotification\', \'ChatRoomCommentNotification\', \'ChatRoomInviteNotification\', \'CommentReactionNotification\', \'FriendRequestAcceptedNotification\', \'HandlerNotification\', \'NewFollowerNotification\', \'NewFriendRequestNotification\', \'NewsfeedItemCommentNotification\', \'NewsfeedItemPostNotification\', \'NewsfeedItemReactionNotification\')')
    await queryRunner.query('ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_enum_old" USING "type"::"text"::"notification_type_enum_old"')
    await queryRunner.query('DROP TYPE "notification_type_enum"')
    await queryRunner.query('ALTER TYPE "notification_type_enum_old" RENAME TO  "notification_type_enum"')
    await queryRunner.query('CREATE TYPE "comment_type_enum_old" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemDefault\', \'NewsfeedItemInteraction\', \'NewsfeedItemQuote\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemUnObjectTile\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE "comment_type_enum_old" USING "type"::"text"::"comment_type_enum_old"')
    await queryRunner.query('DROP TYPE "comment_type_enum"')
    await queryRunner.query('ALTER TYPE "comment_type_enum_old" RENAME TO  "comment_type_enum"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "metadata" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "notification" DROP COLUMN "isDeleted"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "isPublic"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "layout"')
    await queryRunner.query('DROP TYPE "newsfeed_item_layout_enum"')
    await queryRunner.query('CREATE TYPE "public"."newsfeed_item_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemDefault\', \'NewsfeedItemInteraction\', \'NewsfeedItemQuote\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemUnObjectTile\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "type" "newsfeed_item_type_enum" NOT NULL DEFAULT \'NewsfeedItemStatusUpdate\'')
  }

}
