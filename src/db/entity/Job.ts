/**
 * @rob4lderman
 * mar2020
 *  
 * A typical job will be scheduled by handler code to run a 
 * specified reaction function (aka action handler) at a specified time.
 * 
 * The Job needs all the information required to re-inflate the 
 * runtime context for the action dispatch (namely the ChatRoomActionContext).
 * This is basically everything provided on submitChatRoomAction, along
 * with the current session User.
 * 
 *  input SubmitChatRoomActionInput {
 *      chatRoomId: String!
 *      name: String!
 *      tags: [String]
 *      asUnObjectId: String
 *  }
 * 
 * A worker runs periodically and scans for Jobs to run.  A Job is run once
 * and is marked "completed" if it returns successfully.  If it fails, it will
 * be retried in the next period.
 * 
 * select * from job 
 * where isCompleted = false and isDeleted = false and dispatchAt < current_time
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
  JobType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['isDeleted', 'isCompleted', 'dispatchAt'])
export class Job extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Job })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({type: 'enum', enum: JobType, nullable: false })
  jobType: JobType;

  // TODO: // a human-readable identifier for the job (if needed??)
  // TODO: @Column({unique: true, nullable: false})
  // TODO: name: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'json', nullable: true })
  result: any;

  @Column({ type: 'timestamp with time zone', nullable: false })
  dispatchAt: Date

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: false, default: false })
  isCompleted: boolean;

  @Column({nullable: true })
  trackingId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  // Incremented whenever 'save' is called (record is updated). Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
