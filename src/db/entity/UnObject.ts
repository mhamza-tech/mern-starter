/**
 * @rob4lderman
 * aug2019
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
  Index,
  AfterLoad,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from 'src/env'
import {
  EntityType,
  UnObjectType,
  Role,
  Gender,
} from 'src/gql-types'

@Index(['createdByUserId', 'isDeleted', 'createdAt'])
@Entity({ database: TYPEORM_DATABASE })
export class UnObject extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always UnObject
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.UnObject })
  entityType: EntityType

  @Column()
  createdByUserId: string;

  @Column({ nullable: false, unique: false })
  name: string;

  @Index({ unique: true })
  @Column({ nullable: false, unique: true })
  username: string

  @Column({ type: 'enum', enum: Gender, nullable: false, default: Gender.NonBinary })
  gender: Gender

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  entryId: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  gradientS3Key: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  handlerUnObjectId: string;

  @Column({ nullable: true })
  backgroundColor: string;

  @Column({ nullable: false })
  bio: string;

  @Column({ type: 'enum', enum: UnObjectType, nullable: false, default: UnObjectType.UnObject })
  unObjectType: UnObjectType

  @Column({ nullable: false, default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  featuredSortKey: string;

  @Column({ nullable: true })
  hashtribute: string;

  @Column({ nullable: true })
  actionSheetBackgroundColor: string;

  @Column({ nullable: false, default: true })
  showBackpack: boolean;

  @Column({ nullable: false, default: false })
  showControlBar: boolean;

  @Column({ nullable: false, default: false })
  showResetButton: boolean;

  @Column({ nullable: false, default: 1 })
  minOccupancy: number;

  @Column({ nullable: true, default: 1 })
  maxOccupancy: number | null;

  @Column({ nullable: true })
  backgroundS3Key: string;

  @Column({ nullable: true })
  coverS3Key: string;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: false })
  socialTitle: string

  @Column({ nullable: false })
  socialDescription: string

  @Column({ nullable: true })
  socialImageS3Key: string | null

  @Column({ nullable: false, default: true })
  allowHashtributeNotifications: boolean;

  @Column({ nullable: false, default: false })
  disableButtonsUponAction: boolean;

  @Column({ type: 'enum', enum: Role, nullable: false, default: Role.User })
  visibleForRole: Role

  @Column({ nullable: false, default: false })
  isDestination: boolean;

  @Column({ nullable: true })
  minUserAge: number;

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

  eid: string;

  @AfterLoad()
  setFields(): void {
    this.eid = `unobject/${this.id}`
  }

}
