import {MigrationInterface, QueryRunner} from 'typeorm'

export class p2pToBedroom1597160733199 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "chat_room" SET "playerEids" = \'unobject/bedroom_357,\' || "playerEids" WHERE "playerEids" NOT LIKE \'%unobject/%\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "chat_room" SET "playerEids" = REPLACE("playerEids", \'unobject/bedroom_357,\', \'\') WHERE "playerEids" LIKE \'%unobject/bedroom_357%\'')
  }

}
