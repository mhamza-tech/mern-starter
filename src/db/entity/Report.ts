import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  PrimaryColumn,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  EntityType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
export class Report extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always Report
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Report })
  entityType: EntityType

  @Column({ nullable: false })
  sessionUserId: string

  @Column({ nullable: false })
  reportedPlayerEid: string

  @Column({ nullable: false, unique: false })
  reason: string

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
