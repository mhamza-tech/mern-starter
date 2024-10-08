/**
 * @rob4lderman
 * aug2019
 */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  BaseEntity,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
export class ActionWithContext extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  createdByUserId: string;

  // actions never change
  @Column()
  actionId: string;

  @Column({ type: 'json', nullable:true })
  action: object;

  // player contexts change, so we record a snapshot.
  // if we're going to record a snapshot, why not store
  // the snapshot where it belongs, in the PlayerContext table.
  // This becomes myPlayerContextId: string; Cuz there's 
  // a PlayerContext record that is immutable and saved.
  // It is read at the beginning of each interaction from the previous PlayerContext.
  // It is updated during the session.
  // It is written back to the store as a new PlayerContext record.
  // It does not change th eexisting record.
  // Anyone pointing at the existing record will function according to 
  // the existing record.
  // When does anyone get notified that there's a new PlayerContext record they should be using? 
  // An event that a new PlayerContext for a userId was created.
  @Column()
  myPlayerContextId: string;

  @Column({ type: 'json', nullable:true })
  myPlayerContext: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @VersionColumn()
  recordVersion: number

  @Column({nullable: true })
  trackingId: string;
 
  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
