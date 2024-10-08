import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldScope1580932193197 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "field_scope_enum" AS ENUM(\'ChatRoomScope\', \'GlobalScope\')')
    await queryRunner.query('ALTER TABLE "field" ADD "scope" "field_scope_enum"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "scope"')
    await queryRunner.query('DROP TYPE "field_scope_enum"')
  }

}
