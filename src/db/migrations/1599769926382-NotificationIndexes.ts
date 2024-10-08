import {MigrationInterface, QueryRunner} from 'typeorm'

export class NotificationIndexes1599769926382 implements MigrationInterface {

  name = 'NotificationIndexes1599769926382'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_ce7328343678af8b2637713d82"')
    await queryRunner.query('DROP INDEX "IDX_b41d7b507ce123bbd7cc029a25"')
    await queryRunner.query('DROP INDEX "IDX_ea34abc69625e58f67007481e1"')
    await queryRunner.query('CREATE INDEX "IDX_e72d9c150b12789525684f2416" ON "notification" ("userId", "isDeleted", "isRead", "type") ')
    await queryRunner.query('CREATE INDEX "IDX_cb583f621941d010746e0e7ece" ON "notification" ("userId", "isDeleted", "type") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_cb583f621941d010746e0e7ece"')
    await queryRunner.query('DROP INDEX "IDX_e72d9c150b12789525684f2416"')
    await queryRunner.query('CREATE INDEX "IDX_ea34abc69625e58f67007481e1" ON "notification" ("userId", "isRead") ')
    await queryRunner.query('CREATE INDEX "IDX_b41d7b507ce123bbd7cc029a25" ON "notification" ("type", "userId", "createdAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_ce7328343678af8b2637713d82" ON "notification" ("userId", "isDeleted") ')
  }

}
