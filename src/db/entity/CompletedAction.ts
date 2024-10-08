/**
 * @rob4lderman
 * sep2019
 */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  PrimaryColumn,
  VersionColumn,
  Index,
} from 'typeorm'
import { v4 } from 'uuid'
import {
  EntityType,
  CompletedActionType,
} from '../../gql-types'
import { TYPEORM_DATABASE } from '../../env'

@Index(['contextId', 'createdAt'])
@Index(['sessionUserId', 'createdAt'])
@Entity({ database: TYPEORM_DATABASE })
export class CompletedAction extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'SubmitAction'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.CompletedAction })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: CompletedActionType, nullable: false })
  type: CompletedActionType;

  // the contextId identifies the chatRoom / newsfeedItem / etc where this action was submitted
  @Column({nullable: false })
  contextId: string;

  // could be user or unobject
  @Column({ nullable: false, default: '' })
  actorEid: string;

  @Column({ nullable: false })
  sessionUserId: string;

  @Column({ nullable: true })
  trackingId: string;

  @Column({ type: 'json', nullable: false })
  input: object;

  @Column({ type: 'json', nullable: true })
  output: object;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

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
