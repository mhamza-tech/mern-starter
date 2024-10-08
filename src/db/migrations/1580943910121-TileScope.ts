import {MigrationInterface, QueryRunner } from 'typeorm'

export class TileScope1580943910121 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "tile_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "tile" ADD "scope" "tile_scope_enum"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "scope"')
    await queryRunner.query('DROP TYPE "tile_scope_enum"')
  }

}
