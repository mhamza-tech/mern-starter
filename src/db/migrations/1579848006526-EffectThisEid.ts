import {MigrationInterface, QueryRunner } from 'typeorm'

export class EffectThisEid1579848006526 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "effect" ADD "thisEntityId" character varying')
    await queryRunner.query('CREATE TYPE "effect_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\')')
    await queryRunner.query('ALTER TABLE "effect" ADD "thisEntityType" "effect_thisentitytype_enum"')
    await queryRunner.query('ALTER TABLE "effect" ADD "thisEid" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "effect" DROP COLUMN "thisEid"')
    await queryRunner.query('ALTER TABLE "effect" DROP COLUMN "thisEntityType"')
    await queryRunner.query('DROP TYPE "effect_thisentitytype_enum"')
    await queryRunner.query('ALTER TABLE "effect" DROP COLUMN "thisEntityId"')
  }

}
