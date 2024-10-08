import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeIsDeleted1575431252653 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_c258d38dc587cd440e373a2b5e"')
    await queryRunner.query('DROP INDEX "IDX_ff37dd11dbf72cfef180da710a"')
    await queryRunner.query('DROP INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c"')
    await queryRunner.query('DROP INDEX "IDX_ca14d9d76f0b2de73399d0d416"')
    await queryRunner.query('DROP INDEX "IDX_be30d4621ef2aa387da44139b8"')
    await queryRunner.query('ALTER TABLE "edge" ADD "isDeleted" boolean NOT NULL DEFAULT false')
    await queryRunner.query('CREATE INDEX "IDX_0030a10250e4dac762a479cd85" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_6c9641aa3e5d202059389c4b85" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ef01278590ed1b7c4122884f3a" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_7d1e252bba0e6d119a9ed95cc1" ON "edge" ("thisEntityId", "collectionName", "isDeleted", "order") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_7d1e252bba0e6d119a9ed95cc1"')
    await queryRunner.query('DROP INDEX "IDX_ef01278590ed1b7c4122884f3a"')
    await queryRunner.query('DROP INDEX "IDX_6c9641aa3e5d202059389c4b85"')
    await queryRunner.query('DROP INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3"')
    await queryRunner.query('DROP INDEX "IDX_0030a10250e4dac762a479cd85"')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "isDeleted"')
    await queryRunner.query('CREATE INDEX "IDX_be30d4621ef2aa387da44139b8" ON "edge" ("thisEntityId", "collectionName") ')
    await queryRunner.query('CREATE INDEX "IDX_ca14d9d76f0b2de73399d0d416" ON "edge" ("thisEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_0e8a4f537cd05c3d4fa0b2d43c" ON "edge" ("thatEntityId", "edgeType", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ff37dd11dbf72cfef180da710a" ON "edge" ("thatEntityId", "edgeType", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_c258d38dc587cd440e373a2b5e" ON "edge" ("thisEntityId", "edgeType", "order") ')
  }

}
