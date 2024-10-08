import {MigrationInterface, QueryRunner} from 'typeorm'

export class ActionXInstanceCreator1592772447582 implements MigrationInterface {

  name = 'ActionXInstanceCreator1592772447582'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "action_x_instance" ADD "creatorEid" character varying NOT NULL DEFAULT \'\'')
    await queryRunner.query('UPDATE "action_x_instance" SET "creatorEid" = "playerEid" WHERE "creatorEid" = \'\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "action_x_instance" DROP COLUMN "creatorEid"')
  }

}
