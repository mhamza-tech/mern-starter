import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldThisEntityIdTypeIndex1583945817181 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_6871f24215af73672bcd4988db" ON "field" ("thisEntityId", "type", "isDeleted", "updatedAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_6871f24215af73672bcd4988db"')
  }

}
