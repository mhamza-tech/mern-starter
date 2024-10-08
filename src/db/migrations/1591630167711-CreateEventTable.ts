import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class CreateEvent1591630167711 implements MigrationInterface {

  name = 'CreateEvent1591630167711'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const type = await queryRunner.query('SELECT 1 as exists FROM pg_type WHERE typname = \'event_eventtype_enum\'', undefined)
    if (!type.length) {
      await queryRunner.query('CREATE TYPE "event_eventtype_enum" AS ENUM(\'CreateEdge\', \'DeleteEdge\', \'CreateActivity\', \'ActionWithContextCreated\', \'ActionWithContextCreatedActivityCreated\')')
    }
    await queryRunner.query('CREATE TABLE IF NOT EXISTS "event" ("id" character varying NOT NULL, "eventType" "event_eventtype_enum", "type" character varying DEFAULT \'\', "source" character varying DEFAULT \'\', "sessionUserId" character varying, "trackingId" character varying, "actionWithContextId" character varying, "unObjectId" character varying, "actionId" character varying, "storyboardId" character varying, "playerContextId" character varying, "edgeId" character varying, "activityId" character varying, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "event"')
    await queryRunner.query('DROP TYPE "event_eventtype_enum"')
  }

}
