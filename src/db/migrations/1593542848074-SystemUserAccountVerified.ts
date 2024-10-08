import {MigrationInterface, QueryRunner} from 'typeorm'

export class SystemUserAccountVerified1593542848074 implements MigrationInterface {

  name = 'SystemUserAccountVerified1593542848074'

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('UPDATE "user" SET "isVerifiedAccount" = TRUE WHERE id = \'unreal-system-user\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('UPDATE "user" SET "isVerifiedAccount" = FALSE WHERE id = \'unreal-system-user\'')
  }

}
