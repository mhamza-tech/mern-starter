import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXIndexName1577910079797 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_30e34c9d2999f633d249b411c9"')
    await queryRunner.query('ALTER TABLE "action_x" DROP CONSTRAINT "UQ_19a74dfae2274ddcdaa61723b6a"')
    await queryRunner.query('CREATE INDEX "IDX_30e34c9d2999f633d249b411c9" ON "action_x" ("isDeleted", "name") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_19a74dfae2274ddcdaa61723b6" ON "action_x" ("name") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_19a74dfae2274ddcdaa61723b6"')
    await queryRunner.query('DROP INDEX "IDX_30e34c9d2999f633d249b411c9"')
    await queryRunner.query('ALTER TABLE "action_x" ADD CONSTRAINT "UQ_19a74dfae2274ddcdaa61723b6a" UNIQUE ("name")')
    await queryRunner.query('CREATE INDEX "IDX_30e34c9d2999f633d249b411c9" ON "action_x" ("name", "isDeleted") ')
  }

}
