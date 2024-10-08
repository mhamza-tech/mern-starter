import {MigrationInterface, QueryRunner } from 'typeorm'

export class UnObjectFeaturedSortKey1582318930367 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "featuredSortKey" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "featuredSortKey"')
  }

}
