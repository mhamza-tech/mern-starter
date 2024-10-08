import {MigrationInterface, QueryRunner } from 'typeorm'

export class ActionXInstanceUpdatedAtIndex1585345596690 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_ff083f0badb633ffb3eb6e0031" ON "action_x_instance" ("playerEid", "actionName", "updatedAt", "isDeleted") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_ff083f0badb633ffb3eb6e0031"')
  }

}
