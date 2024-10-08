import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeCompositeIndexes1571356209255 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_999672a732844c621fa8377683" ON "edge" ("thisEntityId") ')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_61a65b91926c47f35f2524fa77" ON "edge" ("thisEntityId", "name") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_61a65b91926c47f35f2524fa77"')
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('DROP INDEX "IDX_999672a732844c621fa8377683"')
  }

}
