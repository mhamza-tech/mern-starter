import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class DeleteTilesFieldsComments1590770227000 implements MigrationInterface {

  name = 'DeleteTilesFieldsComments1590770227000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from tile where name = \'tile.blood.bath.overlay.animation\'')
    await queryRunner.query('delete from tile where scope = \'ChatRoomScope\' and "thisEntityId" IN (\'beat.harvey\', \'beat.puffpuppy\', \'beat.creepyuncle\', \'beat.creepyuncleemoji\', \'safe\')')
    await queryRunner.query('delete from field where scope = \'ChatRoomScope\' and "thisEntityId" IN (\'beat.harvey\', \'beat.puffpuppy\', \'beat.creepyuncle\', \'beat.creepyuncleemoji\', \'safe\')')
    await queryRunner.query('delete from comment where type = \'ChatRoomComment\'')
    await queryRunner.query('truncate comment_receipt')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from tile where name = \'tile.blood.bath.overlay.animation\'')
  }

}
