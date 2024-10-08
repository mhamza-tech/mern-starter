import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldCollectionNameOrderIsDeleted1576050187235 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_8b2319303d48c1e48d8ac0e7ff"')
    await queryRunner.query('DROP INDEX "IDX_a273434bbfe829e01f3a304070"')
    await queryRunner.query('ALTER TABLE "field" ADD "collectionName" character varying')
    await queryRunner.query('ALTER TABLE "field" ADD "order" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('ALTER TABLE "field" ADD "isDeleted" boolean NOT NULL DEFAULT false')
    await queryRunner.query('DROP INDEX "IDX_971c9f0b322104f5a2ffd4629f"')
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"')
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\', \'HashStatusField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"')
    await queryRunner.query('DROP TYPE "field_type_enum_old"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "name" DROP NOT NULL')
    await queryRunner.query('CREATE INDEX "IDX_2d0501511ca234c078054b90af" ON "field" ("collectionId", "type", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("collectionId", "type", "isDeleted", "updatedAt") ')
    await queryRunner.query('CREATE INDEX "IDX_0dcb328aa83a523e3e6e1a6067" ON "field" ("collectionId", "collectionName", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_403c12777fc2e5ed7f27e7f436" ON "field" ("collectionId", "collectionName", "isDeleted", "updatedAt") ')
    await queryRunner.query('CREATE INDEX "IDX_e92e5392e775906093c40c072c" ON "field" ("collectionId", "isDeleted", "updatedAt") ')
    await queryRunner.query('CREATE INDEX "IDX_acc3355d2eef2b0bd265a35b8c" ON "field" ("thisEntityId", "isDeleted", "updatedAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_971c9f0b322104f5a2ffd4629f" ON "field" ("collectionId", "name") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_971c9f0b322104f5a2ffd4629f"')
    await queryRunner.query('DROP INDEX "IDX_acc3355d2eef2b0bd265a35b8c"')
    await queryRunner.query('DROP INDEX "IDX_e92e5392e775906093c40c072c"')
    await queryRunner.query('DROP INDEX "IDX_403c12777fc2e5ed7f27e7f436"')
    await queryRunner.query('DROP INDEX "IDX_0dcb328aa83a523e3e6e1a6067"')
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"')
    await queryRunner.query('DROP INDEX "IDX_2d0501511ca234c078054b90af"')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "name" SET NOT NULL')
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"')
    await queryRunner.query('DROP TYPE "field_type_enum"')
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO  "field_type_enum"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_971c9f0b322104f5a2ffd4629f" ON "field" ("name", "collectionId") ')
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "isDeleted"')
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "order"')
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "collectionName"')
    await queryRunner.query('CREATE INDEX "IDX_a273434bbfe829e01f3a304070" ON "field" ("updatedAt", "collectionId") ')
    await queryRunner.query('CREATE INDEX "IDX_8b2319303d48c1e48d8ac0e7ff" ON "field" ("thisEntityId", "updatedAt") ')
  }

}
