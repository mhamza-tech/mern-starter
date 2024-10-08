/**
 * @rob4lderman
 * nov2019
 *  
 * Receipts are sent by the front-end to ack that it has received some data.
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
  Unique,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from '../../env'
import {
  EntityType,
  ReceiptType,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['entityEid'])
@Unique(['entityEid', 'sessionUserId', 'type'])
export class Receipt extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Receipt'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Receipt })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({ type: 'enum', enum: ReceiptType, nullable: false })
  type: ReceiptType;

  // the collectionId identifies which post / chat / etc the entity belongs to
  @Column({nullable: false })
  entityCollectionId: string;

  // the entity being receipt'ed
  @Column({nullable: false })
  entityEid: string;

  // the user issuing the receipt
  @Column({nullable: false })
  sessionUserId: string;

  // the player issuing the receipt (could be the user acting as an unobject)
  @Column({nullable: false, default: '' })
  playerEid: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

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
