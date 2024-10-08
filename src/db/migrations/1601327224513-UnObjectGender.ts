import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectGender1601327224513 implements MigrationInterface {

  name = 'UnObjectGender1601327224513'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "un_object_gender_enum" AS ENUM(\'MALE\', \'FEMALE\', \'NON_BINARY\')')
    await queryRunner.query('ALTER TABLE "un_object" ADD "gender" "un_object_gender_enum" NOT NULL DEFAULT \'NON_BINARY\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "gender"')
    await queryRunner.query('DROP TYPE "un_object_gender_enum"')
  }

}
