import {MigrationInterface, QueryRunner } from 'typeorm'

export class UnObjectBioIsFeatured1580057525996 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "action_x" ADD "emoji" character varying')
    await queryRunner.query('ALTER TABLE "un_object" ADD "bio" character varying')
    await queryRunner.query('CREATE TYPE "un_object_unobjecttype_enum" AS ENUM(\'UnObject\', \'Place\')')
    await queryRunner.query('ALTER TABLE "un_object" ADD "unObjectType" "un_object_unobjecttype_enum" NOT NULL DEFAULT \'UnObject\'')
    await queryRunner.query('ALTER TABLE "un_object" ADD "isFeatured" boolean NOT NULL DEFAULT false')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "isFeatured"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "unObjectType"')
    await queryRunner.query('DROP TYPE "un_object_unobjecttype_enum"')
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "bio"')
    await queryRunner.query('ALTER TABLE "action_x" DROP COLUMN "emoji"')
  }

}
