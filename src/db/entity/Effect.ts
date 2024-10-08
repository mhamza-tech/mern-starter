/**
 * @rob4lderman
 * nov2019
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
  VersionColumn,
  Index,
  AfterLoad,
} from 'typeorm'
import { v4 } from 'uuid'
import {
  EntityType,
  EffectType,
  EntityScope,
} from '../../gql-types'
import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
export class Effect extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Effect' 
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Effect })
  entityType: EntityType

  @Column({ type: 'enum', enum: EffectType, nullable: false })
  type: EffectType;

  @Index()
  @Column({ nullable: false })
  collectionId: string;

  @Column({ type: 'enum', enum: EntityScope, nullable: true })
  scope: EntityScope;

  // all effects are attached to an entity.
  @Column({ nullable: true })
  thisEntityId: string;

  @Column({ type: 'enum', enum: EntityType, nullable: true })
  thisEntityType: EntityType;

  @Column({ nullable: true })
  thisEid: string;

  @Index()
  @Column({ nullable: true })
  sessionUserId: string;

  @Index()
  @Column({ nullable: true })
  trackingId: string;

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

  eid: string;

  @AfterLoad()
  setFields(): void {
    this.eid = `unobject/${this.id}`
  }

}
