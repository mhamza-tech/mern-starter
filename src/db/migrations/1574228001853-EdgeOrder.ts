import {MigrationInterface, QueryRunner } from 'typeorm'

export class EdgeOrder1574228001853 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "chat_room" DROP COLUMN "lastActivityAt"')
    await queryRunner.query('ALTER TABLE "edge" ADD "order" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('CREATE INDEX "IDX_c258d38dc587cd440e373a2b5e" ON "edge" ("thisEntityId", "edgeType", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_ff37dd11dbf72cfef180da710a" ON "edge" ("thatEntityId", "edgeType", "order") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_ff37dd11dbf72cfef180da710a"')
    await queryRunner.query('DROP INDEX "IDX_c258d38dc587cd440e373a2b5e"')
    await queryRunner.query('ALTER TABLE "edge" DROP COLUMN "order"')
    await queryRunner.query('ALTER TABLE "chat_room" ADD "lastActivityAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT \'2019-11-01 06:00:00+00\'')
  }

}
