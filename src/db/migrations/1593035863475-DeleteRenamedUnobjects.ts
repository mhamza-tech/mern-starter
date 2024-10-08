import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteRenamedUnobjects1593035863475 implements MigrationInterface {

  name = 'DeleteRenamedUnobjects1593035863475'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "un_object" SET "isFeatured" = false, "name" = \'(X)\' || "name" WHERE "id" IN (\'beat.harvey\',\'beat.creepyuncle\',\'generator.tea_plant\',\'beat.french_bulldog\',\'generator.wheat_fairy\',\'generator.coconut_republic_general\',\'generator.tahitian_sea_clam\',\'generator.tiger_mama\',\'generator.burner_phone_store\',\'beat.golden_retriever\',\'beat.black_labrador\',\'craft.mill\',\'generator.coachella_valley\',\'generator.processed_meat_factory\',\'generator.avocado_tree\',\'generator.coral_reef\',\'craft.hot_barista\',\'craft.bakery\',\'craft.kitchen\',\'craft.boomer_home\',\'craft.beautician\')')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "un_object" SET "isFeatured" = true, "name" = REPLACE("name",\'(X)\',\'\') WHERE "id" IN (\'beat.harvey\',\'beat.creepyuncle\',\'generator.tea_plant\',\'beat.french_bulldog\',\'generator.wheat_fairy\',\'generator.coconut_republic_general\',\'generator.tahitian_sea_clam\',\'generator.tiger_mama\',\'generator.burner_phone_store\',\'beat.golden_retriever\',\'beat.black_labrador\',\'craft.mill\',\'generator.coachella_valley\',\'generator.processed_meat_factory\',\'generator.avocado_tree\',\'generator.coral_reef\',\'craft.hot_barista\',\'craft.bakery\',\'craft.kitchen\',\'craft.boomer_home\',\'craft.beautician\')')
  }

}
