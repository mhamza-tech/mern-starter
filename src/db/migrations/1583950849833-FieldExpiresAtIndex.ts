import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldExpiresAtIndex1583950849833 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_9087e5dcfae57bd1f967bd4727" ON "field" ("isDeleted", "expiresAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_9087e5dcfae57bd1f967bd4727"')
  }

}
