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
  ActionType,
} from '../../gql-types'

import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
@Index(['name'], { unique: true })
@Index(['name', 'isDeleted'])
@Index(['package', 'isDeleted'])
@Index(['unObjectId', 'isDeleted'])
export class ActionX extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Comment'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.ActionX })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: ActionType, nullable: false })
  type: ActionType;

  // system-level and object-level actions will have null here.
  @Column({ nullable: true })
  createdByUserId: string;

  // if the action is specific to an object.
  @Column({ nullable: true })
  unObjectId: string;

  @Column()
  name: string;

  // functions similar to Field.collectionId.
  // typically an EID-like descriptor w/ type info
  // collectionId:actionx
  // collectionId:unobject/{id}/actionx
  @Column({nullable: true })
  collectionId: string;

  @Column()
  text: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  entryId: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: false, default: 'ffffff' })
  backgroundColor: string;

  @Column()
  package: string;

  @Column({ nullable: false, default: 0 })
  xp: number;

  @Column({ nullable: false, default: 0 })
  power: number;

  @Column({ nullable: true, default: '' })
  order: string;

  // list of tags as a stringified JSON array
  @Column({ nullable: true })
  rawTags: string;

  // arbitrary args object
  @Column({ type: 'json', nullable: true })
  args: any;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

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
