import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldExpiresAt1583883622474 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "field" ADD "expiresAt" TIMESTAMP WITH TIME ZONE')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "field" DROP COLUMN "expiresAt"')
  }

}
