/**
 * @rob4lderman
 * mar2020
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
} from '../../gql-types'

import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
@Index(['thisEid'], { unique: true })
export class Location extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // constant
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Location })
  entityType: EntityType

  // the user/unobject associated with this location record
  @Column({ nullable: true })
  thisEid: string;

  @Column({ nullable: false, default: 0 })
  x: number;

  @Column({ nullable: false, default: 0 })
  y: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  // Incremented whenever 'save' is called (record is updated). Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
