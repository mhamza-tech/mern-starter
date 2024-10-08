/**
 * @rob4lderman
 * oct2019
 *  
 * A Field holds a piece of state.
 * Fields are linked to entities in a 1-entity-to-n-fields relationship.
 * A Field is like an Edge but w/o the other entity. 
 * All data describing a Field is contained within the field itself (in its metadata).
 * Fields can be subscribed to, for real-time updates.
 * 
 * To create a new Field type:
 * 1. add new type name to GQL FieldType 
 * 2. db migration
 * 2. add GQL resolver for new type (if desired)
 * 3. update core.resolveFieldType (if necessary)
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
  EntityType,
  FieldType,
  EntityScope,
} from '../../gql-types'
import _ from 'lodash'

@Entity({ database: TYPEORM_DATABASE })
@Index(['collectionId', 'name'], { unique: true })
@Index(['thisEntityId', 'isDeleted', 'updatedAt'])
@Index(['thisEntityId', 'type', 'isDeleted', 'updatedAt'])
@Index(['collectionId', 'isDeleted', 'updatedAt'])
@Index(['thisEntityId', 'collectionName', 'isDeleted', 'updatedAt'])
@Index(['collectionId', 'type', 'isDeleted', 'updatedAt'])  // used by collectionId:type cache
@Index(['isDeleted', 'expiresAt'])  // used by consistency.softDeleteExpiredFields 
export class Field extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Field'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Field })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: FieldType, nullable: false })
  type: FieldType;

  // all fields belong to a collection.
  // e.g. collectionId='user/{userId}/field'
  // e.g. collectionId='newsfeeditem/{newsfeedItemId}/field'
  // e.g. collectionId='chat/{chatId}/player/{playerId}/field'
  @Column({ nullable: false })
  collectionId: string;

  @Column({ type: 'enum', enum: EntityScope, nullable: true })
  scope: EntityScope;

  // another way to identify a collection of fields.  
  // multiple fields can have the same collectionId+collectionName combination.
  @Column({ nullable: true })
  collectionName: string;

  // just another way to identify the field
  // useful for gql resolvers that resolve DB Fields to type fields
  // name is unique per collection
  @Column({ nullable: true })
  name: string;

  // all fields are attached to an entity.
  @Column({ nullable: false })
  thisEntityId: string;

  @Column({ type: 'enum', enum: EntityType, nullable: false })
  thisEntityType: EntityType;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // used for arbitrary ordering of fields.
  @Column({ nullable: false, default: '' })
  order: string;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expiresAt: Date;

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

  thisEid: string;

  @AfterLoad()
  setFields(): void {
    this.thisEid = _.toLower(`${this.thisEntityType}/${this.thisEntityId}`)
  }

}
