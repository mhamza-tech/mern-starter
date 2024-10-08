import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectDescription1597958014034 implements MigrationInterface {

  name = 'UnObjectDescription1597958014034'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" RENAME COLUMN "text" TO "description"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" RENAME COLUMN "description" TO "text"')
  }

}
