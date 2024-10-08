import {MigrationInterface, QueryRunner} from 'typeorm'

export class UpdateNewsfeedItemNodeType1594219073744 implements MigrationInterface {

  name = 'UpdateNewsfeedItemNodeType1594219073744'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."newsfeed_item_type_enum" RENAME TO "newsfeed_item_type_enum_old"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemQuote\', \'NewsfeedItemInteraction\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectTile\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemDefault\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "type" TYPE "newsfeed_item_type_enum" USING "type"::"text"::"newsfeed_item_type_enum"')
    await queryRunner.query('DROP TYPE "newsfeed_item_type_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."comment_type_enum" RENAME TO "comment_type_enum_old"')
    await queryRunner.query('CREATE TYPE "comment_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemQuote\', \'NewsfeedItemInteraction\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectTile\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemDefault\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE "comment_type_enum" USING "type"::"text"::"comment_type_enum"')
    await queryRunner.query('DROP TYPE "comment_type_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "comment_type_enum_old" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemInteraction\', \'NewsfeedItemQuote\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemUnObjectTile\')')
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE "comment_type_enum_old" USING "type"::"text"::"comment_type_enum_old"')
    await queryRunner.query('DROP TYPE "comment_type_enum"')
    await queryRunner.query('ALTER TYPE "comment_type_enum_old" RENAME TO  "comment_type_enum"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_type_enum_old" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemComposedImage\', \'NewsfeedItemComposedImageWithText\', \'NewsfeedItemInteraction\', \'NewsfeedItemQuote\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemSuggestedObjects\', \'NewsfeedItemUnObjectCard\', \'NewsfeedItemUnObjectImage\', \'NewsfeedItemUnObjectTile\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "type" TYPE "newsfeed_item_type_enum_old" USING "type"::"text"::"newsfeed_item_type_enum_old"')
    await queryRunner.query('DROP TYPE "newsfeed_item_type_enum"')
    await queryRunner.query('ALTER TYPE "newsfeed_item_type_enum_old" RENAME TO  "newsfeed_item_type_enum"')
  }

}
