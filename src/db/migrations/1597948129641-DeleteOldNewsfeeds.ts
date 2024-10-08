import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteOldNewsfeeds1597948129641 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "newsfeed_item" SET "context" = (("context"::jsonb) - \'item\' - \'move\' - \'hashtribute\')::json, "isDeleted" = TRUE WHERE context::text ~* \'"(item|move|hashtribute)":\'')
    await queryRunner.query('UPDATE "edge" SET "isDeleted" = TRUE WHERE "edgeType" = \'NewsfeedItem\' AND NOT "isDeleted" AND "collectionId" IN (SELECT "id" FROM "newsfeed_item" WHERE "isDeleted")')
  }

  public async down(): Promise<void> {
  }

}
