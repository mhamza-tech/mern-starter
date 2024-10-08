import {MigrationInterface, QueryRunner} from 'typeorm'

export class VibrationEffect1588310635655 implements MigrationInterface {

  name = 'VibrationEffect1588310635655'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\', \'VibrationEffect\', \'SystemMessageEffect\', \'InteractionEffect\', \'AnimationSequenceEffect\', \'SequenceEffect\', \'TileEffect\', \'TransferActionEffect\', \'CreateActionEffect\', \'DeleteActionEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum_old"', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'AnimationEffect\', \'AnimationSequenceEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'IncrementFieldEffect\', \'InteractionEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'SequenceEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'TileEffect\', \'TransferActionEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum"', undefined)
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"', undefined)
  }

}
