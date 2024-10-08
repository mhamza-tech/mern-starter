import {MigrationInterface, QueryRunner } from 'typeorm'

export class Comment1571421397924 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "comment_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\')')
    await queryRunner.query('CREATE TABLE "comment" ("id" character varying NOT NULL, "entityType" "comment_entitytype_enum" NOT NULL DEFAULT \'Comment\', "type" character varying NOT NULL, "collectionId" character varying NOT NULL, "authorDocumentId" character varying NOT NULL, "text" character varying, "entryId" character varying, "replyToCommentId" character varying, "metadata" json, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recordVersion" integer NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE INDEX "IDX_22701dd7f0ff24ef2b606e265d" ON "comment" ("collectionId", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_22701dd7f0ff24ef2b606e265d"')
    await queryRunner.query('DROP TABLE "comment"')
    await queryRunner.query('DROP TYPE "comment_entitytype_enum"')
  }

}
