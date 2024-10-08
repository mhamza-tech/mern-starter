import {MigrationInterface, QueryRunner} from 'typeorm'

export class ModalEffectUpdate1589213162147 implements MigrationInterface {

  name = 'ModalEffectUpdate1589213162147'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\', \'VibrationEffect\', \'SystemMessageEffect\', \'InteractionEffect\', \'AnimationSequenceEffect\', \'SequenceEffect\', \'ConcurrentEffect\', \'TileEffect\', \'TransferActionEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'ModalEffect\', \'ActionEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum_old"', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'AnimationEffect\', \'AnimationSequenceEffect\', \'ConcurrentEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'IncrementFieldEffect\', \'InteractionEffect\', \'ModalEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'SequenceEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'TileEffect\', \'TransferActionEffect\', \'VibrationEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum"', undefined)
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"', undefined)
  }

}
