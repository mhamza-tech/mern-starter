import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class FriendRequestIndexes1587039723293 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_c37a840d884e25b62435b772d5"')
    await queryRunner.query('DROP INDEX "IDX_e8ee27a4e8d5051411c90db9c2"')
    await queryRunner.query('CREATE INDEX "IDX_76160414095ac6df250c140eea" ON "friend_request" ("senderId", "receiverId", "status") ')
    await queryRunner.query('CREATE INDEX "IDX_d0b46efe3764bf6dcb1776c912" ON "friend_request" ("receiverId", "status", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_e2fb9948e98ba7de96db3090d6" ON "friend_request" ("senderId", "status", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_e2fb9948e98ba7de96db3090d6"')
    await queryRunner.query('DROP INDEX "IDX_d0b46efe3764bf6dcb1776c912"')
    await queryRunner.query('DROP INDEX "IDX_76160414095ac6df250c140eea"')
    await queryRunner.query('CREATE INDEX "IDX_e8ee27a4e8d5051411c90db9c2" ON "friend_request" ("senderId", "status") ')
    await queryRunner.query('CREATE INDEX "IDX_c37a840d884e25b62435b772d5" ON "friend_request" ("receiverId", "status") ')
  }

}
