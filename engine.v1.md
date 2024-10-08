
# State Machine Engine V1

V1 is used with UnObjects / Storylines created via YAML.

## Example: Psychadelic Mushroom

There's an example storyline in [src/storylines/PsychadelicMushroom.ts](src/storylines/PsychadelicMushroom.ts).

You can use this as a roadmap for building new storylines.  Scroll to the bottom of that file to see
the **resolverTable**.  This is the mapping from `'{state}.{action}'` to a resolver function.  This
designates which resolver will be called when the system is in this particular `{state}` and the 
user executes this particular `{action}`.

You can interact with the storyline via GraphQL.  

### Running locally

Install and start the server (see [README.md](README.md)), then visit the GraphQL console:

[http://localhost:3000/](http://localhost:3000/)

### Running in the cloud

There's a version of the server running here: [http://unre-envi-as6avybdpof.ubfxwyyyi3.us-west-2.elasticbeanstalk.com/](http://unre-envi-as6avybdpof.ubfxwyyyi3.us-west-2.elasticbeanstalk.com/)

*NOTE: everyone using the cloud version shares the same session state 
(it's a simple in-memory store at the moment).  You may want to reset the 
session state before you start.  See [Resetting the session state](#resetting-session-state)*

### Sanity check

As a sanity check you can "ping" the system to make sure it's working:

    query pingIt {
      ping {
        hello
      }
    }

You should get back the response:

    {
      "data": {
        "ping": {
          "hello": "world"
        }
      }
    }

### Now the fun stuff

Now let's run some actions against the storyline:

    mutation doAction {
      doAction(input: { unObjectId: 1, action: "eat" }) {
        card {
          text
          imageUrl
        }
      }
    }

You should get back the response:

    {
      "data": {
        "doAction": {
          "card": {
            "text": "You *ATE* a mushroom. But you don't feel any different. Wanna try that again?",
            "imageUrl": "https://blahblah.com"
          },
        }
      }
    }

*(Ignore that imageUrl, I put some mock data there).*


## doAction request and response

The **doAction request** contains:

* unObjectId 
    * storylines are indexed by unObjectId.  
    * in this case, unObjectId=1 is the unObjectId for the Psychadelic Mushroom
    * when you add new storylines you'll give them unique unObjectIds
* action 
    * the action performed by the user

The **doAction response** is what gets returned by resolver functions.  It contains:
 
* card - the next card to render
    * text - text to display
    * imageUrl - optional image url
    * (we'll expand on this as we allow for richer cards)
* session 
    * (see next section)


## Session state 

On the backend, resolvers have access to the **session state**, where they can
keep track of things like how many times the user has "eat"-en the mushroom.

You can view the session state by adding it to the graphql response:

    mutation doAction {
      doAction(input: { unObjectId: 1, action: "eat" }) {
        card {
          text
          imageUrl
        }
        session {
          state
          action
          stateActionHistory
        }
      }
    }

The session data will be included in the response:

    {
      "data": {
        "doAction": {
          "card": {
            "text": "You *ATE MORE* mushrooms. You're getting high! Colors look brighter. The air smells wonderful. Your dog is talking to you and you understand every word. He's dictating a grocery list to you.",
            "imageUrl": null
          },
          "session": {
            "state": "start",
            "action": "eat",
            "stateActionHistory": [
              "start.eat",
              "start.eat"
            ]
          }
        }
      }
    }

*(Aside: the term 'state' is getting overloaded a bit here.  In the context of '{state}.{action}'
we're talking about the storyline/FSM state, which is just a string.  Session state, on the
other hand, is an object with various pieces of session data hanging off of it.  Sry for the confusion.
[Naming things is hard...](https://martinfowler.com/bliki/TwoHardThings.html))*


On the backend, here's an example resolver that uses the state to check the number of
times the user has eaten the mushroom and returns different cards for the first, second, 
and third+ times. 

    function startEating( props:Props ): NextProps {
        switch (props.session.actionCounts['start.eat']) {
            case 1: return firstEat;
            case 2: return secondEat;
            default: return thirdEat;
        }
    }

Resolver functions are passed a **props** object that they can use to access the session state (among other things).  

The session state automatically keeps running counts on all actions. 
We'll eventually expand on what else we want to track.  Right now it's just the action counts.


<a name="resetting-session-state"></a>
## Resetting the session state

You can **reset** the session state with a graphql request: 

    mutation reset {
      reset(unObjectId:1) {
        state
        action
        stateActionHistory
      }
    }

It returns the empty session: 

    {
      "data": {
        "reset": {
          "state": "start",
          "action": "start",
          "stateActionHistory": []
        }
      }
    }

All your session counters are reset.  Go ahead and start eating the mushroom again.



## Adding a New Storyline

### 1. Create the storyline's code module

You create a new storyline by first creating a file similar to PsychadelicMushroom.ts (probably easiest
to copy+paste and go from there).

This file must export a **Storyline** object.  For example from PsychadelicMushroom.ts:

    const storyline: Storyline = {
        unObjectId: 1,  // NOTE: this must be unique for each storyline
        name: 'The Psychadelic Mushroom',
        text: "Hi! I'm the Psychadelic Mushroom.  Let me take you on an unreal journey",
        resolverTable: resolverTable,
    };

    export default storyline;

The file will consist of primarily two things:

1. the resolvers that describe the various states and cards for the storyline
2. the resolver table, which maps `{state}.{action}` to resolver


### 2. Register the storyline in src/engine/resolvers.ts

You have to update code in two spots in [src/engine/resolvers.ts](src/engine/resolvers.ts):

1. import your storyline code module
2. add it to the storylines array

Look for `@LIZ` comments to guide you.  

This is very hack-ish of course but good enough for now. Eventually we'll tie all this together 
more formally with the database and a proper front-end.


## Resolver functions

A resolver function can be either:

1. a function that returns a NextProps object
2. a static NextProps object (i.e. not a function)

You can use #2 if you're just returning static content and don't need to check
session state or write any code.  "fourthEat" in PsychadelicMushroom.ts is an example
of this.


## The Code

The state machine code is located in [src/engine](src/engine).

* engine.ts - contains the engine.doAction entry point that is called from the GraphQL Action resolver
* resolvers.ts - code for mapping an action to a resolver
* sessions.ts - code for maintaining session state
* types.ts - the typescript types


## GraphQL API

[README.md#graphql](README.md#graphql)

