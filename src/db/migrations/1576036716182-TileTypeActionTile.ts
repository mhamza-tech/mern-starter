import {MigrationInterface, QueryRunner } from 'typeorm'

export class TileTypeActionTile1576036716182 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."tile_type_enum" RENAME TO "tile_type_enum_old"')
    await queryRunner.query('CREATE TYPE "tile_type_enum" AS ENUM(\'ImageTile\', \'AnimationTile\', \'ActionTile\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "type" TYPE "tile_type_enum" USING "type"::"text"::"tile_type_enum"')
    await queryRunner.query('DROP TYPE "tile_type_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "tile_type_enum_old" AS ENUM(\'ImageTile\', \'AnimationTile\')')
    await queryRunner.query('ALTER TABLE "tile" ALTER COLUMN "type" TYPE "tile_type_enum_old" USING "type"::"text"::"tile_type_enum_old"')
    await queryRunner.query('DROP TYPE "tile_type_enum"')
    await queryRunner.query('ALTER TYPE "tile_type_enum_old" RENAME TO  "tile_type_enum"')
  }

}
