import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItem1571028750851 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."edge_thisentitytype_enum" RENAME TO "edge_thisentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum" USING "thisEntityType"::"text"::"edge_thisentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum_old"')
    await queryRunner.query('ALTER TYPE "public"."edge_thatentitytype_enum" RENAME TO "edge_thatentitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum" USING "thatEntityType"::"text"::"edge_thatentitytype_enum"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum_old"')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "edge_thatentitytype_enum_old" AS ENUM(\'Activity\', \'User\', \'UnObject\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thatEntityType" TYPE "edge_thatentitytype_enum_old" USING "thatEntityType"::"text"::"edge_thatentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thatentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thatentitytype_enum_old" RENAME TO  "edge_thatentitytype_enum"')
    await queryRunner.query('CREATE TYPE "edge_thisentitytype_enum_old" AS ENUM(\'Activity\', \'User\', \'UnObject\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "thisEntityType" TYPE "edge_thisentitytype_enum_old" USING "thisEntityType"::"text"::"edge_thisentitytype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_thisentitytype_enum"')
    await queryRunner.query('ALTER TYPE "edge_thisentitytype_enum_old" RENAME TO  "edge_thisentitytype_enum"')
  }

}
