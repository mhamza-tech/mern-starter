import {MigrationInterface, QueryRunner } from 'typeorm'

export class TileImageUrl1576196670179 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ADD "imageUrl" character varying')
    await queryRunner.query('ALTER TABLE "tile" ADD "imageUrl" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "imageUrl"')
    await queryRunner.query('ALTER TABLE "comment" DROP COLUMN "imageUrl"')
  }

}
