import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItem1571029111285 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "newsfeed_item_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('CREATE TABLE "newsfeed_item" ("id" character varying NOT NULL, "entityType" "newsfeed_item_entitytype_enum" NOT NULL, "type" character varying NOT NULL, "metadata" json, "trackingId" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5d1b1ba85726b9ae2d9da763ed3" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_7a3e557bde1b993ae14f9d782e" ON "newsfeed_item" ("createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_7a3e557bde1b993ae14f9d782e"')
    await queryRunner.query('DROP TABLE "newsfeed_item"')
    await queryRunner.query('DROP TYPE "newsfeed_item_entitytype_enum"')
  }

}
