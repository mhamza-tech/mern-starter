import {MigrationInterface, QueryRunner } from 'typeorm'

export class CommentOptimisticId1575664162603 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" ADD "optimisticId" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "comment" DROP COLUMN "optimisticId"')
  }

}
