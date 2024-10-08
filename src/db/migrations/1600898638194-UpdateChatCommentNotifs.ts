import {MigrationInterface, QueryRunner} from 'typeorm'

export class UpdateChatCommentNotifs1600898638194 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `update notification set "isRead" = true 
    where "type" = 'ChatRoomCommentNotification' and 
    "eventEid" in (
        select concat('comment/', "commentId") from comment_receipt
        where "isRead" = true
    )
   `
    await queryRunner.query(query)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `update notification n set "isRead" = false 
    where "type" = 'ChatRoomCommentNotification' and 
    "eventEid" in (
        select concat('comment/', "commentId") from comment_receipt cr
        where "isRead" = true
    )
   `
    await queryRunner.query(query)
  }

}
