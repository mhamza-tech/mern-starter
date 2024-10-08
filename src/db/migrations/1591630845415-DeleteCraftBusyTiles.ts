import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class DeleteCraftBusyTile1591630845415 implements MigrationInterface {

  name = 'DeleteCraftBusyTile1591630845415'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from tile where name = \'tile.craft.recipe\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from tile where name = \'tile.craft.recipe\'')
  }

}
