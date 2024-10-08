import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class UserEntryId1572287532650 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."user_gender_enum" RENAME TO "user_gender_enum_old"')
    await queryRunner.query('CREATE TYPE "user_gender_enum" AS ENUM(\'MALE\', \'FEMALE\', \'NON_BINARY\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "gender" TYPE "user_gender_enum" USING "gender"::"text"::"user_gender_enum"')
    await queryRunner.query('DROP TYPE "user_gender_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "user_gender_enum_old" AS ENUM(\'MALE\', \'FEMALE\')')
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "gender" TYPE "user_gender_enum_old" USING "gender"::"text"::"user_gender_enum_old"')
    await queryRunner.query('DROP TYPE "user_gender_enum"')
    await queryRunner.query('ALTER TYPE "user_gender_enum_old" RENAME TO  "user_gender_enum"')
  }

}
