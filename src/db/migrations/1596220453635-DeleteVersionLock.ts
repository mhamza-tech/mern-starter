import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteVersionLock1596220453635 implements MigrationInterface {

  name = 'DeleteVersionLock1596220453635'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "versionLock"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "versionLock"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "versionLock"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "versionLock" integer')
    await queryRunner.query('ALTER TABLE "action_x" ADD "versionLock" integer')
    await queryRunner.query('ALTER TABLE "user" ADD "versionLock" integer')
  }

}
