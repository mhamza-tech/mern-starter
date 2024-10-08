import {MigrationInterface, QueryRunner } from 'typeorm'

export class UsernameAndEmailIndexes1571413541468 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e2"')
    await queryRunner.query('DROP INDEX "IDX_78a916df40e02a9deb1c4b75ed"')
  }

}
