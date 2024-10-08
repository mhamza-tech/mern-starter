import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class UserBioAndUserRolesIndex1571413173002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "user" ADD "bio" text')
    await queryRunner.query('CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role" ("userId", "role") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"')
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "bio"')
  }

}
