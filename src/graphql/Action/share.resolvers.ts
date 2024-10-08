import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import {
  User,
  UnObject,
} from 'src/db/entity'
import {
  PrivateLink,
  SocialSharingService,
  MediaLink,
} from 'src/services/social-sharing'
import Joi from '@hapi/joi'
import {
  Item,
  items,
} from 'src/domain/items'
import {
  Move,
  moves,
} from 'src/domain/moves'
import { ApolloError } from 'apollo-server'
import {
  ErrorType,
  MutationSharePrivateLinkArgs,
  FeedItemActionEntityType,
  SharePrivateLinkOutput,
} from 'src/gql-types'
import { jwt } from 'src/utils'
import {
  unObjectByUsername,
  unObjectById,
} from 'src/graphql/store'
import { validate } from 'src/utils/joi'
import { sharedEntity } from 'src/maker/imgix'

const socialService = new SocialSharingService()

const buildEntityNotFound = (): ApolloError => new ApolloError(
  'Entity type for provided entity id is not found',
  ErrorType.InternalError
)

const validateEntityExists = <T>(entity: T): T => {
  if (_.isNil(entity)) {
    throw buildEntityNotFound()
  }
  return entity
}

const npcByIdOrUsername = (usernameOrId: string): Promise<UnObject | undefined> => {
  return unObjectById(usernameOrId)
    .then(npc => !_.isNil(npc)
      ? npc
      : unObjectByUsername(usernameOrId)
    )
}

const mapNPCToMediaLink = (npc: UnObject): MediaLink => {
  return {
    eid: npc.eid,
    username: npc.username,
    socialTitle: npc.socialTitle,
    socialDescription: npc.socialDescription,
    socialImageLink: sharedEntity(
      npc.socialImageS3Key,
      npc.backgroundColor,
      npc.backgroundS3Key
    ),
  }
}

const shareMediaLink = (_root, args): Promise<string> => {
  const validInput = Joi.string().required().validate(args.unObjectIdOrUsername)
  return npcByIdOrUsername(validInput.value)
    .then(validateEntityExists)
    .then(mapNPCToMediaLink)
    .then(socialService.fetchShortUrlForMediaLink)
}

const entityToShare = (type: FeedItemActionEntityType, id: string, user: User): Promise<Item | Move | UnObject | User | null> => {
  switch (type) {
    case FeedItemActionEntityType.Item:
      return Promise.resolve(items[id])
    case FeedItemActionEntityType.Move:
      return Promise.resolve(moves[id])
    case FeedItemActionEntityType.Npc:
      return npcByIdOrUsername(id)
    case FeedItemActionEntityType.User:
      return Promise.resolve(user)
    default:
      return Promise.reject(new Error(`Link generation for ${type} is not supported`))
  }
}

const entityToPrivateLink = (entity: any, user: User): PrivateLink => ({
  senderEid: user.eid,
  socialTitle: entity.socialTitle || entity.displayName,
  socialImageLink: sharedEntity(
    entity.socialImageS3Key || entity.s3Key,
    entity.backgroundColor,
    entity.backgroundS3Key
  ),
  smsGreeting: !_.isEqual(entity.id, user.id)
    ? 'Look at this... 👀'
    : `Add me on Unreal! Username: @${entity.username}`,
})

const sharePrivateLink = (parent, args: MutationSharePrivateLinkArgs, ctx: any): Promise<SharePrivateLinkOutput> => {
  const user: User = ctx.user
  const input = validate(args.input, Joi.object({
    entityId: Joi.string().required(),
    entityType: Joi.string().required().valid(...Object.values(FeedItemActionEntityType)),
  }))
  return entityToShare(input.entityType, input.entityId, user)
    .then(validateEntityExists)
    .then(entity => {
      const privateLink = entityToPrivateLink(entity, user)
      const description = (entity as any).socialDescription || ''
      return socialService.fetchShortUrlForPrivateLink(privateLink)
        .then(shortURL => ({
          title: privateLink.socialTitle,
          description,
          imageURI: privateLink.socialImageLink,
          smsGreeting: privateLink.smsGreeting,
          link: shortURL,
        }))
    })
}

export default {
  Mutation: {
    socialSharingUrl: combineResolvers(jwt.requireJwtAuth, shareMediaLink),
    shareMediaLink: combineResolvers(jwt.requireJwtAuth, shareMediaLink),
    sharePrivateLink: combineResolvers(jwt.requireJwtAuth, sharePrivateLink),
  },
}
