/**
 * @rob4lderman
 * nov2019
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
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from 'src/env'
import {
  EntityType,
  NotificationType,
} from 'src/gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['userId', 'isDeleted', 'type'])
@Index(['userId', 'isDeleted', 'isRead', 'type'])
export class Notification extends BaseEntity {

  @PrimaryColumn()
  id: string

  // always 'Notification'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Notification })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  type: NotificationType

  // all notifications are targeted at a USER
  @Column({ nullable: false })
  userId: string

  @Column({ nullable: false, default: false })
  isRead: boolean

  // some notifications are targeted at an UNOBJECT, which just passes thru to the userId,
  // but it's sometimes useful to know that you're actually alerting the UNOBJECT that the user made
  @Column({ nullable: true })
  playerEid: string

  // all notifications belong to a collection.
  // useful for condensing later
  // e.g. collectionId='chatroom/{chatRoomId}/notification'
  @Column({ nullable: false })
  collectionId: string

  // notifications have a concept of an "event" that caused them.  their raison d'etre.
  // e.g. a comment, a reaction (edge)
  @Column({ nullable: true })
  eventEid: string

  @Column({ type: 'json', nullable: true })
  metadata: any

  @Column({ nullable: true })
  trackingId: string

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

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
