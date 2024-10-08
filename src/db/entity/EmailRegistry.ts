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

@Entity({ database: TYPEORM_DATABASE })
export class EmailRegistry extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // TODO: add email validation at @BeforeInsert/BeforeUpdate
  @Index({ unique: true })
  @Column({ nullable: false, unique: true })
  email: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

}
