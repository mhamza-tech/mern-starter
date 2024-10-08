/**
 * @rob4lderman
 * aug2019
 *  
 * An aggregate view summarizing edge stats for each entity.
 * An EdgeStats record contains stats for an entity + edgeType + edgeDirection.
 * 
 * 
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Index,
} from 'typeorm'
import { TYPEORM_DATABASE } from '../../env'
import { 
  EdgeType,
  EdgeDirection,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['entityId', 'edgeDirection', 'edgeType'], { unique: true })
@Index(['entityId', 'createdAt'])
export class EdgeStats extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false })
  entityId: string;

  @Column({ type: 'enum', enum: EdgeDirection, nullable: false })
  edgeDirection: EdgeDirection

  @Column({ type: 'enum', enum: EdgeType, nullable: false })
  edgeType: EdgeType

  @Column({ nullable: false, default: 0 })
  count: number;
 
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  // Incremented whenever 'save' is called (record is updated).
  // Might be useful.
  @VersionColumn()
  recordVersion: number

}
