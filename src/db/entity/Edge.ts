/**
 * @rob4lderman
 * aug2019
 *  
 * A directed edge between to entities (aka vertices) in the graph.
 * The edge goes from thisEntityId -> thatEntityId.
 * 
 * This is just a view on top of the data.  The source of truth is the
 * event log.  The event log records, e.g., both when the user "likes" 
 * an object and when they "unlike" it.  The Edge table settles out the
 * likes/unlikes to present just the current state of the graph.
 * 
 * Note that since the source of truth is the event log, we don't have
 * to worry about the data in this table being perfect.  We can probably
 * tolerate most errors (e.g. a missed "like") without doing anything.
 * If an error is bad enough we can always recreate the graph perfectly
 * from the event log.
 * 
 * This means we don't need to worry about ACID transactions on this view.
 * Simplifies things, no?
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
  AfterLoad,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  EdgeType,
  EntityType,
} from '../../gql-types'
import _ from 'lodash'

@Entity({ database: TYPEORM_DATABASE })
@Index(['thisEntityId', 'thatEntityId', 'edgeType', 'collectionId'], { unique: true })
@Index(['thisEntityId', 'name'], { unique: true })
@Index(['thisEntityId', 'collectionId', 'name'])
@Index(['thisEntityId', 'collectionId', 'isDeleted', 'order'])
@Index(['thisEntityId', 'collectionId', 'edgeType', 'isDeleted', 'order'])
@Index(['thisEntityId', 'collectionId', 'collectionName', 'isDeleted', 'order'])
@Index(['thisEntityId', 'collectionName', 'isDeleted', 'order'])
@Index(['thisEntityId', 'edgeType', 'isDeleted', 'createdAt'])
@Index(['thatEntityId', 'edgeType', 'isDeleted', 'createdAt'])
@Index(['thatEntityId', 'edgeType', 'isDeleted', 'order'])
@Index(['thisEntityId', 'edgeType', 'isDeleted', 'order'])
@Index(['thisEntityId', 'collectionId', 'collectionName', 'isDeleted', 'sortKey1', 'order'])
@Index(['thisEntityId', 'collectionId', 'collectionName', 'isDeleted', 'sortKey2', 'order'])
@Index(['collectionId', 'edgeType', 'isDeleted'])
export class Edge extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Edge'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Edge })
  entityType: EntityType

  // just another way to identify the edge.  
  // useful for gql resolvers that resolve edges to type fields
  // thisEntityId+name is unique.
  @Column({ nullable: true })
  name: string;

  // another way to identify a collection of edges.  
  // multiple edges can have the same thisEntityId+collectionName combination.
  @Column({ nullable: true })
  collectionName: string;

  // functions similar to Field.collectionId.
  // typically an EID-like descriptor w/ type info
  // collectionId:user/{id}/edge
  // collectionId:chatroom/{id}/local/{playerid}/edge
  // multiple edges can have the same thisEntityId+collectionName combination.
  @Column({ nullable: true })
  collectionId: string;

  @Column({ nullable: false })
  thisEntityId: string;

  @Column({ type: 'enum', enum: EntityType, nullable: false })
  thisEntityType: EntityType;

  @Column({ nullable: false })
  thatEntityId: string;

  @Column({ type: 'enum', enum: EntityType, nullable: false })
  thatEntityType: EntityType;

  // maps out the metadata (if any)
  @Column({ type: 'enum', enum: EdgeType, nullable: false })
  edgeType: EdgeType

  @Column({ nullable: false, default: 1 })
  count: number;

  // used for arbitrary ordering of edges.
  // e.g. "lastActivityAt" timestamp for ChatRoomPlayer edges 
  @Column({ nullable: false, default: '' })
  order: string;

  // used for arbitrary ordering of edges.
  @Column({ nullable: false, default: '' })
  sortKey1: string;

  // used for arbitrary ordering of edges.
  @Column({ nullable: false, default: '' })
  sortKey2: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

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

  thisEid: string;
  thatEid: string;

  @AfterLoad()
  setFields(): void {
    this.thisEid = _.toLower(`${this.thisEntityType}/${this.thisEntityId}`)
    this.thatEid = _.toLower(`${this.thatEntityType}/${this.thatEntityId}`)
  }

}
