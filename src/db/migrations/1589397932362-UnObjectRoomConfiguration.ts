import {MigrationInterface, QueryRunner} from 'typeorm'

export class UnObjectRoomConfiguration1589397932362 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "hashtribute" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "actionSheetBackgroundColor" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showBackpack" boolean NOT NULL DEFAULT false')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showControlBar" boolean NOT NULL DEFAULT true')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showResetButton" boolean NOT NULL DEFAULT false')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showAvatarDropZone" boolean NOT NULL DEFAULT true')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showGiveDropZone" boolean NOT NULL DEFAULT false')
    await queryRunner.query('ALTER TABLE "un_object" ADD "minOccupancy" integer NOT NULL DEFAULT 1')
    await queryRunner.query('ALTER TABLE "un_object" ADD "maxOccupancy" integer DEFAULT 1')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "hashtribute"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "actionSheetBackgroundColor"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "showBackpack"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "showControlBar"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "showResetButton"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "showAvatarDropZone"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "showGiveDropZone"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "minOccupancy"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN IF EXISTS "maxOccupancy"')
  }

}
