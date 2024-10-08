import {MigrationInterface, QueryRunner} from 'typeorm'

export class NewsfeedNotificationIndexes1599710883029 implements MigrationInterface {

  name = 'NewsfeedNotificationIndexes1599710883029'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_85eaf7716abde05335e4e9677a"')
    await queryRunner.query('DROP INDEX "IDX_039c7fcba309434f48b3ffaa58"')
    await queryRunner.query('CREATE INDEX "IDX_c2b3af136aecc314dc2e9314d7" ON "newsfeed_item" ("userId", "isLive", "stateId") ')
    await queryRunner.query('CREATE INDEX "IDX_b41d7b507ce123bbd7cc029a25" ON "notification" ("userId", "createdAt", "isDeleted", "type") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_b41d7b507ce123bbd7cc029a25"')
    await queryRunner.query('DROP INDEX "IDX_c2b3af136aecc314dc2e9314d7"')
    await queryRunner.query('CREATE INDEX "IDX_039c7fcba309434f48b3ffaa58" ON "notification" ("userId", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_85eaf7716abde05335e4e9677a" ON "newsfeed_item" ("userId", "stateId") ')
  }

}
