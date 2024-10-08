/**
 * @rob4lderman
 * sep2019
 * 
 * @deprecated - use ActionX
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
import { TYPEORM_DATABASE } from 'src/env'

/**
 * @deprecated - use ActionX
 */
@Entity({ database: TYPEORM_DATABASE })
export class Action extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  createdByUserId: string;

  @Column()
  storyboardId: string;

  @Column({ nullable: true })
  unObjectId: string;

  @Column()
  buttonText: string;

  @Column({ nullable: true })
  extendState: string;

  @Column()
  startState: string;

  @Column()
  endState: string;

  @Column({ type: 'json' })
  card: object;

  @Column({nullable:true })
  newsfeedText: string;

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
