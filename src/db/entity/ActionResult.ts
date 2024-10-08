
/**
* @rob4lderman
* aug2019
*/
import {
  Entity,
  Column,
  CreateDateColumn,
  BaseEntity,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

@Entity({ database: TYPEORM_DATABASE })
export class ActionResult extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  trackingId: string;

  @Column()
  unObjectId: string;

  @Column()
  userId: string;

  // as typed by the user.
  @Column()
  userAction: string;

  // as typed by the user.
  @Column({ type: 'float', nullable: false })
  confidence: number;

  // the state from which the action occurred
  @Column()
  startState: string;

  // the state to which the action transitioned. (yuk wording)
  @Column()
  endState: string;

  // as parsed
  @Column()
  action: string;

  @Column({ nullable: true })
  newsfeedText: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ type: 'json', nullable: false })
  card: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'json', nullable: false })
  session: object;

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
