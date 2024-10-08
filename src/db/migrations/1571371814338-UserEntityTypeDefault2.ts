import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm'

export class UserEntityTypeDefault21571371814338 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TYPE "user_entitytype_enum" AS ENUM(\'Activity\', \'UnObject\', \'User\', \'NewsfeedItem\', \'Field\')')
    await queryRunner.query('CREATE TYPE "user_gender_enum" AS ENUM(\'MALE\', \'FEMALE\', \'NON_BINARY\')')
    await queryRunner.query('CREATE TABLE "user" ("id" character varying NOT NULL, "entityType" "user_entitytype_enum" NOT NULL DEFAULT \'User\', "username" character varying NOT NULL, "gender" "user_gender_enum" NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "isPasswordSet" boolean NOT NULL DEFAULT false, "authTokenVersion" integer NOT NULL DEFAULT 1, "confirmEmailToken" character varying, "confirmEmailTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "displayName" character varying NOT NULL, "email" character varying, "tempEmail" character varying, "phone" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "signedUpAt" TIMESTAMP WITH TIME ZONE, "password" character varying, "resetPasswordToken" character varying, "resetPasswordTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "isAnonymous" boolean NOT NULL DEFAULT false, "badge" integer NOT NULL DEFAULT 0, "entryId" character varying, "location" character varying, "twitter" character varying, "instagram" character varying, "recordVersion" integer NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE TYPE "user_role_role_enum" AS ENUM(\'MAKER\')')
    await queryRunner.query('CREATE TABLE "user_role" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "role" "user_role_role_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP TABLE "user_role"')
    await queryRunner.query('DROP TYPE "user_role_role_enum"')
    await queryRunner.query('DROP TABLE "user"')
    await queryRunner.query('DROP TYPE "user_gender_enum"')
    await queryRunner.query('DROP TYPE "user_entitytype_enum"')
  }

}
