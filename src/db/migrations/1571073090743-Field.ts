import {MigrationInterface, QueryRunner } from 'typeorm'

export class Field1571073090743 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "field_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('CREATE TYPE "field_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('CREATE TABLE "field" ("id" character varying NOT NULL, "entityType" "field_entitytype_enum" NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "thisEntityId" character varying NOT NULL, "thisEntityType" "field_thisentitytype_enum" NOT NULL, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "UQ_587d17b1cb6c63181e0f1f90745" UNIQUE ("thisEntityId", "name"), CONSTRAINT "PK_39379bba786d7a75226b358f81e" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_2acf9b4a880d0588141b332902" ON "field" ("name") ')
    await queryRunner.query('CREATE INDEX "IDX_74c518296e8b964f0061e180fd" ON "field" ("thisEntityId") ')
    await queryRunner.query('ALTER TYPE "public"."edge_thisentitytype_enum" RENAME TO "edge_thisentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum" USING "thisEntityType"::"text"::"edge_thisentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."edge_thatentitytype_enum" RENAME TO "edge_thatentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum" USING "thatEntityType"::"text"::"edge_thatentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."newsfeed_item_entitytype_enum" RENAME TO "newsfeed_item_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "newsfeed_item_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" TYPE "newsfeed_item_entitytype_enum" USING "entityType"::"text"::"newsfeed_item_entitytype_enum"')
    await queryRunner.query('DROP TYPE "newsfeed_item_entitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "newsfeed_item_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('ALTER TABLE "newsfeed_item" ALTER COLUMN "entityType" TYPE "newsfeed_item_entitytype_enum_old" USING "entityType"::"text"::"newsfeed_item_entitytype_enum_old"')
    await queryRunner.query('DROP TYPE "newsfeed_item_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "newsfeed_item_entitytype_enum_old" RENAME TO  "newsfeed_item_entitytype_enum"')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum_old" USING "thatEntityType"::"text"::"edge_thatentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thatentitytype_enum_old" RENAME TO  "edge_thatentitytype_enum"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum_old" USING "thisEntityType"::"text"::"edge_thisentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thisentitytype_enum_old" RENAME TO  "edge_thisentitytype_enum"')
    await queryRunner.query('DROP INDEX "IDX_74c518296e8b964f0061e180fd"')
    await queryRunner.query('DROP INDEX "IDX_2acf9b4a880d0588141b332902"')
    await queryRunner.query('DROP TABLE "field"')
    await queryRunner.query('DROP TYPE "field_thisentitytype_enum"')
    await queryRunner.query('DROP TYPE "field_entitytype_enum"')
  }

}
