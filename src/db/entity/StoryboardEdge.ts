/**
 * @rob4lderman
 * sep2019
 */
import {
  Entity,
  Column,
  CreateDateColumn,
  BaseEntity,
  BeforeInsert,
  PrimaryColumn,
  Unique,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

/**
 * @deprecated
 */
export enum StoryboardEdgeType {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

/**
 * @deprecated
 */
@Entity({ database: TYPEORM_DATABASE })
@Unique(['unObjectId', 'storyboardId', 'edgeType'])
export class StoryboardEdge extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  unObjectId: string;

  @Column()
  storyboardId: string;

  @Column({ type: 'enum', enum: StoryboardEdgeType, nullable: true })
  edgeType: StoryboardEdgeType;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ nullable: true })
  trackingId: string;

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
