import moment from 'moment'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class RepopulateDOB1598024576190 implements MigrationInterface {

  name = 'RepopulateDOB1598024576190'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const datetime = moment.utc(new Date('2000-01-01 00:00:00')).format('YYYY-MM-DD HH:mm:ss')
    await queryRunner.query(`UPDATE "user" SET birthday = '${datetime}' WHERE birthday is NULL`)
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "birthday" SET NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ALTER COLUMN "birthday" DROP NOT NULL')
    await queryRunner.query('UPDATE "user" SET birthday = NULL WHERE birthday = \'2000-01-01 00:00:00\'')
  }

}
