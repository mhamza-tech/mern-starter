import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeThatEntityIdEdgeTypeIndex1572192921407 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c" ON "edge" ("thatEntityId", "edgeType", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c"')
  }

}
