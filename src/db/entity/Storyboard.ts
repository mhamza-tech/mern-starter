/**
 * @rob4lderman
 * sep2019
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
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

/**
 * @deprecated
 */
export enum StoryboardStatus {
  Published = 'Published',
  Draft = 'Draft',
}

/**
 * @deprecated
 */
@Entity({ database: TYPEORM_DATABASE })
export class Storyboard extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  createdByUserId: string;

  @Column()
  unObjectId: string;

  // user-supplied name
  @Column({nullable:true })
  name: string;

  @Column({ type: 'enum', enum: StoryboardStatus, nullable: true })
  status: StoryboardStatus;

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
