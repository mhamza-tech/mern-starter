import {MigrationInterface, QueryRunner } from 'typeorm'

export class EntityScopePrivate1582234202531 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."effect_scope_enum" RENAME TO "effect_scope_enum_old"')
    await queryRunner.query('CREATE TYPE "effect_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\', \'GlobalPrivateScope\', \'ChatRoomPrivateScope\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "scope" TYPE "effect_scope_enum" USING "scope"::"text"::"effect_scope_enum"')
    await queryRunner.query('DROP TYPE "effect_scope_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."field_scope_enum" RENAME TO "field_scope_enum_old"')
    await queryRunner.query('CREATE TYPE "field_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\', \'GlobalPrivateScope\', \'ChatRoomPrivateScope\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "scope" TYPE "field_scope_enum" USING "scope"::"text"::"field_scope_enum"')
    await queryRunner.query('DROP TYPE "field_scope_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."tile_type_enum" RENAME TO "tile_type_enum_old"')
    await queryRunner.query('CREATE TYPE "tile_type_enum" AS ENUM(\'ImageTile\', \'AnimationTile\', \'ActionTile\', \'TextTile\', \'WorldMapTile\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "type" TYPE "tile_type_enum" USING "type"::"text"::"tile_type_enum"')
    await queryRunner.query('DROP TYPE "tile_type_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."tile_scope_enum" RENAME TO "tile_scope_enum_old"')
    await queryRunner.query('CREATE TYPE "tile_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\', \'GlobalPrivateScope\', \'ChatRoomPrivateScope\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "scope" TYPE "tile_scope_enum" USING "scope"::"text"::"tile_scope_enum"')
    await queryRunner.query('DROP TYPE "tile_scope_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "tile_scope_enum_old" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "scope" TYPE "tile_scope_enum_old" USING "scope"::"text"::"tile_scope_enum_old"')
    await queryRunner.query('DROP TYPE "tile_scope_enum"')
    await queryRunner.query('ALTER TYPE "tile_scope_enum_old" RENAME TO  "tile_scope_enum"')
    await queryRunner.query('CREATE TYPE "tile_type_enum_old" AS ENUM(\'ImageTile\', \'AnimationTile\', \'ActionTile\', \'TextTile\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "type" TYPE "tile_type_enum_old" USING "type"::"text"::"tile_type_enum_old"')
    await queryRunner.query('DROP TYPE "tile_type_enum"')
    await queryRunner.query('ALTER TYPE "tile_type_enum_old" RENAME TO  "tile_type_enum"')
    await queryRunner.query('CREATE TYPE "field_scope_enum_old" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "scope" TYPE "field_scope_enum_old" USING "scope"::"text"::"field_scope_enum_old"')
    await queryRunner.query('DROP TYPE "field_scope_enum"')
    await queryRunner.query('ALTER TYPE "field_scope_enum_old" RENAME TO  "field_scope_enum"')
    await queryRunner.query('CREATE TYPE "effect_scope_enum_old" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "scope" TYPE "effect_scope_enum_old" USING "scope"::"text"::"effect_scope_enum_old"')
    await queryRunner.query('DROP TYPE "effect_scope_enum"')
    await queryRunner.query('ALTER TYPE "effect_scope_enum_old" RENAME TO  "effect_scope_enum"')
  }

}
