import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class FriendRequestAddColumn1588354024798 implements MigrationInterface {

  name = 'FriendRequestAddColumn1588354024798'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_76160414095ac6df250c140eea"', undefined)
    await queryRunner.query('ALTER TABLE "friend_request" ADD "isDeleted" boolean NOT NULL DEFAULT false', undefined)
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'InteractionEffect\', \'AnimationSequenceEffect\', \'SequenceEffect\', \'TileEffect\', \'TransferActionEffect\', \'CreateActionEffect\', \'DeleteActionEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum_old"', undefined)
    await queryRunner.query('CREATE INDEX "IDX_6f192c5d231ff524c821c7bf3a" ON "friend_request" ("senderId", "receiverId", "status", "isDeleted") ', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_6f192c5d231ff524c821c7bf3a"', undefined)
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'AnimationEffect\', \'AnimationSequenceEffect\', \'CreateActionEffect\', \'DeleteActionEffect\', \'IncrementFieldEffect\', \'InteractionEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\', \'SaveTileEffect\', \'SequenceEffect\', \'SoundEffect\', \'SystemMessageEffect\', \'TileEffect\', \'TransferActionEffect\', \'VibrationEffect\')', undefined)
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"', undefined)
    await queryRunner.query('DROP TYPE "effect_type_enum"', undefined)
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"', undefined)
    await queryRunner.query('ALTER TABLE "friend_request" DROP COLUMN "isDeleted"', undefined)
    await queryRunner.query('CREATE INDEX "IDX_76160414095ac6df250c140eea" ON "friend_request" ("senderId", "receiverId", "status") ', undefined)
  }

}
