import {MigrationInterface, QueryRunner } from 'typeorm'

export class EmailRegistry1576870612765 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TABLE "email_registry" ("id" character varying NOT NULL, "email" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6540af955da99fd53fde5f5566a" UNIQUE ("email"), CONSTRAINT "PK_3cf4bce5f7962aeab607e6a86a4" PRIMARY KEY ("id"))')
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_6540af955da99fd53fde5f5566" ON "email_registry" ("email") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_6540af955da99fd53fde5f5566"')
    await queryRunner.query('DROP TABLE "email_registry"')
  }

}
