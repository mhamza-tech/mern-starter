/**
 * @rob4lderman
 * dec2019
 *  
 * An entry in the Q matrix of the markov chain that describes the
 * "transition probabilites" between every node in the database.
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
  QEdgeType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['thisEntityId', 'thatEntityId', 'buildPhase'], { unique: true })
@Index(['thisEntityId'])
export class QEdge extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Edge'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.QEdge })
  entityType: EntityType

  // maps out the metadata (if any)
  @Column({ type: 'enum', enum: QEdgeType, nullable: false })
  type: QEdgeType

  @Column({nullable: false, default: 'staging' })
  buildPhase: string;

  @Column({nullable: false })
  thisEntityId: string;

  @Column({type: 'enum', enum: EntityType, nullable: false })
  thisEntityType: EntityType;

  @Column({nullable: false })
  thatEntityId: string;

  @Column({type: 'enum', enum: EntityType, nullable: false })
  thatEntityType: EntityType;

  @Column({ type: 'float8', nullable: true, default: 0.0 })
  q: number;

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
