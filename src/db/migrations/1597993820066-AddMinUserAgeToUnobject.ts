import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMinUserAgeToUnobject1597993820066 implements MigrationInterface {
  
  name = 'AddMinUserAgeToUnobject1597993820066'
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "minUserAge" integer')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "minUserAge"')
  }

}
