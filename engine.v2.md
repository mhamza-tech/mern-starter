
# State Machine Engine V2 - 2019-09-10

V2 is used with UnObjects / Storyboards that are created via the Maker Page.


## Building an UnObject / Storyboard

There are three backend entities involved in this process:

1. the UnObject - i.e. the image + name + caption text that appears at the top of the object page
2. the Storyboard - a set of Actions knitted together to make an interactive story
3. the Actions - an Action consists of a button that the player clicks along with the card that renders in response

An UnObject can have many Storyboards, but only ONE Storyboard is ever in the "published" state.
The published Storyboard is the one that users see and interact with when they visit the UnObject's public page.
The other Storyboards are maintained for version history and for un-published editing/previewing.

The making process involves two steps:

1. Creating the UnObject
2. Creating the Storyboard + Actions

#### 1. Creating the UnObject

The UnObject is created / updated via the `createUnObject` / `updateUnObject` GQL APIs.

    mutation createUnObject {
      createUnObject(input:{
        name:"myname",
        text:"mytext",
        entryId: "some-entry-id-from-contentful"
      }) {
        ...unObjectFragment
      }
    }

    mutation updateUnObject {
      updateUnObject(input:{
        id:"20a95ae3-6eb1-4980-878a-e7e25b962cec",
        name:"mynewname",
        text:"mynewtext",
        emoji:"🚀"
      }) {
         ...unObjectFragment
      }
    }

**Note**: The `entryId` field refers to an entry in Contentful.  Images are uploaded to Contentful
via a backend API that isn't documented here (still under development).  The image upload
API will return the entryId to the frontend, and the frontend passes that entryId to
createUnObject.

#### 2. Creating the Storyboard + Actions

The Storyboard + Actions are created together via the `createStoryboard` GQL API.  

    mutation createStoryboard {
      createStoryboard(input:{
        unObjectId:"5",
        actions:[
          {
            startState:"start",
            buttonText:"Bite!",
            card:{
              text:"Hi im the card!"
            },
            endState:"1"
          }
        ]
      }) {
        ...storyboardFragment
      }
    }


**Note**: There is no "updateStoryboard".  Each version of the storyboard creates
a new Storyboard record on the backend, so we can maintain a full version history.
When the maker edits the card text for a particular action and clicks 'Save', the
frontend will call createStoryboard and pass in the entire storyboard.  The
response will contain new IDs for the Storyboard and all its Actions.


## Playing a Storyboard

By "playing" we mean a user arrives at the UnObject's page and starts clicking the buttons.

#### 1. Fetch the initial PlayerContext 

From a code perspective, playing a Storyboard involves first fetching the PlayerContext.  The PlayerContext
is tied to the userId+storyboardId (i.e. each user has their own PlayerContext per Storyboard). 
You can fetch the user's initial PlayerContext via the `storyboard` API (while logged in as the user).

    query storyboard {
      storyboard(input:{id:"cd90e973-18c6-478f-8d2a-885837a0ddfa"}) {
        myPlayerContext {
          actionStubs {
            id
            storyboardId
            buttonText
          }
        }
      }
    }

The PlayerContext contains several fields but I've highlighted the most important one above: `actionStubs`.
The actionStubs are the list of buttons to show to the player. 

#### 2. Playing an Action (i.e. clicking an actionStub button)

When a player clicks a button, the frontend will call `playAction` and pass in the actionStub (note that
the buttonText field is only needed by the frontend, so it doesn't need to be passed in playAction).

    mutation playAction {
      playAction(input:{
        id:"6a67d4f0-9832-4fa9-934d-1934e80fd100",
        storyboardId:"cd90e973-18c6-478f-8d2a-885837a0ddfa"
      }) {
        myPlayerContext {
          actionStubs {
            ...
          }
        }
        action {
          card {
            text
            entry
          }
        }
      }
    }


`playAction` returns the next PlayerContext (with the next set of actionStubs/buttons to display) along
with an `action` field that contains the `card` to render.  A card is typically some text and an optional `entry`
field, which refers to an image asset stored in Contentful.  The entry field is an un-typed JSON object.


