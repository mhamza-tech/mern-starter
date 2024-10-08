/**
 * @rob4lderman
 * aug2019
 *  
 * The event log.
 * An Event is just something that happened.
 * E.g. a user "liked" an activity
 * E.g. a user "UN-liked" an activity
 * E.g. a user performed an action on an object.
 * 
 * The event log is the source of truth.
 * Events are immutable.
 * 
 * 
 */

import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

import {
  EntityType,
  EventType,
} from 'src/gql-types'

@Entity({ database: TYPEORM_DATABASE })
export class Event extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column()
  actorEid: string;

  @Column()
  partnerEid: string;

  @Column({ nullable: true })
  unObjectEid: string;

  @Column({ nullable: true })
  actionId: string;

  @Column({ type: 'enum', enum: EntityType, nullable: true })
  actionEntityType: EntityType;

  @Column({ nullable: true })
  contextId: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column('boolean', { default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
