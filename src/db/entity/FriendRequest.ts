import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Column,
  Index,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  FriendRequestStatus,
  EntityType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['senderId', 'status', 'createdAt'])
@Index(['receiverId', 'status', 'createdAt'])
@Index(['senderId', 'receiverId', 'status', 'isDeleted'])
export class FriendRequest extends BaseEntity {

  @PrimaryColumn()
  id: string

  // always 'Effect'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.FriendRequest })
  entityType: EntityType

  @Column({ nullable: false })
  senderId: string

  @Column({ nullable: false })
  receiverId: string

  @Column({ type: 'enum', enum: FriendRequestStatus, nullable: false })
  status: FriendRequestStatus

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
