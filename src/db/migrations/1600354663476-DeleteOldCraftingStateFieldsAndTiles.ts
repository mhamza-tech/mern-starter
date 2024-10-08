import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteOldCraftingStateFieldsAndTiles1600354663476 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from tile where "name" IN (\'tile.exchange.slot0\', \'tile.exchange.slot1\')')
    await queryRunner.query('delete from field where "name" IN (\'gamestate.build.a.bear\', \'gamestate.drug.dealer\')')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from tile where "name" IN (\'tile.exchange.slot0\', \'tile.exchange.slot1\')')
    await queryRunner.query('select * from field where "name" IN (\'gamestate.build.a.bear\', \'gamestate.drug.dealer\')')
  }

}
