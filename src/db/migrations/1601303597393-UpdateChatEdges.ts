import {MigrationInterface, QueryRunner} from 'typeorm'

export class UpdateChatEdges1601303597393 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `update "edge" set "isDeleted" = false
    where "thatEntityId" = 'bedroom_357' and
    "edgeType" = 'ChatRoom' and
    "isDeleted" = true
   `
    await queryRunner.query(query)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `update "edge" set "isDeleted" = true
    where "thatEntityId" = 'bedroom_357' and
    "edgeType" = 'ChatRoom' and
    "isDeleted" = false
   `
    await queryRunner.query(query)
  }

}
