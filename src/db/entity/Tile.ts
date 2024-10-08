/**
 * @rob4lderman
 * dec2019
 *  
 * Tiles map onto an absolutely-positioned Image or Animation in the view.
 * Position style is passed direction thru metadata.containerStyle.
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
import { TYPEORM_DATABASE } from '../../env'
import {
  EntityType,
  TileType,
  EntityScope,
} from '../../gql-types'

@Entity({ database: TYPEORM_DATABASE })
@Index(['collectionId', 'name'], { unique: true })
@Index(['collectionId', 'isDeleted', 'updatedAt'])
export class Tile extends BaseEntity {

  @PrimaryColumn()
  id: string;

  // always 'Tile'
  @Column({ type: 'enum', enum: EntityType, nullable: false, default: EntityType.Tile })
  entityType: EntityType

  // specific type. describes format of metadata.
  @Column({type: 'enum', enum: TileType, nullable: false })
  type: TileType;

  // all tiles belong to a collection.
  // e.g. collectionId='user/{userId}/tile'
  // e.g. collectionId='newsfeeditem/{newsfeedItemId}/tile'
  // e.g. collectionId='chatroom/{chatId}/local/{playerId}/tile'
  @Column({nullable: false })
  collectionId: string;

  @Column({type: 'enum', enum: EntityScope, nullable: true })
  scope: EntityScope;

  // just another way to identify the tile.
  // name is unique per collection
  @Column({nullable: false })
  name: string;

  // all tiles are attached to an entity.
  @Column({nullable: true })
  thisEntityId: string;

  @Column({type: 'enum', enum: EntityType, nullable: true })
  thisEntityType: EntityType;

  @Column({nullable: true })
  thisEid: string;

  @Column({ nullable: true })
  entryId: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

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
