/**
 * @rob4lderman
 * aug2019
 *  
 * An Activity represents a single User interaction with an UnObject.
 * An ActionResult represents this too.
 * ActionResults are promoted to Activities if they have a newsfeed entry
 * (i.e. they're interesting and worthy of publishing to the activity log).
 * 
 * Reactions are also interactions with UnObjects.
 * But you can also react to Activities.
 * So you react to entities.  Entities can be Activities, UnObjects, Users, etc.
 * A reaction establishes a relationship with the entity.
 * You "like" an Activity.
 * You "follow" a User.
 * You "subscribe" to an UnObject.
 * Reactions are events.  
 * You later "un-subscribe" from an UnObject.
 * So we need a "current state" view on the event log that settles out subscribe/un-subscribe.
 * I.e. the current state of the graph (which edges actually exist)
 * We also need an aggregate view 
 * 
 * These are all views on top of an event log.
 * Event:User-UnObject Interaction => Event => ActionResult => Activity
 * Event:User-Activity Reaction => Event => Edge (think graphs) 
 * Event:User-UnObject Reaction => Event => Edge 
 * Event:User-User Reaction => Event => Edge 
 * Event:User-Thing Anti-Reaction (i.e. "un-follow") => Event => REMOVE Edge
 * 
 * Event:
 *  userId: number;
 *  eventType: string;
 *  data: object;
 *  
 * Edge:
 *  outEntityId: 
 *  InEntityId:
 *  edgeType: string;
 *  data: object;
 *  
 * Activitiy:
 *  userId:
 *  unObjectId:
 *  text
 *  activityType:
 *  
 * 
 * Current state (i.e. reaction counts) is an aggregation of Edges.
 * What does the aggregation look like?
 * 
 * 
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
import { TYPEORM_DATABASE } from '../../env'

export enum ActivityType {
  Activity = 'Activity',
  ActionResult = 'ActionResult',
  ActionWithContext = 'ActionWithContext',
}

@Entity({ database: TYPEORM_DATABASE })
export class Activity extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  trackingId: string;

  @Column({ nullable: true })
  actionResultId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  unObjectId: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    nullable: false,
  })
  activityType: ActivityType

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  // Incremented whenever 'save' is called (record is updated).
  // Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
