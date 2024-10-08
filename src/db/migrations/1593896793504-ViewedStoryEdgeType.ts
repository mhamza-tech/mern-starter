import {MigrationInterface, QueryRunner} from 'typeorm'

export class ViewedStoryEdgeType1593896793504 implements MigrationInterface {

  name = 'ViewedStoryEdgeType1593896793504'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_05675ffabd0e7411d60f1c8a3f"')
    await queryRunner.query('DROP INDEX "IDX_d5782febf4eaea1eddd7f26c19"')
    await queryRunner.query('DROP INDEX "IDX_ef01278590ed1b7c4122884f3a"')
    await queryRunner.query('DROP INDEX "IDX_6c9641aa3e5d202059389c4b85"')
    await queryRunner.query('DROP INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3"')
    await queryRunner.query('DROP INDEX "IDX_0030a10250e4dac762a479cd85"')
    await queryRunner.query('DROP INDEX "IDX_b8bb99811b5d1fb7e3307f18b6"')
    await queryRunner.query('ALTER TYPE "public"."edge_edgetype_enum" RENAME TO "edge_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum" AS ENUM(\'Likes\', \'FriendRequest\', \'Friend\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ActionX\', \'Tile\', \'Interest\', \'Player\', \'NewsfeedItem\', \'Block\', \'ReactionEdge\', \'FriendStory\', \'ViewedStory\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum" USING "edgeType"::"text"::"edge_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum_old"')
    await queryRunner.query('DROP INDEX "IDX_d497bdb63fa876ee87527963df"')
    await queryRunner.query('ALTER TYPE "public"."edge_stats_edgetype_enum" RENAME TO "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum" AS ENUM(\'Likes\', \'FriendRequest\', \'Friend\', \'Follows\', \'Actor\', \'UnObject\', \'NamedEdge\', \'ChatRoom\', \'ActionX\', \'Tile\', \'Interest\', \'Player\', \'NewsfeedItem\', \'Block\', \'ReactionEdge\', \'FriendStory\', \'ViewedStory\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum" USING "edgeType"::"text"::"edge_stats_edgetype_enum"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_b8bb99811b5d1fb7e3307f18b6" ON "edge" ("collectionId", "edgeType", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_0030a10250e4dac762a479cd85" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE INDEX "IDX_6c9641aa3e5d202059389c4b85" ON "edge" ("thatEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_ef01278590ed1b7c4122884f3a" ON "edge" ("thisEntityId", "edgeType", "isDeleted", "createdAt") ')
    await queryRunner.query('CREATE INDEX "IDX_d5782febf4eaea1eddd7f26c19" ON "edge" ("thisEntityId", "collectionId", "edgeType", "isDeleted", "order") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_05675ffabd0e7411d60f1c8a3f" ON "edge" ("thisEntityId", "thatEntityId", "edgeType", "collectionId") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d497bdb63fa876ee87527963df" ON "edge_stats" ("entityId", "edgeDirection", "edgeType") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_d497bdb63fa876ee87527963df"')
    await queryRunner.query('DROP INDEX "IDX_05675ffabd0e7411d60f1c8a3f"')
    await queryRunner.query('DROP INDEX "IDX_d5782febf4eaea1eddd7f26c19"')
    await queryRunner.query('DROP INDEX "IDX_ef01278590ed1b7c4122884f3a"')
    await queryRunner.query('DROP INDEX "IDX_6c9641aa3e5d202059389c4b85"')
    await queryRunner.query('DROP INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3"')
    await queryRunner.query('DROP INDEX "IDX_0030a10250e4dac762a479cd85"')
    await queryRunner.query('DROP INDEX "IDX_b8bb99811b5d1fb7e3307f18b6"')
    await queryRunner.query('CREATE TYPE "edge_stats_edgetype_enum_old" AS ENUM(\'ActionX\', \'Actor\', \'Block\', \'ChatRoom\', \'Follows\', \'Friend\', \'FriendRequest\', \'FriendStory\', \'Interest\', \'Likes\', \'NamedEdge\', \'NewsfeedItem\', \'Player\', \'ReactionEdge\', \'Tile\', \'UnObject\')')
    await queryRunner.query('ALTER TABLE "edge_stats" ALTER COLUMN "edgeType" TYPE "edge_stats_edgetype_enum_old" USING "edgeType"::"text"::"edge_stats_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_stats_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_stats_edgetype_enum_old" RENAME TO  "edge_stats_edgetype_enum"')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d497bdb63fa876ee87527963df" ON "edge_stats" ("entityId", "edgeDirection", "edgeType") ')
    await queryRunner.query('CREATE TYPE "edge_edgetype_enum_old" AS ENUM(\'ActionX\', \'Actor\', \'Block\', \'ChatRoom\', \'Follows\', \'Friend\', \'FriendRequest\', \'FriendStory\', \'Interest\', \'Likes\', \'NamedEdge\', \'NewsfeedItem\', \'Player\', \'ReactionEdge\', \'Tile\', \'UnObject\')')
    await queryRunner.query('ALTER TABLE "edge" ALTER COLUMN "edgeType" TYPE "edge_edgetype_enum_old" USING "edgeType"::"text"::"edge_edgetype_enum_old"')
    await queryRunner.query('DROP TYPE "edge_edgetype_enum"')
    await queryRunner.query('ALTER TYPE "edge_edgetype_enum_old" RENAME TO  "edge_edgetype_enum"')
    await queryRunner.query('CREATE INDEX "IDX_b8bb99811b5d1fb7e3307f18b6" ON "edge" ("edgeType", "isDeleted", "collectionId") ')
    await queryRunner.query('CREATE INDEX "IDX_0030a10250e4dac762a479cd85" ON "edge" ("thisEntityId", "edgeType", "order", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_659ce3f3c6b7ae65a73ce07ee3" ON "edge" ("thatEntityId", "edgeType", "order", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_6c9641aa3e5d202059389c4b85" ON "edge" ("thatEntityId", "edgeType", "createdAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_ef01278590ed1b7c4122884f3a" ON "edge" ("thisEntityId", "edgeType", "createdAt", "isDeleted") ')
    await queryRunner.query('CREATE INDEX "IDX_d5782febf4eaea1eddd7f26c19" ON "edge" ("thisEntityId", "edgeType", "order", "isDeleted", "collectionId") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_05675ffabd0e7411d60f1c8a3f" ON "edge" ("thisEntityId", "thatEntityId", "edgeType", "collectionId") ')
  }

}
