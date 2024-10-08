import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectDefaults1589572637824 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showBackpack" SET DEFAULT true')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showControlBar" SET DEFAULT false')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showGiveDropZone" SET DEFAULT true')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showBackpack" SET DEFAULT false')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showControlBar" SET DEFAULT true')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "showGiveDropZone" SET DEFAULT false')
  }

}
