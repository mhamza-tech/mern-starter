import {
  Entity,
  Column,
  BeforeInsert,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  PrimaryColumn,
  Index,
  AfterLoad,
} from 'typeorm'
import { v4 } from 'uuid'
import { TYPEORM_DATABASE } from 'src/env'
import {
  Gender,
  EntityType,
  Role,
} from 'src/gql-types'

@Entity({ database: TYPEORM_DATABASE })
export class User extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always User
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.User })
  entityType: EntityType

  @Index({ unique: true })
  @Column({ unique: true, nullable: false })
  username: string

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender

  @Column('boolean', { default: false })
  isConfirmed: boolean

  @Column('boolean', { default: false })
  isVerifiedAccount: boolean

  @Column('boolean', { default: false })
  isPasswordSet: boolean

  @Column({default: 0})
  timezoneOffset: number

  @Column({ type: 'enum', enum: Role, nullable: false, default: Role.User })
  role: Role

  // Included in the JWT auth token. 
  // We can increment this from time to time to invalidate
  // old JWT tokens, e.g. on resetPassword.
  @Column({ default: 1 })
  authTokenVersion: number

  @Column({ select: false, nullable: true })
  confirmEmailToken: string

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmEmailTokenExpiresAt: Date

  @Column({ nullable: false, unique: false })
  displayName: string

  // TODO: add email validation at @BeforeInsert/BeforeUpdate
  @Index({ unique: true })
  @Column({ nullable: true, unique: true }) // { unique: true }
  email: string

  // This field is used to capture the user's email while they're still
  // anonymous when they first "follow" an object.
  @Column({ nullable: true })
  tempEmail: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: false, type: 'timestamp with time zone' })
  birthday: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  @Column({ nullable: true, type: 'timestamp with time zone' })
  signedUpAt: Date

  @Column({ select: false, nullable: true })
  password: string

  @Column({ select: false, nullable: true })
  resetPasswordToken: string

  @Column({ type: 'timestamp with time zone', nullable: true })
  resetPasswordTokenExpiresAt: Date

  @Column('boolean', { default: false })
  isAnonymous: boolean

  @Column({ nullable: false, default: 0 })
  badge: number

  @Column({ nullable: true })
  entryId: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('boolean', { default: false })
  hasCompletedSignup: boolean

  // Incremented whenever 'save' is called (record is updated).
  // Might be useful.
  @VersionColumn()
  recordVersion: number

  @BeforeInsert()
  addId(): void {
    this.id = this.id ? this.id : v4()
  }

  // These fields don't have a db column
  eid: string;
  name: string;

  @AfterLoad()
  setFields(): void {
    this.eid = `user/${this.id}`
    this.name = this.displayName
  }

  //
  // @BeforeUpdate()
  // xformImageUrl() {
  //   this.imageUrl = mapS3UrlToImgixUrl( this.imageUrl )
  // }
  // @AfterUpdate()
  // async clearCache() {
  //   await connection.queryResultCache.remove(["users_admins"]);
  // }
  //
  // TODO: email validation in typeorm at field level 
  //       https://github.com/typeorm/typeorm/blob/master/docs/validation.md
  //
  // @BeforeInsert()
  // async hashPasswordBeforeInsert() {
  //   try {
  //     this.password = await bcrypt.hash(this.password, 10)
  //   } catch (error) {
  //     console.warn(`Nullable password allowed`)
  //     // console.error(error);
  //   }
  // }

}

// let str = '<span class="my">';
// let regexp = /<(([a-z]+)\s*([^>]*))>/;
// let result = str.match(regexp);
// alert(result[0]); // <span class="my">
// alert(result[1]); // span class="my"
// alert(result[2]); // span
// alert(result[3]); // class="my"
// const s3regex = /^https:\/\/s3.us-west-1.amazonaws.com\/[^.]+[.]unreal[.]fun\/(.*)$/;
// const mapS3UrlToImgixUrl = (url: string) => {
//   if (_.isEmpty(url)) {
//     return url;
//   }
//   const result = url.match(s3regex);
//   return _.last(result);
// };
