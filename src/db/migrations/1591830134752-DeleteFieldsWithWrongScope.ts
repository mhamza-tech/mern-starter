import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteFieldsWithWrongScope1591830134752 implements MigrationInterface {

  name = 'DeleteFieldsWithWrongScope1591830134752'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('delete from field where "type" IN (\'HashStatusField\', \'HashtributeField\', \'ActionXStubsField\', \'StoryStatusField\') OR "name" IN (\'xp\', \'stars\')')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('select * from field where type IN (\'HashStatusField\', \'HashtributeField\', \'ActionXStubsField\', \'StoryStatusField\') OR "name" IN (\'xp\', \'stars\')')
  }

}
