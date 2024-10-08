/**
 * @rob4lderman
 * sep2019
 */
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
import {
  Role,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['userId', 'role'])
export class UserRole extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  userId: string

  @Column({ type: 'enum', enum: Role })
  role: Role

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
