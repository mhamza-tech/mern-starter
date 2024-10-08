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
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
@Unique(['userId', 'unObjectId'])
export class StorylineSession extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  unObjectId: string;

  @Column()
  userId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'json', nullable: false })
  session: object;

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
