/**
 * @rob4lderman
 * sep2019
 *
 */
import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeInsert,
} from 'typeorm'
import { v4 } from 'uuid'

@Entity()
export class Image extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  storageService: string;

  @Column()
  mimetype: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  origImageId: string;

  @Column()
  dimensions: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Incremented whenever 'save' is called (record is updated).
  // Might be useful.
  @VersionColumn()
  recordVersion: number;

  @BeforeInsert()
  addId(): void {
    this.id = v4()
  }

}
