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
import { EntityType } from '../../gql-types'
import { TYPEORM_DATABASE } from '../../env'
import { SimpleOrmObject } from './SimpleOrmObject'

@Entity({ database: TYPEORM_DATABASE })
@Index(['playerEid', 'actionName', 'createdAt', 'isDeleted'])
@Index(['playerEid', 'actionName', 'updatedAt', 'isDeleted'])
export class ActionXInstance extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'ActionXInstance'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.ActionXInstance })
  entityType: EntityType

  // the current "owner" of the Action
  @Column({ nullable: false })
  playerEid: string;

  // the creator (aka first owner) of the Action
  @Column({ nullable: false })
  creatorEid: string;

  // the last player to give the instance to another
  @Column({ nullable: true })
  lastGiverEid?: string;

  @Column({ nullable: false })
  actionName: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

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

export type SimpleActionXInstanceObject = SimpleOrmObject<ActionXInstance>
