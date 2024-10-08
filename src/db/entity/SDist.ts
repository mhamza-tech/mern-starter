/**
 * @rob4lderman
 * dec2019
 *  
 * S distributions created by following markov chains defined in QEdges. 
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
import {
  EntityType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['startingNodeEid', 'endingNodeEid', 'buildPhase'], { unique: true })
@Index(['startingNodeEid', 'buildPhase'])
@Index(['startingNodeEid', 'endingNodeEntityType', 'buildPhase'])
export class SDist extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'SDist'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.SDist })
  entityType: EntityType

  @Column({nullable: false, default: 'staging' })
  buildPhase: string;

  @Column({nullable: false })
  startingNodeEid: string;

  @Column({type: 'enum', enum: EntityType, nullable: false })
  startingNodeEntityType: EntityType;

  @Column({nullable: false })
  endingNodeEid: string;

  @Column({type: 'enum', enum: EntityType, nullable: false })
  endingNodeEntityType: EntityType;

  @Column({ nullable: false })
  iterations: number;

  @Column({ type: 'float8', nullable: false, default: 0.0 })
  s: number;

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
