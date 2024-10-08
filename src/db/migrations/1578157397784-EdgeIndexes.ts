import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeIndexes1578157397784 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_122a5e199408329748c083d79a" ON "edge" ("thisEntityId", "collectionId", "collectionName", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_d5782febf4eaea1eddd7f26c19" ON "edge" ("thisEntityId", "collectionId", "edgeType", "isDeleted", "order") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_d5782febf4eaea1eddd7f26c19"')
    await queryRunner.query('DROP INDEX "IDX_122a5e199408329748c083d79a"')
  }

}
