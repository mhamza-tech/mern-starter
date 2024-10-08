import {MigrationInterface, QueryRunner } from 'typeorm'

export class TileThisEid1579818676696 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "tile" ADD "thisEntityId" character varying')
    await queryRunner.query('CREATE TYPE "tile_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\')')
    await queryRunner.query('ALTER TABLE "tile" ADD "thisEntityType" "tile_thisentitytype_enum"')
    await queryRunner.query('ALTER TABLE "tile" ADD "thisEid" character varying')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "thisEid"')
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "thisEntityType"')
    await queryRunner.query('DROP TYPE "tile_thisentitytype_enum"')
    await queryRunner.query('ALTER TABLE "tile" DROP COLUMN "thisEntityId"')
  }

}
