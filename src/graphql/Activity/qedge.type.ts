/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`
    enum QEdgeType {
        StagingQEdge
        QEdge
        ActorToReactions
        PlayerToFollowing
        PlayerToFollowers
        PlayerToNewsfeedItems
        UserToUnObjects
        AuthorToComments
        ActorToCompletedActions
        NewsfeedItemToReactions
        NewsfeedItemToComments
        NewsfeedItemToPlayers
        ChatRoomToPlayers
        ChatRoomToUnObject
        ChatRoomToComments
        UnObjectToMaker
        CommentToAuthor
        CompletedActionToActor
        CommentToReactions
        CommentToCollection
        CompletedActionToCollection
    }

    input CreateSDistInput {
        startingNodeEid: String!
        endingNodeEid: String!
        iterations: Int!
        s: Float!
        buildPhase: String
    }
`
