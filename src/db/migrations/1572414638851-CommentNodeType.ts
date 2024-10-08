import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentNodeType1572414638851 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    // await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "type"`);
    await queryRunner.query('CREATE TYPE "comment_type_enum" AS ENUM(\'ChatRoomComment\', \'ChatRoomSystemComment\', \'NewsfeedItemComment\', \'NewsfeedItemStatusUpdate\', \'NewsfeedItemQuote\', \'NewsfeedItemInteraction\', \'NewsfeedItemSuggestedObjects\')')
    // await queryRunner.query(`ALTER TABLE "comment" ADD "type" "comment_type_enum" NOT NULL`);
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE "comment_type_enum" using type::comment_type_enum ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ALTER COLUMN "type" TYPE character varying NOT NULL ')
    // await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "type"`);
    await queryRunner.query('DROP TYPE "comment_type_enum"')
    // await queryRunner.query(`ALTER TABLE "comment" ADD "type" character varying NOT NULL`);
  }

}
