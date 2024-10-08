import {MigrationInterface, QueryRunner} from 'typeorm'

export class DeleteNewsfeedUserEdgeTable1595082776044 implements MigrationInterface {

  name = 'DeleteNewsfeedUserEdgeTable1595082776044'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "newsfeed_item"')
    await queryRunner.query('DROP TABLE "user_newsfeed_item_edge"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "user_newsfeed_item_edge_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\')')
    await queryRunner.query('CREATE TABLE "user_newsfeed_item_edge" ("id" character varying NOT NULL, "entityType" "user_newsfeed_item_edge_entitytype_enum" NOT NULL DEFAULT \'UserNewsfeedItemEdge\', "userId" character varying NOT NULL, "newsfeedItemId" character varying NOT NULL, "metadata" json, "isDeleted" boolean NOT NULL DEFAULT false, "trackingId" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_09c0594581f3077d1349f75ecae" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_8ce9fa6de3ccb2f2e1c7faf3b0" ON "user_newsfeed_item_edge" ("userId", "newsfeedItemId") ')
    await queryRunner.query('CREATE INDEX "IDX_ca683d2297753686447c3a1c51" ON "user_newsfeed_item_edge" ("isDeleted", "userId", "createdAt") ')
  }

}
