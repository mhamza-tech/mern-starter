import {MigrationInterface, QueryRunner } from 'typeorm'

export class QEdgeIndexType1575522753925 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_af4de28d7eabe259e2b7b7b628"')
    await queryRunner.query('DROP INDEX "IDX_e080377e8153738d8340f22084"')
    await queryRunner.query('CREATE INDEX "IDX_5e2a42f871112e5b5c7d48fb75" ON "q_edge" ("thisEntityId", "type", "isDeleted") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_5df96bdcf5ec8bb3475cf63772" ON "q_edge" ("thisEntityId", "thatEntityId", "type") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_5df96bdcf5ec8bb3475cf63772"')
    await queryRunner.query('DROP INDEX "IDX_5e2a42f871112e5b5c7d48fb75"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_e080377e8153738d8340f22084" ON "q_edge" ("thisEntityId", "thatEntityId") ')
    await queryRunner.query('CREATE INDEX "IDX_af4de28d7eabe259e2b7b7b628" ON "q_edge" ("thisEntityId", "isDeleted") ')
  }

}
