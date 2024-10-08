import {MigrationInterface, QueryRunner} from 'typeorm'

export class SocialSharing1590512645543 implements MigrationInterface {

  name = 'SocialSharing1590512645543'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "socialTitle" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "socialDescription" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "socialImageS3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "socialImageS3Key"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "socialDescription"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "socialTitle"')
  }

}
