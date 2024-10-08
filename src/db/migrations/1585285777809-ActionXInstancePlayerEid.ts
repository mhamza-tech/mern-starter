import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXInstancePlayerEid1585285777809 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_a1d728cdb0f9c41a3a97567c16"')
    await queryRunner.query('ALTER TABLE "action_x_instance" RENAME COLUMN "playerId" TO "playerEid"')
    await queryRunner.query('CREATE INDEX "IDX_c155c247fcb93a6e94c9dcec36" ON "action_x_instance" ("playerEid", "actionName", "createdAt", "isDeleted") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_c155c247fcb93a6e94c9dcec36"')
    await queryRunner.query('ALTER TABLE "action_x_instance" RENAME COLUMN "playerEid" TO "playerId"')
    await queryRunner.query('CREATE INDEX "IDX_a1d728cdb0f9c41a3a97567c16" ON "action_x_instance" ("playerId", "actionName", "isDeleted", "createdAt") ')
  }

}
