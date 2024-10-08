import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class RoleAndVisibilityAdded1594283596202 implements MigrationInterface {

  name = 'RoleAndVisibilityAdded1594283596202'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "user_role_enum" AS ENUM(\'Admin\', \'Maker\', \'Tester\', \'User\')')
    await queryRunner.query('ALTER TABLE "user" ADD "role" "user_role_enum" NOT NULL DEFAULT \'User\'')
    await queryRunner.query('CREATE TYPE "un_object_visibleforrole_enum" AS ENUM(\'Admin\', \'Maker\', \'Tester\', \'User\')')
    await queryRunner.query('ALTER TABLE "un_object" ADD "visibleForRole" "un_object_visibleforrole_enum" NOT NULL DEFAULT \'User\'')
    await queryRunner.query('DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"')
    await queryRunner.query('ALTER TYPE "public"."user_role_role_enum" RENAME TO "user_role_role_enum_old"')
    await queryRunner.query('CREATE TYPE "user_role_role_enum" AS ENUM(\'Admin\', \'Maker\', \'Tester\', \'User\')')
    await queryRunner.query('ALTER TABLE "user_role" ALTER COLUMN "role" TYPE "user_role_role_enum" USING "role"::"text"::"user_role_role_enum"')
    await queryRunner.query('DROP TYPE "user_role_role_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role" ("userId", "role")')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"')
    await queryRunner.query('CREATE TYPE "user_role_role_enum_old" AS ENUM(\'MAKER\')')
    await queryRunner.query('ALTER TABLE "user_role" ALTER COLUMN "role" TYPE "user_role_role_enum_old" USING "role"::"text"::"user_role_role_enum_old"')
    await queryRunner.query('DROP TYPE "user_role_role_enum"')
    await queryRunner.query('ALTER TYPE "user_role_role_enum_old" RENAME TO  "user_role_role_enum"')
    await queryRunner.query('CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role" ("userId", "role")')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "visibleForRole"')
    await queryRunner.query('DROP TYPE "un_object_visibleforrole_enum"')
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "role"')
    await queryRunner.query('DROP TYPE "user_role_enum"')
  }

}
