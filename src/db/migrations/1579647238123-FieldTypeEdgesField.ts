import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldTypeEdgesField1579647238123 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"')
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"')
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\', \'HashStatusField\', \'HashtributeField\', \'ProgressField\', \'EdgesField\', \'ActionXEdgesField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"')
    await queryRunner.query('DROP TYPE "field_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("collectionId", "type", "isDeleted", "updatedAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"')
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\', \'HashStatusField\', \'HashtributeField\', \'ProgressField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"')
    await queryRunner.query('DROP TYPE "field_type_enum"')
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO  "field_type_enum"')
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("type", "updatedAt", "collectionId", "isDeleted") ')
  }

}
