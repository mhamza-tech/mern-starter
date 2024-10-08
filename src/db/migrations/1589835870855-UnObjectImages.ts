import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectImages1589835870855 implements MigrationInterface {

  name = 'UnObjectImages1589835870855'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "backgroundS3Key" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "coverS3Key" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "coverS3Key"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "backgroundS3Key"')
  }

}
