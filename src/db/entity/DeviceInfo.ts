/**
 * @rob4lderman
 * oct2019
 * 
 */

import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  PrimaryColumn,
  Index,
  Unique,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {  EntityType } from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Unique(['userId', 'deviceToken'])
export class DeviceInfo extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always DeviceInfo
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.DeviceInfo }) 
  entityType: EntityType

  @Column({ nullable: true })
  os: string

  @Column({ nullable: true })
  osVersion: string

  @Column({ nullable: true })
  appVersion: string

  @Column({ nullable: true })
  deviceToken: string

  @Index()
  @Column({ nullable: false })
  userId: string

  @Column({ nullable: false, default: true })
  isSignedIn: boolean

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
