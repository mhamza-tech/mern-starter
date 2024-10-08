import {MigrationInterface, QueryRunner} from 'typeorm'

export class UpdateUnObjectNullables1591978176117 implements MigrationInterface {

  name = 'UpdateUnObjectNullables1591978176117'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "un_object" SET "bio" = \'?\' WHERE "bio" IS NULL')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "bio" SET NOT NULL')
    await queryRunner.query('UPDATE "un_object" SET "socialTitle" = COALESCE("socialTitle", "name")')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "socialTitle" SET NOT NULL')
    await queryRunner.query('UPDATE "un_object" SET "socialDescription" = COALESCE("socialDescription", "bio")')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "socialDescription" SET NOT NULL')
    await queryRunner.query('UPDATE "un_object" SET "socialImageS3Key" = COALESCE("socialImageS3Key", "coverS3Key")')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "socialDescription" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "socialTitle" DROP NOT NULL')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "bio" DROP NOT NULL')
  }

}
