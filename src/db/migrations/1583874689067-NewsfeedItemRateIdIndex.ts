import {MigrationInterface, QueryRunner } from 'typeorm'

export class NewsfeedItemRateIdIndex1583874689067 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE INDEX "IDX_a02afbf7ec2834e0c5b67c9629" ON "newsfeed_item" ("rateId", "createdAt") ')
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX "IDX_a02afbf7ec2834e0c5b67c9629"')
  }

}
