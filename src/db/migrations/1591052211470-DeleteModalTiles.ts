import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class DeleteModalTiles1591052211470 implements MigrationInterface {

  name = 'DeleteModalTiles1591052211470'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from tile where name = \'modalTile\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from tile where name = \'modalTile\'')
  }

}
