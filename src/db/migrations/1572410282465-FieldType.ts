import {MigrationInterface, QueryRunner } from 'typeorm'

export class FieldType1572410282465 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    // await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "type"`);
    await queryRunner.query('CREATE TYPE "field_type_enum" AS ENUM(\'DateField\', \'BooleanField\', \'ChatRoomIsTyping\', \'ChatRoomLastViewedAt\', \'NewsfeedItemCard\')')
    // await queryRunner.query(`ALTER TABLE "field" ADD "type" "field_type_enum" NOT NULL`);
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE "field_type_enum" using type::field_type_enum ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "field" ALTER COLUMN "type" TYPE character varying NOT NULL ')
    // await queryRunner.query(`ALTER TABLE "field" DROP COLUMN "type"`);
    await queryRunner.query('DROP TYPE "field_type_enum"')
    // await queryRunner.query(`ALTER TABLE "field" ADD "type" character varying NOT NULL`);
  }

}
