import {MigrationInterface, QueryRunner } from 'typeorm'

export class JobDispatchAtColumnType1584140152043 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_fa4fdd8ef25bc3788d9f076461"')
    await queryRunner.query('ALTER TABLE "job" ALTER COLUMN "dispatchAt" DROP DEFAULT')
    await queryRunner.query('CREATE INDEX "IDX_fa4fdd8ef25bc3788d9f076461" ON "job" ("isDeleted", "isCompleted", "dispatchAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_fa4fdd8ef25bc3788d9f076461"')
    await queryRunner.query('ALTER TABLE "job" ALTER COLUMN "dispatchAt" SET DEFAULT now()')
    await queryRunner.query('CREATE INDEX "IDX_fa4fdd8ef25bc3788d9f076461" ON "job" ("dispatchAt", "isDeleted", "isCompleted") ')
  }

}
