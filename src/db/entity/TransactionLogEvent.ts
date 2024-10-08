import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm'

import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'

import { EntityType } from 'src/gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['userId', 'unObjectId', 'chatroomId'])
export class TransactionLogEvent extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  userId: string

  @Column({ type: 'enum', enum: EntityType })
  userEntityType: EntityType

  @Column({})
  unObjectId: string

  @Column({ type: 'enum', enum: EntityType })
  unObjectEntityType: EntityType

  @Column({ nullable: true })
  subjectId: string

  @Column({ type: 'enum', enum: EntityType })
  subjectEntityType: EntityType

  @Column()
  actionId: string

  @Column({ type: 'enum', enum: EntityType })
  actionEntityType: EntityType

  @Column()
  chatroomId: string

  @Column()
  contextId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
