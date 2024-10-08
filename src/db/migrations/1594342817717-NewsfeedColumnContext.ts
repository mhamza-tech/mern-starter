import {MigrationInterface, QueryRunner} from 'typeorm'

export class NewsfeedColumnContext1594342817717 implements MigrationInterface {

  name = 'NewsfeedColumnContext1594342817717'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "newsfeed_item"')
    await queryRunner.query('TRUNCATE "user_newsfeed_item_edge"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" RENAME COLUMN "playersEid" TO "context"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "context"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "context" json NOT NULL')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "expiresAt" SET DEFAULT null')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "expiresAt" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "context"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "context" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "newsfeed_item" RENAME COLUMN "context" TO "playersEid"')
  }

}
