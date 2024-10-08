import {MigrationInterface, QueryRunner} from 'typeorm'

export class AddNewsfeedColumns1594205051154 implements MigrationInterface {

  name = 'AddNewsfeedColumns1594205051154'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "newsfeed_item"')
    await queryRunner.query('TRUNCATE "user_newsfeed_item_edge"')
    await queryRunner.query('DELETE FROM "edge" WHERE "thisEntityType" = \'NewsfeedItem\' OR "thatEntityType" = \'NewsfeedItem\'')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "forUserId"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "fromEid" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "playersEid" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "expiresAt" TIMESTAMP DEFAULT null')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "expiresAt"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "playersEid"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" DROP COLUMN "fromEid"')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ADD "forUserId" character varying')
    await queryRunner.query('CREATE INDEX "IDX_f4b39f8cada8417d8cb5790e77" ON "newsfeed_item" ("createdAt", "isDeleted", "forUserId") ')
  }

}
