/**
 * @rob4lderman
 * oct2019
 *  
 * Comment is the base class for chat messages and comments on posts.
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
  AfterLoad,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  EntityType,
  NodeType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['collectionId', 'isDeleted', 'createdAt'])
export class Comment extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Comment'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Comment })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: NodeType, nullable: false })
  type: NodeType;

  // the collectionId identifies which post / chat / etc the comment belongs to
  @Column({nullable: false })
  collectionId: string;

  // author could be a user or an unobject
  @Column({nullable: false })
  authorEid: string;

  @Column({nullable: false, default: '' })
  authorUserId: string;

  @Column({nullable: true })
  text: string;

  @Column({ nullable: true })
  entryId: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({nullable: true })
  replyToCommentId: string;

  @Column({nullable: true })
  optimisticId: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ nullable: true })
  trackingId: string;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  // Incremented whenever 'save' is called (record is updated). Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

  // These fields don't have a db column
  eid: string;

  @AfterLoad()
  setFields(): void {
    this.eid = `comment/${this.id}`
  }

}
