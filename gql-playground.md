

# Unreal GraphQL


1. [GraphQL API](#graphql)
1. [Rob's GQL Playground](#gql-playground)


<a name="graphql"> </a>

## GraphQL API

### GQL Playground Links

* Local Playground: [http://localhost:3334/](http://localhost:3334/) 
* Dev Playground: [https://gql-dev.unreal.fun/](https://gql-dev.unreal.fun/)
* Staging Playground: [https://gql-staging.unreal.fun/](https://gql-staging.unreal.fun/)
* Prod: Doesn't have playground but you can point another playground to the prod server: [https://gql.unreal.fun/](https://unreal-gql.unreal.fun/)

### HTTP Headers

* Some APIs require `MASTER_API_KEY` authz: `x-api-key` http header. 
* Some APIs require a logged-in session: `x-token` http header.
* Note: `x-tracking-id` is experimental and optional (trying to track a request flow across services and async events)

Example http headers setup in GQL Playground (the x-token probly doesn't work anymore - you can create one by running the signIn mutation):

    {
      "x-api-key":"unrealiswherejeffthrowspoopathisfriends",
      "x-tracking-id":"testing1234",
      "x-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA2ZjE5ODMyLTc1YjgtNDRhOC1hNzk1LTJhODQ3OWQxODU0MSIsImF1dGhUb2tlblZlcnNpb24iOjEsImlhdCI6MTU2Njg1NTgxNX0.F2cxmz9gz0T9I1UbQ9kGVC3UcelPQ7slnv6xcmmFql0"
    }
 

### Creating Sessions

* You can create an anonymous session via the `session` api.
* You can create a user session via the `signUp / signIn / resetPassword / confirmEmail` apis
    * These apis return a `SignInResult` which contains `{ user, token }`
    * Copy the token into the `x-token` header.
* signUp and forgotPassword will email you links.
    * links are configured via the `CONFIRM_EMAIL_URL` and `RESET_PASSWORD_URL` env vars
    * see env files:
        * [.env (local)](.env) 
        * [dev](aws/development/.ebextensions/environment-vars.config) 
        * [staging](aws/staging/.ebextensions/environment-vars.config)
        * [prod](aws/production/.ebextensions/environment-vars.config)
    * the links contain a `token={{token}}` query parm
    * you'll need the token for the corresponding confirmEmail and resetPassword APIs


<a name="gql-playground"> </a>

##  Rob's GQL Playground 

(cuz sometimes it doesn't save in the browser and that's very annoying)


**DISCLAIMER**: no guarantee certain parts of this haven't become stale / stopped working


### AUTH

    query me {
      me {
        id
        eid
      	email
        displayName
        presence
        level
        unObjects {
          unObjects {
            eid 
            name
            text
          }
        }
        f1: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        f2: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        f3: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        f4: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        f5: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        f6: friend(input:"e0423df8-66f8-4db0-a255-8da0d1060d22") {
          email
        }
        deviceInfos {
          deviceToken
          updatedAt
        }
        chatRooms {
          chatRooms { 
            id
            actions {
              actions {
                name
                text
                description
                unObjectId
              }
            }
            players {
              name
            }
            comments {
              comments {
                text 
                author {
                  name
                }
              }
            }
          }
        }
      }
    }

    mutation signIn {
      signIn(input:{
        emailOrUsername:"rob+local@unreal.fun",
        password:"123412345"
      }) {
        token
        user {
          id
          email
        }
      }
    }

    mutation signOut {
      signOut(input:{
        deviceToken:"ccv3bWC1m-o:APA91bEiCDUy4BzRoDL_ni9BQQYQIi8zNg1NSDhG8d_aHnJMmWrl_QQOy_M77ET7ITk4lB1nScwKuOcH3aGLXErYBVUbvqnBikttNXK1tbo1muL6d4eQrJzqSBuc312I94tTJEyp3cGu"
      }) {
        result
      } 
    }

    mutation updatePassword {
      updatePassword(input:{
        newPassword:"123412345"
      }) {
        id
        email
      }
    }

    mutation updateMe {
      updateMe(input:{
        displayName:"robaaa"
      }) {
        id
        displayName
        f1: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
        f2: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
        f3: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
        f4: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
        f5: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
        f6: friend(input:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a") {
          email
          displayName
        }
      }
    }

    mutation sendPushNotification {
      sendPushNotification(input:{
        notificationId:"fdb1db77-669c-40d6-a251-661e4391b558"
      }) {
        result
      }
    }



    mutation saveDeviceInfo {
      saveDeviceInfo(input:{
        deviceToken:"ccv3bWC1m-o:APA91bEiCDUy4BzRoDL_ni9BQQYQIi8zNg1NSDhG8d_aHnJMmWrl_QQOy_M77ET7ITk4lB1nScwKuOcH3aGLXErYBVUbvqnBikttNXK1tbo1muL6d4eQrJzqSBuc312I94tTJEyp3cGu",

      }) {
        deviceInfo {
          userId
          deviceToken
        }
      }
    }

    mutation createChatRoomComment {
      createChatRoomComment(input:{
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        text:"aloha from rob"
      }) {
        comment {
          id
        }
      }
    }

    mutation masterSession {
      masterSession(input:{email:"jeff@unreal.fun"}) {
        user {
          id
          email
        }
        token
      }
    }

    query user {
      user(input:{email:"jeff+maker@unreal.fun"}) {
        id
        email
      }
    }

    mutation savePresence {
      savePresence(input:{presenceType:Online}) {
        field {
          id
          thisEid
          type
          asPresenceField {
            presenceType
          }
        }
      }
    }

    # as unobject
    # "x-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwMGQ4OWFhLTNiMzEtNDZhNC1iZTViLWQwNGY3NzI1MzU0OCIsImF1dGhUb2tlblZlcnNpb24iOjEsImlhdCI6MTU3MzQ4NjE1OH0.otMq-7ivENvHc7iPynawAkTz90-VS16bOw-So5MtqeY"
    # as rob
    # "x-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNhZjc4YWIwLWQwY2YtNGIzZC05NTRkLWNmZTc5YjAyMDAxYSIsImF1dGhUb2tlblZlcnNpb24iOjMsImlhdCI6MTU3NDI4MDI5MH0.uQ_6FGvGvgzfQUPMpsIns6AD1NZ_eoLTxfKr8aqIflk"


### Chat Room

    query chatRoom {
      chatRoom(input:{
        # chatRoomId:"27eda756-3dde-40cf-adf7-fdcfb54dd8f7"
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        # chatRoomId:"1495f245-9b63-48c2-b232-dbc7d0279b6e"
        # chatRoomId:"19bcb05f-4585-462a-8bb2-46817ff3cc75"
      }) {
        chatRoom {
          id
          isDestroyed
          tiles {
            tiles {
    					id
              name
              containerStyle
            }
          }
          myTiles {
            tiles {
    					id
              name
              containerStyle
            }
          }
          myActions {
            actions {
              name
              text
              backgroundColor
            }
          }
          effects {
            effects {
              id
              eid
              type
              createdAt
              asAnimationEffect {
                animationType
                sourceUri
              }
              receipts {
    						receipts {
                  id
                  entityEid
                  sessionUserId
                  type
                }
              }
            }
          }
          players {
            eid
            isMe
            presence

          }
          channels {
     				channelId
          }
          comments(input:{pageInput:{last:20}}) {
            comments {
              eid
    					text
            	authorEid
              asChatRoomSystemComment {
    						visibleToPlayerIds
                visibleToPlayerEids
                isVisibleToMe
              }
              commentReceipts {
                commentReceipts {
                  playerEid 
                  sessionUserId 
                }
              }
            }
          }
    
        }
      }
    }

    mutation createChatRoom {
      createChatRoom(input:{
        # playerEids:[ "unobject/10"]
        # playerEids:[ "unobject/5416abee-2225-4758-9315-e49653b7f963"]
        playerEids:[ "user/7c07eafe-2d89-4ed5-adc6-cc77a6e025aa"]
      }) {
        chatRoom {
          id
          isDestroyed
          players {
            eid
            isMe
          }
        }
      }
    }

    mutation createChatRoomComment {
      createChatRoomComment(input:{
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        # chatRoomId:"27eda756-3dde-40cf-adf7-fdcfb54dd8f7"
         asUnObjectId:"35",
         text:"testing 1234"
      }) {
        comment {
          id
          authorEid
          text
          createdAt
        }
      }
    }

    mutation enterChatRoom {
      enterChatRoom(input:{
        # chatRoomId:"135f364a-fe6c-4cae-8098-beddaa92de44",
        #chatRoomId:"1495f245-9b63-48c2-b232-dbc7d0279b6e"
        # chatRoomId:"417ae930-44f6-4ebb-a7b8-8b8c5caa253c"
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        # asUnObjectId:"5416abee-2225-4758-9315-e49653b7f963"
      }) {
        result
      }
    }

    mutation destroyChatRoom {
      destroyChatRoom(input:{
        # chatRoomId:"27eda756-3dde-40cf-adf7-fdcfb54dd8f7"
        chatRoomId:"3d6ed05e-849e-4be9-9c38-0c78dad00b74"
        # chatRoomId:"417ae930-44f6-4ebb-a7b8-8b8c5caa253c"
        # chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        #asUnObjectId:"35"
      }) {
        field {
          name
          metadata
        }
        chatRoom {
          id
          isDestroyed
        }
      }
    }

    mutation submitChatRoomAction {
      submitChatRoomAction(input:{
        # chatRoomId:"1cb546f3-bd2c-44e7-8e41-2e9998661e5b",
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        # chatRoomId:"27eda756-3dde-40cf-adf7-fdcfb54dd8f7"
        # chatRoomId:"19bcb05f-4585-462a-8bb2-46817ff3cc75",
        # asUnObjectId:"35",
        name:"reset"
      }) {
        trackingId
        result
      }
    }

    mutation submitAction {
      submitAction(input:{
        # asUnObjectId:"35",
        name:"poke",
        tags:["taste", "aggressive"]
      }) {
        trackingId
        result
      }
    }

    mutation saveAction {
      saveAction(input:{
        name:"growl",
        text:"Growl",
        description:"Grrr!",
        package:"core",
        backgroundColor:"ff88ff",
        tags:["aggressive"]
      }) {
        action {
          id
          name
          tags
          createdAt
          updatedAt
        }
      }
    }

    mutation saveTile {
      saveTile(input:{
        name:"playerscore",
        collectionId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/local/3af78ab0-d0cf-4b3d-954d-cfe79b02001a/tile",
        type:ImageTile,
        metadata:{
          containerStyle:{
            backgroundColor:"#ffffff",
          }
        }
      }) {
        tile {
          id
          entityType
          type
          collectionId
          name
          isDeleted
          containerStyle 
          entryId
          image {
            uri
          }
          metadata
        }
      }
    }

    mutation saveIsTypingField {
      saveIsTypingField(input:{
        chatRoomId:"495e2ac1-6958-4beb-8899-92153666c576",
        isTyping:false,
        # asUnObjectId:"35"
      }) {
        field {
          id
          collectionId
          name
          asBooleanField {
      			booleanValue 
          }
        }
      }
    }

    mutation saveCommentReceipt {
      saveCommentReceipt(input:{
        collectionId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/comment",
        commentId:"e1621f0-b8c2-4c36-8561-b09d61b94906",
        receiptType:Received,
        asUnObjectId:"35"
      }) {
        commentReceipt {
          id
          entityType
          receiptType
          playerEid
          collectionId
          commentId
        }
      }
    }

    mutation saveReceipt {
      saveReceipt(input:{
        entityCollectionId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/effect",
        entityEid:"effect/a97d8da4-4dbb-4482-a002-4769e7a7b718",
        type:Received
      }) {
        receipt {
          id
          entityType
          type
          entityCollectionId
          entityEid
        }
      }
    }

    query me {
      me {
        id
        email
        presence
        image {
     			uri
        }
        actionSheet {
          actions {
            id
            name
          }
        }
        chatRooms {
          pageInfo {
            firstCursor
            lastCursor
          }
          chatRooms {
            id
            players {
              eid
            }
            comments(input:{pageInput:{last:3}}) {
              comments {
                id 
                collectionId
                authorEid
                text
              }
            }
          }
        }
        unObjects {
          unObjects {
            id
            handlerUnObjectId 

          }
        }
      }
    }

    query tracking {
      tracking(input:{trackingId:"47b8e1ba-48da-4b1f-b599-80ee3711a70f"}) {
        trackingId
        effects {
          createdAt
    			id
          type
        }
        newsfeedItems {
          createdAt
          id
          type
        }
        completedActions {
          id
          type
        }
        comments {
          id
          type
        }
        notifications {
    			id
        	type
        }
      }
    }

    # as unobject
    # "x-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwMGQ4OWFhLTNiMzEtNDZhNC1iZTViLWQwNGY3NzI1MzU0OCIsImF1dGhUb2tlblZlcnNpb24iOjEsImlhdCI6MTU3MzQ4NjE1OH0.otMq-7ivENvHc7iPynawAkTz90-VS16bOw-So5MtqeY"
    # as rob
    # "x-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNhZjc4YWIwLWQwY2YtNGIzZC05NTRkLWNmZTc5YjAyMDAxYSIsImF1dGhUb2tlblZlcnNpb24iOjMsImlhdCI6MTU3NDI4MDI5MH0.uQ_6FGvGvgzfQUPMpsIns6AD1NZ_eoLTxfKr8aqIflk"

### NODE / ADMIN



    query node {
      node(input:{
        # eid:"chatroom/1495f245-9b63-48c2-b232-dbc7d0279b6e"
        # eid:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a"
        # eid:"user/400d89aa-3b31-46a4-be5b-d04f77253548"
        # eid:"chatroom/495e2ac1-6958-4beb-8899-92153666c576",
        # eid:"unobject/36"
        eid:"newsfeeditem/d981c6f5-baca-45a6-a86f-64b68392177c"
      }) {
        node {
          id
          eid
          asUnObject {
            createdByUserId
            createdByUser {
    				  email
            }
          }
          asUser {
    				username 
            email
          }
          edges {
    				edges {
              thisEid
              thatEid
              edgeType
              name
              collectionName
              createdAt
            }
          }
          edgeStats(input:{edgeType:Likes}) {
            edgeStats {
              entityId
              edgeDirection
              edgeType
              count
            }
          }
          fields {
            fields {
              collectionId
              name
              type
              metadata
              asNumberField {
    						numberValue
              }
              asActionsField {
                actions {
                  name
                  unObjectId
                  text
                }
              }
              asJSONObjectField 
            }
          }
        }
      }
    }

    mutation saveField {
      saveField(input:{
        collectionId:"user/400d89aa-3b31-46a4-be5b-d04f77253548/field",
        thisEntityId:"400d89aa-3b31-46a4-be5b-d04f77253548",
        thisEntityType:User,
        type:NumberField,
        name:"level",
        metadata:{
          numberValue:12
        }
      }) {
        field {
          collectionId
          name
          metadata
        }
      }
    }

    mutation saveEdge {
      saveEdge(input:{
        thisEntityId:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a",
        thisEntityType:User,
        thatEntityId:"5ce3ef32-8392-4454-b0e6-e928ba42abbd",
        thatEntityType:ActionX,
        edgeType:ActionX,
        collectionName:"actionSheet"
      }) {
        edge {
          name
          edgeType
          thisEid
          thatEid
        }
      }
    }

    mutation createEdge {
      createEdge(input:{
        thisEntityId:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a",
        thisEntityType:User,
        thatEntityId:"400d89aa-3b31-46a4-be5b-d04f77253548",
        thatEntityType:User,
        edgeType:Follows  
      }) {
        edge {
          thisEid
          thatEid
          edgeType
        }
      }
    }

    mutation createEffect {
      createEffect(input:{
        collectionId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/effect",
        type:AnimationEffect,
        metadata:{
          animationType:""
        }
      }) {
        effect {
          id
          entityType
          type 
          collectionId
          sessionUserId 
          trackingId
          createdAt 
          metadata
          asAnimationEffect {
            animationType
          }
        }
      }
    }

    mutation createAnimationEffect {
      createAnimationEffect(input:{
        collectionId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/effect",
        animationType:,
        startFrame:50
      }) {
        effect {
          id
          entityType
          type 
          collectionId
          sessionUserId 
          trackingId
          createdAt 
          metadata
          asAnimationEffect {
            animationType
            sourceUri
            startFrame
            endFrame
          }
        }
      }
    }

    mutation cacheRefetch {
      cacheRefetch(input:{
        cacheName:"unObjectCache",
        cacheKey:"36"
      }) {
        result
      }
    }


### SUBSCRIPTIONS


    subscription channel {
      channel(input:{
        channelId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/tile",
        # channelId:"newsfeeditem/d981c6f5-baca-45a6-a86f-64b68392177c/comment",
        # channelId:"chatroom/19bcb05f-4585-462a-8bb2-46817ff3cc75/comment",
        # channelId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/local/3af78ab0-d0cf-4b3d-954d-cfe79b02001a/field",
        # channelId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/local/35/field",

        # channelId:"chatroom/417ae930-44f6-4ebb-a7b8-8b8c5caa253c/comment",
        # channelId:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a/edge",
        channelType:Collection
      }) {
        changeType 
        snapshot {
          data
        }
        node {
          entityType
          asTile {
            id
            name
            collectionId
            isDeleted
            image {
              uri
            }
            containerStyle
          }
          asComment {
            ...CommentData
          }
          asEffect {
            type 
            collectionId
            asAnimationEffect {
              sourceUri
              animationType
              startFrame
              endFrame
            }
          }
        }
        field {
          id
          collectionId
          name
          type
          updatedAt
          thisEid
          metadata
        }
        edge {
          thisEid
          thatEid
          edgeType
        }
        asEdge {
          thisEid
          thatEid
          edgeType
        }
      }
    }

    fragment CommentData on Comment {
      id
      text
      type
      authorEid
      author {
        image {
          uri
        }
      }
      createdAt
      asChatRoomSystemComment {
        isVisibleToMe
      }
    }

### NEWSFEED 

    query newsfeedItems {
      newsfeedItems(input:{pageInput:{last:20}}) {
        newsfeedItems {
          id
          type
          createdAt
          comments {
    				comments {
    					id
             	text
              author {
                name
                isMe
              }
            }
          }
          asNewsfeedItemStatusUpdate {
            statusText
          }
          asNewsfeedItemQuote {
            statusText
          }
          asNewsfeedItemInteraction {
            statusText
          }
          asNewsfeedItemSuggestedObjects {
            text
          }
          asNewsfeedItemUnObjectCard {
            statusText
            actor {
              id
              entityType
              name
              image {
                uri
              }
              asUser {
                username
              }
            }
            unObject {
              id
              name
              text
              image {
                uri
              }
            }
          }
        }
      }
    }

    query newsfeedItem {
      newsfeedItem(input:{
        newsfeedItemId:"d981c6f5-baca-45a6-a86f-64b68392177c"
      }) {
        newsfeedItem {
          id
          comments {
      		  comments {
              authorEid
              text
            }}
        }}
    }

    mutation createNewsfeedItemComment {
      createNewsfeedItemComment(input:{
        newsfeedItemId:"d981c6f5-baca-45a6-a86f-64b68392177c",
        text:"my comment"
      }) {
        comment {
          id
          collectionId
          text
          author {
     				name
          }
        }
      }
    }

### PUSH NOTIFICATIONS


    mutation sendRawPushNotification {
      sendRawPushNotification(input:{
         playerEid:"user/4a9f85fb-3920-404c-91dc-60959c5c332b",
         rawPayload:{
          notification:{
            title:"rob test",
            body:"testing abcde7..."
          }
        }
      }) {
        result 
      }
    }

    mutation sendRawPushNotificationMe {
      sendRawPushNotification(input:{
         playerEid:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a",
         rawPayload:{
          notification:{
            title:"rob test",
            body:"testing abcde8..."
          }
        }
      }) {
        result 
      }
    }

    mutation sendRawPushNotificationSilent {
      sendRawPushNotification(input:{
         playerEid:"user/4a9f85fb-3920-404c-91dc-60959c5c332b",
         rawPayload:{
          data:{
            hello:"world",
          },
          apns:{
            payload:{
              aps:{
                contentAvailable:true
              }
            }
          }
        }
      }) {
        result 
      }
    }

    mutation sendRawPushNotificationJson {
      sendRawPushNotification(input:{
         playerEid:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a",
         #rawPayloadJson:"{ \"data\":{ \"hello\":\"world\" }, \"apns\":{ \"payload\":{ \"aps\":{ \"content-available\":true } } } }"
         rawPayloadJson:"{ \"notification\":{ \"title\":\"rob test\", \"body\":\"testing abcde9...\" } }"
      }) {
        result 
      }
    }

         # playerEid:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a",