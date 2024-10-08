import {MigrationInterface, QueryRunner } from 'typeorm'

export class UnObjectCreatedByUserIdIndex1573680770436 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TYPE "public"."un_object_entitytype_enum" RENAME TO "un_object_entitytype_enum_old"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\', \'Comment\', \'DeviceInfo\', \'ChatRoom\', \'Notification\', \'CommentReceipt\', \'Receipt\', \'Effect\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum" USING "entityType"::"text"::"un_object_entitytype_enum"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum_old"')
    await queryRunner.query('CREATE INDEX "IDX_805e28d6adba46ac0a29f889ce" ON "un_object" ("createdByUserId", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_805e28d6adba46ac0a29f889ce"')
    await queryRunner.query('CREATE TYPE "un_object_entitytype_enum_old" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" TYPE "un_object_entitytype_enum_old" USING "entityType"::"text"::"un_object_entitytype_enum_old"')
    await queryRunner.query('ALTER TABLE "un_object" ALTER COLUMN "entityType" SET DEFAULT \'UnObject\'')
    await queryRunner.query('DROP TYPE "un_object_entitytype_enum"')
    await queryRunner.query('ALTER TYPE "un_object_entitytype_enum_old" RENAME TO  "un_object_entitytype_enum"')
  }

}
