import {MigrationInterface, QueryRunner} from 'typeorm'

export class ModalEffects1588610157526 implements MigrationInterface {

  name = 'ModalEffects1588610157526'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\', \'VibrationEffect\', \'SystemMessageEffect\', \'InteractionEffect\', \'AnimationSequenceEffect\', \'SequenceEffect\', \'TileEffect\', \'TransferActionEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'ModalEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum_old"', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'AnimationEffect\', \'AnimationSequenceEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'IncrementFieldEffect\', \'InteractionEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'SequenceEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'TileEffect\', \'TransferActionEffect\', \'VibrationEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum"', undefined)
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"', undefined)
  }

}
