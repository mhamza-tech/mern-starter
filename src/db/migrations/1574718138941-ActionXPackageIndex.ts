import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXPackageIndex1574718138941 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_189ac9ec3efdd25d3069116c3b" ON "action_x" ("package") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_189ac9ec3efdd25d3069116c3b"')
  }

}
