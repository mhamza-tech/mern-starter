/**
 * @rob4lderman
 * oct2019
 * 
 */
import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  Index,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from 'src/env'
import {
  EntityType,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import {
  NewsfeedItemContext,
  NewsfeedItemMetadata,
} from 'src/types'

@Index(['rateId', 'createdAt'])
@Index(['userId', 'isLive', 'stateId'])
@Entity({ database: TYPEORM_DATABASE })
export class NewsfeedItem extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always NewsfeedItem
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.NewsfeedItem })
  entityType: EntityType

  // specifies the visual appearance of the card on FE
  @Column({ type: 'enum', enum: DynamicFeedItemLayout, nullable: false })
  layout: DynamicFeedItemLayout;

  // For rate-limiting newsfeed items.
  // The handler code specifies the rateId along with a rateLimit when generating NewsfeedItems.  
  // The runtime looks up the previous NewsfeedItem with the same rateId and checks its createdAt
  // timestamp against the rateLimit and either creates the NewsfeedItem or doesn't based on the specified rateLimit.
  @Column({ nullable: true })
  rateId: string;

  @Column({ type: 'json', nullable: false })
  metadata: NewsfeedItemMetadata;

  @Column({ nullable: true })
  trackingId: string;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;
 
  @Column({ nullable: true })
  optimisticId: string;

  @Column({ nullable: false })
  fromEid: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'json', nullable: false })
  context: NewsfeedItemContext

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: false, default: false })
  isPublic: boolean

  @Column({ nullable: true })
  stateId?: string

  @Column({ nullable: true })
  isLive?: boolean

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
