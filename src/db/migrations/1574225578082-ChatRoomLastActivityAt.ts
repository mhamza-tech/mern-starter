import {MigrationInterface, QueryRunner } from 'typeorm'

export class ChatRoomLastActivityAt1574225578082 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "chat_room" ADD "lastActivityAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT \'"2019-11-01T06:00:00.000Z"\'')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "chat_room" DROP COLUMN "lastActivityAt"')
  }

}
