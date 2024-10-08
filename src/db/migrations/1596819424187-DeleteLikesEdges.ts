import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteLikesEdges1596819424187 implements MigrationInterface {

  name = 'DeleteLikesEdges1596819424187'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "effect" WHERE "type" = \'NativeAnimationEffect\'')
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"')
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\', \'VibrationEffect\', \'SystemMessageEffect\', \'InteractionEffect\', \'AnimationSequenceEffect\', \'SequenceEffect\', \'ConcurrentEffect\', \'TileEffect\', \'TransferActionEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'ModalEffect\', \'ActionEffect\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"')
    await queryRunner.query('DROP TYPE "effect_type_enum_old"')
    await queryRunner.query('update edge set "isDeleted" = true where "edgeType" = \'Likes\'')
    await queryRunner.query('delete from edge_stats where "edgeType" = \'Likes\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('update edge set "isDeleted" = false where "edgeType" = \'Likes\'')
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'ActionEffect\', \'AnimationEffect\', \'AnimationSequenceEffect\', \'ConcurrentEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'IncrementFieldEffect\', \'InteractionEffect\', \'ModalEffect\', \'NativeAnimationEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'SequenceEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'TileEffect\', \'TransferActionEffect\', \'VibrationEffect\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"')
    await queryRunner.query('DROP TYPE "effect_type_enum"')
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"')
  }

}
