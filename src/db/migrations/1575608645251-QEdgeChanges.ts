import {MigrationInterface, QueryRunner } from 'typeorm'

export class QEdgeChanges1575608645251 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_5e2a42f871112e5b5c7d48fb75"')
    await queryRunner.query('DROP INDEX "IDX_5df96bdcf5ec8bb3475cf63772"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "isDeleted"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "qBeta"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "qBetaType"')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "buildPhase" character varying NOT NULL DEFAULT \'staging\'')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "i" integer')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "j" integer')
    await queryRunner.query('ALTER TYPE "public"."q_edge_type_enum" RENAME TO "q_edge_type_enum_old"')
    await queryRunner.query('CREATE TYPE "q_edge_type_enum" AS ENUM(\'StagingQEdge\', \'QEdge\', \'ActorToReactions\', \'PlayerToFollowing\', \'PlayerToFollowers\', \'PlayerToNewsfeedItems\', \'UserToUnObjects\', \'AuthorToComments\', \'ActorToCompletedActions\', \'NewsfeedItemToReactions\', \'NewsfeedItemToComments\', \'NewsfeedItemToPlayers\', \'ChatRoomToPlayers\', \'ChatRoomToUnObject\', \'ChatRoomToComments\', \'UnObjectToMaker\', \'CommentToAuthor\', \'CompletedActionToActor\', \'CommentToReactions\', \'CommentToCollection\', \'CompletedActionToCollection\')')
    await queryRunner.query('ALTER TABLE "q_edge" ALTER COLUMN "type" TYPE "q_edge_type_enum" USING "type"::"text"::"q_edge_type_enum"')
    await queryRunner.query('DROP TYPE "q_edge_type_enum_old"')
    await queryRunner.query('ALTER TABLE "q_edge" ALTER COLUMN "q" DROP NOT NULL')
    await queryRunner.query('CREATE INDEX "IDX_83ba58cde23ca2c3679d545c8c" ON "q_edge" ("thisEntityId") ')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_6fc822deec2daa026bed26e4dc" ON "q_edge" ("thisEntityId", "thatEntityId", "buildPhase") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_6fc822deec2daa026bed26e4dc"')
    await queryRunner.query('DROP INDEX "IDX_83ba58cde23ca2c3679d545c8c"')
    await queryRunner.query('ALTER TABLE "q_edge" ALTER COLUMN "q" SET NOT NULL')
    await queryRunner.query('CREATE TYPE "q_edge_type_enum_old" AS ENUM(\'QEdge\', \'StagingQEdge\')')
    await queryRunner.query('ALTER TABLE "q_edge" ALTER COLUMN "type" TYPE "q_edge_type_enum_old" USING "type"::"text"::"q_edge_type_enum_old"')
    await queryRunner.query('DROP TYPE "q_edge_type_enum"')
    await queryRunner.query('ALTER TYPE "q_edge_type_enum_old" RENAME TO  "q_edge_type_enum"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "j"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "i"')
    await queryRunner.query('ALTER TABLE "q_edge" DROP COLUMN "buildPhase"')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "qBetaType" character varying NOT NULL')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "qBeta" double precision NOT NULL DEFAULT 1')
    await queryRunner.query('ALTER TABLE "q_edge" ADD "isDeleted" boolean NOT NULL DEFAULT false')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_5df96bdcf5ec8bb3475cf63772" ON "q_edge" ("type", "thisEntityId", "thatEntityId") ')
    await queryRunner.query('CREATE INDEX "IDX_5e2a42f871112e5b5c7d48fb75" ON "q_edge" ("type", "thisEntityId", "isDeleted") ')
  }

}
