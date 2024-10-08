import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteXpFieldType1589905231274 implements MigrationInterface {

  name = 'DeleteXpFieldType1589905231274'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"')
    await queryRunner.query('DROP INDEX "IDX_6871f24215af73672bcd4988db"')
    await queryRunner.query('UPDATE "field" SET "type" = \'NumberField\' WHERE "type" = \'XpField\'')
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"')
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\', \'HashStatusField\', \'HashtributeField\', \'ProgressField\', \'CountdownField\', \'EdgesField\', \'ActionXEdgesField\', \'ActionXStubsField\', \'StoryStatusField\', \'ButtonField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"')
    await queryRunner.query('DROP TYPE "field_type_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("collectionId", "type", "isDeleted", "updatedAt") ')
    await queryRunner.query('CREATE INDEX "IDX_6871f24215af73672bcd4988db" ON "field" ("thisEntityId", "type", "isDeleted", "updatedAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_6871f24215af73672bcd4988db"')
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"')
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'ActionXEdgesField\', \'ActionXStubsField\', \'ActionsField\', \'AnimationField\', \'AvataaarField\', \'BooleanField\', \'ButtonField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'CountdownField\', \'DateField\', \'EdgesField\', \'HashStatusField\', \'HashtributeField\', \'JSONObjectField\', \'NewsfeedItemCard\', \'NumberField\', \'PresenceField\', \'ProgressField\', \'StoryStatusField\', \'StringField\', \'TileField\', \'XpField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"')
    await queryRunner.query('DROP TYPE "field_type_enum"')
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO "field_type_enum"')
    await queryRunner.query('UPDATE "field" SET "type" = \'XpField\' WHERE "name" = \'xp\'')
    await queryRunner.query('CREATE INDEX "IDX_6871f24215af73672bcd4988db" ON "field" ("type", "thisEntityId", "updatedAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("type", "updatedAt", "collectionId", "isDeleted") ')
  }

}
