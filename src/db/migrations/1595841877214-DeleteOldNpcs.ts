import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class DeleteOldNpcs1595841877214 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update un_object set "isDeleted" = true where id in (
        select id from un_object where "name" like '%(X)%' and "isDeleted" = false
      );
    `)
    await queryRunner.query(`
      update edge set "isDeleted" = true where "thatEntityId" in (
        select id from un_object where "name" like '%(X)%'
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update un_object set "isDeleted" = false where id in (
        select id from un_object where "name" like '%(X)%' and "isDeleted" = true
      );
    `)

    await queryRunner.query(`
      update edge set "isDeleted" = false where "thatEntityId" in (
        select id from un_object where "name" like '%(X)%'
      );
    `)
  }

}
