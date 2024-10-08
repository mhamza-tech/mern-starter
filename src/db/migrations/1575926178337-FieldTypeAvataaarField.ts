import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldTypeAvataaarField1575926178337 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"')
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'NumberField\', \'StringField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\', \'ActionsField\', \'AnimationField\', \'PresenceField\', \'JSONObjectField\', \'TileField\', \'AvataaarField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" USING "type"::"text"::"field_type_enum"')
    await queryRunner.query('DROP TYPE "field_type_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "field_type_enum_old" AS ENUM(\'ActionsField\', \'AnimationField\', \'BooleanField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'DateField\', \'JSONObjectField\', \'NewsfeedItemCard\', \'NumberField\', \'PresenceField\', \'StringField\', \'TileField\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum_old" USING "type"::"text"::"field_type_enum_old"')
    await queryRunner.query('DROP TYPE "field_type_enum"')
    await queryRunner.query('ALTER TYPE "field_type_enum_old" RENAME TO  "field_type_enum"')
  }

}
