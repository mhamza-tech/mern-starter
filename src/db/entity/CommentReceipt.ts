/**
 * @rob4lderman
 * nov2019
 *  
 * ChatRoom Comment Receipts 
 */
import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeInsert,
  PrimaryColumn,
  Index,
  Unique,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  EntityType,
  ReceiptType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['collectionId', 'sessionUserId'])
@Index(['sessionUserId', 'collectionId', 'receiptType', 'isRead'])
@Index(['sessionUserId', 'receiptType', 'isRead'])
@Index(['commentId'])
@Unique(['commentId', 'sessionUserId', 'receiptType'])
export class CommentReceipt extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Comment'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.CommentReceipt })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: ReceiptType, nullable: false })
  receiptType: ReceiptType;

  // the collectionId identifies which post / chat / etc the comment belongs to
  @Column({nullable: false })
  collectionId: string;

  // the comment being receipt'ed
  @Column({nullable: false })
  commentId: string;

  // the user issuing the receipt
  @Column({nullable: false })
  sessionUserId: string;

  @Column({nullable: false, default: false })
  isRead: boolean;

  @Column({nullable: false, default: false })
  isReceived: boolean;

  @Column({nullable: false, default: false })
  isDismissed: boolean;

  // the player issuing the receipt (could be the user acting as an unobject)
  @Column({nullable: false, default: '' })
  playerEid: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  // Incremented whenever 'save' is called (record is updated). Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
