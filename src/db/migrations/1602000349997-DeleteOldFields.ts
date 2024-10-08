import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteOldFields1602000349997 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE field SET "isDeleted" = TRUE WHERE NOT "isDeleted" AND "type" = \'HashStatusField\' AND (metadata->>\'numberValue\' = \'0\' OR metadata->>\'changedAt\' IS NULL)')
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE field SET "isDeleted" = FALSE WHERE "isDeleted" AND "type" = \'HashStatusField\' AND (metadata->>\'numberValue\' = \'0\' OR metadata->>\'changedAt\' IS NULL)')
  }

}
