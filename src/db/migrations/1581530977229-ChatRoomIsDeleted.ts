import {MigrationInterface, QueryRunner } from 'typeorm'

export class ChatRoomIsDeleted1581530977229 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "chat_room" ADD "isDeleted" boolean NOT NULL DEFAULT false')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "chat_room" DROP COLUMN "isDeleted"')
  }

}
