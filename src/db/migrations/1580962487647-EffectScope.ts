import {MigrationInterface, QueryRunner } from 'typeorm'

export class EffectScope1580962487647 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "effect_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "effect" ADD "scope" "effect_scope_enum"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "effect" DROP COLUMN "scope"')
    await queryRunner.query('DROP TYPE "effect_scope_enum"')
  }

}
