/**
 * @rob4lderman
 * oct2019
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
import { TYPEORM_DATABASE } from 'src/env'
import {
  EntityType,
  ChatRoomType,
} from 'src/gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['playerEids'])
export class ChatRoom extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'ChatRoom'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.ChatRoom })
  entityType: EntityType

  @Column({ type: 'enum', enum: ChatRoomType, nullable: false, default: ChatRoomType.PersonalPlayRoom })
  type: ChatRoomType;

  // ordered, comma-seperated list of playerEids. 
  // easy way to enforce uniqueness by player list.
  // note: chat rooms can be "destroyed" so this uniqueness constraint has been lifted
  @Column({ nullable: false })
  playerEids: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

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
