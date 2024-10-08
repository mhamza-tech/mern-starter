import { MigrationInterface, QueryRunner } from 'typeorm'

export class CountdownTimerType1587499326486 implements MigrationInterface {

  name = 'CountdownTimerType1587499326486'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"', undefined)
    await queryRunner.query('DROP INDEX "IDX_6871f24215af73672bcd4988db"', undefined)
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\', \'HashStatusField\', \'HashtributeField\', \'ProgressField\', \'CountdownField\', \'EdgesField\', \'ActionXEdgesField\', \'ActionXStubsField\', \'XpField\', \'StoryStatusField\')', undefined)
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"', undefined)
    await queryRunner.query('DROP TYPE "field_type_enum_old"', undefined)
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("collectionId", "type", "isDeleted", "updatedAt") ', undefined)
    await queryRunner.query('CREATE INDEX "IDX_6871f24215af73672bcd4988db" ON "field" ("thisEntityId", "type", "isDeleted", "updatedAt") ', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_6871f24215af73672bcd4988db"', undefined)
    await queryRunner.query('DROP INDEX "IDX_c08ca407f9d2607d70900efd14"', undefined)
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'ActionXEdgesField\', \'ActionXStubsField\', \'ActionsField\', \'AnimationField\', \'AvataaarField\', \'BooleanField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'DateField\', \'EdgesField\', \'HashStatusField\', \'HashtributeField\', \'JSONObjectField\', \'NewsfeedItemCard\', \'NumberField\', \'PresenceField\', \'ProgressField\', \'StoryStatusField\', \'StringField\', \'TileField\', \'XpField\')', undefined)
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"', undefined)
    await queryRunner.query('DROP TYPE "field_type_enum"', undefined)
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO  "field_type_enum"', undefined)
    await queryRunner.query('CREATE INDEX "IDX_6871f24215af73672bcd4988db" ON "field" ("type", "thisEntityId", "updatedAt", "isDeleted") ', undefined)
    await queryRunner.query('CREATE INDEX "IDX_c08ca407f9d2607d70900efd14" ON "field" ("type", "updatedAt", "collectionId", "isDeleted") ', undefined)
  }

}
