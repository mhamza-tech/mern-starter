import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemNodeType1572415219662 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    // await queryRunner.query(`ALTER TABLE "newsfeed_item" DROP COLUMN "type"`);
    await queryRunner.query('CREATE TYPE "newsfeed_item_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemQuote\', \'NewsfeedItemInteraction\', \'NewsfeedItemSuggestedObjects\')')
    // await queryRunner.query(`ALTER TABLE "newsfeed_item" ADD "type" "newsfeed_item_type_enum" NOT NULL`);
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "type" TYPE "newsfeed_item_type_enum" using type::newsfeed_item_type_enum ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "type" TYPE character varying NOT NULL ')
    // await queryRunner.query(`ALTER TABLE "newsfeed_item" DROP COLUMN "type"`);
    await queryRunner.query('DROP TYPE "newsfeed_item_type_enum"')
    // await queryRunner.query(`ALTER TABLE "newsfeed_item" ADD "type" character varying NOT NULL`);
  }

}
