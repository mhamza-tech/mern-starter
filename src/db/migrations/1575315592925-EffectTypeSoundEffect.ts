import {MigrationInterface, QueryRunner } from 'typeorm'

export class EffectTypeSoundEffect1575315592925 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."effect_type_enum" RENAME TO "effect_type_enum_old"')
    await queryRunner.query('CREATE TYPE "effect_type_enum" AS ENUM(\'AnimationEffect\', \'SaveFieldEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SoundEffect\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum" USING "type"::"text"::"effect_type_enum"')
    await queryRunner.query('DROP TYPE "effect_type_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "effect_type_enum_old" AS ENUM(\'AnimationEffect\', \'IncrementFieldEffect\', \'SaveEdgeEffect\', \'SaveFieldEffect\')')
    await queryRunner.query('ALTER TABLE "effect" ALTER COLUMN "type" TYPE "effect_type_enum_old" USING "type"::"text"::"effect_type_enum_old"')
    await queryRunner.query('DROP TYPE "effect_type_enum"')
    await queryRunner.query('ALTER TYPE "effect_type_enum_old" RENAME TO  "effect_type_enum"')
  }

}
