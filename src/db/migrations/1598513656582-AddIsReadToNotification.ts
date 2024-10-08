import {MigrationInterface, QueryRunner} from 'typeorm'

export class AddIsReadToNotification1598513656582 implements MigrationInterface {

  name = 'AddIsReadToNotification1598513656582'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "notification" ADD "isRead" boolean NOT NULL DEFAULT false')
    await queryRunner.query('update "notification" set "isRead" = true')
    await queryRunner.query('CREATE INDEX "IDX_ea34abc69625e58f67007481e1" ON "notification" ("userId", "isRead") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_ea34abc69625e58f67007481e1"')
    await queryRunner.query('ALTER TABLE "notification" DROP COLUMN "isRead"')
  }

}
