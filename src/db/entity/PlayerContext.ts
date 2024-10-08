/**
 * @rob4lderman
 * aug2019
 */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Unique,
  PrimaryColumn,
  BeforeInsert,
  VersionColumn,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

/**
 * @deprecated - use ActionX
 */
@Entity({ database: TYPEORM_DATABASE })
@Unique(['userId', 'storyboardId'])
export class PlayerContext extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  storyboardId: string;

  @Column()
  userId: string;

  @Column()
  currentState: string;

  @Column({ type: 'json' })
  actionStubs: object[];

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @VersionColumn()
  recordVersion: number

  @Column({ nullable: true })
  trackingId: string;

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
