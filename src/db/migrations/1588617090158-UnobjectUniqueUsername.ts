import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class UnobjectUniqueUsername1588617090158 implements MigrationInterface {

  name = 'UnobjectUniqueUsername1588617090158'

  private async backFillUsername(queryRunner: QueryRunner): Promise<void> {
    const unObjects = await queryRunner.query('SELECT id FROM un_object', undefined)
    const usernames = new Set()
    await Promise.all(unObjects.map(unObject => {
      let username = Math.random().toString(36).substring(2, 12)
      if (usernames.has(username)) {
        username = username + Math.random().toString(36).substring(2, 7)
      }
      usernames.add(username)
      return queryRunner.query(`UPDATE "un_object" SET "username" = '${username}' where id = '${unObject.id}'`, undefined)
    }))
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "un_object" ADD "username" character varying', undefined)
    await this.backFillUsername(queryRunner)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "username" SET NOT NULL', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ADD CONSTRAINT "UQ_a1295399e9befb96316f5d86419" UNIQUE ("username")', undefined)
    await queryRunner.query('ALTER TYPE "public"."action_x_entitytype_enum" RENAME TO "action_x_entitytype_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "action_x_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" TYPE "action_x_entitytype_enum" USING "entityType"::"text"::"action_x_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" SET DEFAULT \'ActionX\'', undefined)
    await queryRunner.query('DROP TYPE "action_x_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TYPE "public"."action_x_instance_entitytype_enum" RENAME TO "action_x_instance_entitytype_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "action_x_instance_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" TYPE "action_x_instance_entitytype_enum" USING "entityType"::"text"::"action_x_instance_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" SET DEFAULT \'ActionXInstance\'', undefined)
    await queryRunner.query('DROP TYPE "action_x_instance_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TYPE "public"."un_object_entitytype_enum" RENAME TO "un_object_entitytype_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum" USING "entityType"::"text"::"un_object_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'', undefined)
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum_old"', undefined)
    await queryRunner.query('UPDATE "un_object" SET "name"=(SELECT substr(md5(random()::text), 0, 10)) where name is null or name = \'\'', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "name" SET NOT NULL', undefined)
    await queryRunner.query('ALTER TYPE "public"."completed_action_entitytype_enum" RENAME TO "completed_action_entitytype_enum_old"', undefined)
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Edge\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\', \'CompletedAction\', \'ActionX\', \'ActionXInstance\', \'Tile\', \'QEdge\', \'SDist\', \'Report\', \'Location\', \'Job\', \'UserNewsfeedItemEdge\', \'FriendRequest\')', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum" USING "entityType"::"text"::"completed_action_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'', undefined)
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum_old"', undefined)
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_a1295399e9befb96316f5d8641" ON "un_object" ("username") ', undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_a1295399e9befb96316f5d8641"', undefined)
    await queryRunner.query('CREATE TYPE "completed_action_entitytype_enum_old" AS ENUM(\'ActionX\', \'ActionXInstance\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Job\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\', \'UserNewsfeedItemEdge\')', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" TYPE "completed_action_entitytype_enum_old" USING "entityType"::"text"::"completed_action_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TABLE "completed_action" ALTER COLUMN "entityType" SET DEFAULT \'CompletedAction\'', undefined)
    await queryRunner.query('DROP TYPE "completed_action_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TYPE "completed_action_entitytype_enum_old" RENAME TO  "completed_action_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "name" DROP NOT NULL', undefined)
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum_old" AS ENUM(\'ActionX\', \'ActionXInstance\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Job\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\', \'UserNewsfeedItemEdge\')', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum_old" USING "entityType"::"text"::"un_object_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'', undefined)
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TYPE "un_object_entitytype_enum_old" RENAME TO  "un_object_entitytype_enum"', undefined)
    await queryRunner.query('CREATE TYPE "action_x_instance_entitytype_enum_old" AS ENUM(\'ActionX\', \'ActionXInstance\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Job\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\', \'UserNewsfeedItemEdge\')', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" TYPE "action_x_instance_entitytype_enum_old" USING "entityType"::"text"::"action_x_instance_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TABLE "action_x_instance" ALTER COLUMN "entityType" SET DEFAULT \'ActionXInstance\'', undefined)
    await queryRunner.query('DROP TYPE "action_x_instance_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TYPE "action_x_instance_entitytype_enum_old" RENAME TO  "action_x_instance_entitytype_enum"', undefined)
    await queryRunner.query('CREATE TYPE "action_x_entitytype_enum_old" AS ENUM(\'ActionX\', \'ActionXInstance\', \'Activity\', \'ChatRoom\', \'Comment\', \'CommentReceipt\', \'CompletedAction\', \'DeviceInfo\', \'Edge\', \'Effect\', \'Field\', \'Job\', \'Location\', \'NewsfeedItem\', \'Notification\', \'QEdge\', \'Receipt\', \'Report\', \'SDist\', \'Tile\', \'UnObject\', \'User\', \'UserNewsfeedItemEdge\')', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" DROP DEFAULT', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" TYPE "action_x_entitytype_enum_old" USING "entityType"::"text"::"action_x_entitytype_enum_old"', undefined)
    await queryRunner.query('ALTER TABLE "action_x" ALTER COLUMN "entityType" SET DEFAULT \'ActionX\'', undefined)
    await queryRunner.query('DROP TYPE "action_x_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TYPE "action_x_entitytype_enum_old" RENAME TO  "action_x_entitytype_enum"', undefined)
    await queryRunner.query('ALTER TABLE "un_object" DROP CONSTRAINT "UQ_a1295399e9befb96316f5d86419"', undefined)
    await queryRunner.query('ALTER TABLE "un_object" DROP COLUMN "username"', undefined)
  }

}
