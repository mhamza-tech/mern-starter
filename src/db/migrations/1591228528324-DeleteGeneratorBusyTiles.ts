import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class DeleteGeneratorBusyTiles1591228528324 implements MigrationInterface {

  name = 'DeleteGeneratorBusyTiles1591228528324'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from tile where name = \'tile.generator.busy\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from tile where name = \'tile.generator.busy\'')
  }

}
