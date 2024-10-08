import {MigrationInterface, QueryRunner} from 'typeorm'

export class RemoveUnObjectDropZones1591735389873 implements MigrationInterface {

  name = 'RemoveUnObjectDropZones1591735389873'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "showAvatarDropZone"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "showGiveDropZone"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "showGiveDropZone" boolean NOT NULL DEFAULT true')
    await queryRunner.query('ALTER TABLE "un_object" ADD "showAvatarDropZone" boolean NOT NULL DEFAULT true')
  }

}
