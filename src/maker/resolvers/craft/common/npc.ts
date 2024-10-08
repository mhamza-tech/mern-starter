import _ from 'lodash'
import moment from 'moment'
import { ImageLibrary } from 'src/maker/assets'
import { ReactionFnMap, registerReactionFnMap, BeforeEnterAsset } from 'src/enginev3'
import { deepFreeze, defaultsDeep, isKeyOf } from '../../../../utils/misc'
import * as ResetAction from '../../../reactions/action.debug.reset'
import { ActionResolver, ActionStubSet, ChatRoomActionContextApi, ActionXStub, TileTemplate } from 'src/maker/types'
import { incHashtribute, resetHashtribute } from '../../../hashtributes'
import { countdownField, inputTile, slotTile, cancelField, SLOT_PADDING, SLOT_MARGIN, gameStateField } from './assets'
import { Config, GameState, Recipe, JobArgs, Actions, GameStateData, NewsfeedConfig } from './types'
import * as stocks from './stocks'
import { LoggerFactory, AppLogger } from 'src/utils/logger'
import { promiseMap } from 'src/utils/sf.typed'
import { applyPadding } from 'src/maker/fxHelpers'
import { events } from 'src/events'
import { sft, misc } from 'src/utils'
import { sendNPCMessage } from 'src/maker/playerHelpers'
import { items, Item, ItemName } from 'src/domain/items'
import { NPCId } from 'src/domain/npcs'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import { DynamicFeedItemLayout, FeedItemActionEntityType, FeedItemActionType } from 'src/gql-types'
import { SYSTEM_USER_EID } from 'src/env'
import { StringTags } from 'src/domain/strings'
import { lookupString } from 'src/maker/strings'
import { delay } from 'src/utils/async_utils'

const NEWSFEED_DELAY = 8000
export default class CraftNPC {

  private readonly config: Readonly<Config>
  private readonly logger: AppLogger
  private readonly slotCount: number
  private readonly allInputs: ItemName[]
  private readonly useInventory: boolean

  public constructor(config: Config) {
    this.config = deepFreeze(config)
    this.logger = LoggerFactory(this.id, 'NPC')

    // Pre-calculate once
    this.slotCount = this.config.recipes.reduce((max, recipe) => (
      Math.max(max, this.recipeInputs(recipe).length)
    ), 0)
    this.allInputs = _.uniq(_.flatMap(this.config.recipes, this.recipeInputs))
    this.useInventory = this.config.npc.showBackpack
  }

  private get id(): NPCId {
    return this.config.npc.id
  }

  private recipeInputs = (recipe: Recipe): ItemName[] => {
    // NOTE: Everywhere in this NPC, "inputs" means a recipe's ingredients+tools
    return recipe.ingredients.concat(recipe.tools).map(item => item.name)
  }

  private findRecipe = (output?: Item | null): Recipe | undefined => {
    return this.config.recipes.find(recipe => recipe.output.name === output?.name)
  }

  private getItem = (name: string): Item => {
    if (!isKeyOf(name, items)) {
      throw new Error(`Invalid item name "${name}" received`)
    }
    return items[name]
  }

  private listItems = (names: string[]): string => {
    const texts = _.uniq(names).map(name => this.getItem(name).text)
    return misc.displayList(texts)
  }

  private getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
    return Promise
      .all([
        api.getChatRoom().field(gameStateField),
        this.useInventory ? api.getActor().readAllActionInstances() : [],
        api.getChatRoom().readAllActionInstances(),
      ])
      .then(([gameState, inventory, stored]): GameState => {
        const { outputName, finishAt } = gameState.metadata.state as GameStateData
        return { inventory, stored, output: outputName && this.getItem(outputName), finishAt }
      })
  }

  private makeStubs = (names: string[], enabled: { [name: string]: boolean }): ActionXStub[] => {
    return names.map((name): ActionXStub => ({
      actionName: name,
      isDisabled: !enabled[name],
      isUsable: false, isGivable: false,
    }))
  }

  private getActionStubs = (state: GameState): ActionStubSet => {
    const staticActionStubs: ActionXStub[] = []
    const enabled: { [name: string]: boolean } = {}

    if (state.output) {
      staticActionStubs.push({ actionName: Actions.Claim, disabledUntil: state.finishAt })
    }

    const inRoom = stocks.from(state.stored)
    for (const recipe of this.config.recipes) {
      const needed = stocks.from(this.recipeInputs(recipe))
      const missing = stocks.sub(needed, inRoom)
      if (stocks.isMissingAny(missing)) {
        // If the user deposited inputs not in the recipe
        continue
      }

      if (!stocks.isComplete(missing)) {
        // Enable items that can be added to finish recipes
        for (const name in missing) {
          enabled[name] = true
        }
      } else if (!state.output) {
        // Perfect match, let them cook
        staticActionStubs.push({ actionName: recipe.output.name, isUsable: true })
      }
    }
    if (this.useInventory) {
      // Show all (known) items, even if they are not ingredients
      // Keep the enabled ones first
      const actionInstanceStubs = this.makeStubs(Object.keys(items), enabled).sort((a, b) => !a.isDisabled && b.isDisabled ? -1 : 0)
      return { staticActionStubs, actionInstanceStubs }
    }
    if (staticActionStubs.length) {
      // When recipes are selectable, don't include (disabled) ingredients
      return { staticActionStubs }
    }
    
    return { staticActionStubs: this.makeStubs(this.allInputs, enabled) }
  }

  // TODO: Refactor to saveState() and split into setRecipe() and clearRecipe()
  private setRecipe = async (api: ChatRoomActionContextApi, output?: Item): Promise<any> => {
    const date = output && moment().add(output.creationTime).toDate()
    const gameState: GameStateData = { outputName: output?.name, finishAt: date?.toISOString() }
    await api.getChatRoom().saveField(defaultsDeep({
      isDeleted: !output, metadata: { state: gameState },
    }, gameStateField))

    if (!output) {
      return
    }
    if (!output.creationTime) {
      // Recipe is instantaneous (don't auto-claim it, we'll experiment)
      return delay(500).then(() => this.onClaim(api))
    }
    // Schedule the job to notify the user
    return Promise.all([
      api.scheduleJob<JobArgs>({
        id: `${api.getChatRoom().getId()}.${Actions.Ready}`,
        actionName: Actions.Ready,
        dispatchAt: date,
        args: { itemName: output.text },
      }),
      this.refresh(api),
    ])
  }

  private calculateLeft = (index: number): number => {
    // Keep the styling info in the template, do the math based off it
    const width = slotTile.metadata.containerStyle!.width! + SLOT_PADDING * 2
    const margin = SLOT_MARGIN
    const outer = width + margin * 2
    return Math.ceil((100 - outer * this.slotCount) / 2 + outer * index + margin)
  }

  private getDoableRecipes = (state: GameState): Recipe[] => {
    const inRoom = stocks.from(state.stored)
    return this.config.recipes.filter(recipe => {
      const needed = stocks.from(this.recipeInputs(recipe))
      return stocks.isComplete(stocks.sub(needed, inRoom))
    })
  }

  private makeSlots = (state: GameState): TileTemplate[] => {
    // FIXME: Once the NPC can fetch the list of tiles, we can make a more optimal solution
    // In case a room's slot count changes, we need to make sure extra slots are deleted
    // Assume more slots than needed but then delete the surplus
    const safeSlotCount = this.slotCount + 1
    const deposited = state.stored.length
    const { containerStyle } = slotTile.metadata
    return _.range(safeSlotCount).map((index) => {
      return defaultsDeep({
        name: `${slotTile.name}${index}`,
        isDeleted: index >= this.slotCount,
        metadata: {
          // Change the image depending on whether there is an item "in it"
          image: { s3Key: index < deposited ? ImageLibrary.SlotActive : ImageLibrary.SlotInactive },
          dropTarget: index === deposited,
          containerStyle: applyPadding({ ...containerStyle, left: this.calculateLeft(index) }, SLOT_PADDING),
        },
      }, slotTile)
    })
  }

  private getMessage = (state: GameState, stubs: ActionXStub[]): string | null => {
    if (state.stored.length === this.slotCount) {
      // User is ready to craft or crafting
      return null
    }

    const inInventory = stocks.from(state.inventory)
    const needed = stubs.filter(stub => !stub.isDisabled).map(stub => stub.actionName)
    if (!this.useInventory || needed.some(name => name in inInventory)) {
      // User has something to do
      return null
    }

    const last = _.last(state.stored)
    if (!last) {
      // At initial state
      return `Can’t do anything with what you have. Please get some ${this.listItems(needed)}.`
    }

    const lastText = this.getItem(last.actionName).text
    return `To use this ${lastText}, I need some ${this.listItems(needed)}.`
  }

  private updateUI = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const { output } = state
    // Auto-claim based on time, if we set on this new approach, this needs a bit of cleanup
    if (output && moment().isAfter(state.finishAt)) {
      return this.onClaim(api)
    }
    const canCancel = this.useInventory && !output && state.stored.length > 0
    const room = api.getChatRoom()
    const actionStubs = this.getActionStubs(state)
    // TODO: to cleanup, calculate usable items and provide both this and getActionStubs
    const message = this.getMessage(state, actionStubs.actionInstanceStubs || actionStubs.staticActionStubs!)
    return Promise.all([
      // Update the slots
      room.saveTiles(this.makeSlots(state)),
      // Update the state of the reset/cancel button in the UI
      room.saveField(defaultsDeep({ metadata: { isDisabled: !canCancel }}, cancelField)),
      // Update actions
      api.getActor().saveCurrentActionStubs(actionStubs),
      // If any, send a chat message
      message && sendNPCMessage(api, message),
      // Show a countdown timer
      room.saveField(defaultsDeep({
        isDeleted: moment().isAfter(state.finishAt),
        metadata: {
          text: output && `A new ${output.text} will be ready shortly`,
          image: { s3Key: output?.s3Key },
          expiryDateTime: state.finishAt,
        },
      }, countdownField)),
    ])
  }

  private postItemToNewsfeed = (api: ChatRoomActionContextApi, item: Item, config: NewsfeedConfig): Promise<any> => {
    const defaultTags: StringTags = ['news', 'target_actor', this.id, item.name]
    const text = lookupString(config.tags || defaultTags, config.optional || [])
    if(text) {
      const actor = api.getActor()
      return Promise.resolve(null)
        .then(() => {
          setTimeout(() => {
            api.saveNewsfeedItem({
              layout: DynamicFeedItemLayout.Dynamic1,
              userId: actor.getId(),
              fromEid: SYSTEM_USER_EID,
              context: { itemName: item.name, actorEid: actor.getEid() },
              rateId: `${this.id}.${actor.getEid()}.${item.name}`,
              rateLimit: { days: 1 },
              metadata: {
                backgroundColor: item.backgroundColor,
                image: { s3Key: item.s3Key },
                title: item.text,
                description: item.description,
                insetPlayerEid: api.getUnObject().getEid(),
                isNew: true,
                statusText: text,
                action: {
                  entityId: item.name,
                  entityType: FeedItemActionEntityType.Item,
                  type: FeedItemActionType.Backpack,
                },
              },
            })
          }, NEWSFEED_DELAY)
        })
    }
    return Promise.resolve(null)
  }

  private onItem = async (api: ChatRoomActionContextApi): Promise<any> => {
    const item = this.getItem(api.getCurrentActionName())
    this.logger.log('onItem', item.name)
    const room = api.getChatRoom()
    const state = await this.getState(api)

    let instance: SimpleActionXInstanceObject | undefined
    if (this.useInventory) {
      instance = state.inventory.find(({ actionName }) => actionName === item.name)
      if (!instance) return null
      // Transfer the item to the room
      await api.getActor().transferActionInstance({
        id: instance.id,
        transferToPlayerEid: room.getEid(),
      })
    } else {
      instance = await room.createActionInstance({ actionName: item.name })
    }
    // Add a new tile for the item
    // TODO: Move to updateUI, maybe make all Tiles Effects
    await room.saveTile(defaultsDeep({
      name: instance!.id,
      metadata: {
        image: { s3Key: item.s3Key },
        containerStyle: { left: this.calculateLeft(state.stored.length) },
      },
    }, inputTile))

    state.stored.push(instance)
    const recipes = this.getDoableRecipes(state)
    // If exactly one recipe is doable, skip the selection phase
    if (recipes.length === 1) {
      return this.setRecipe(api, recipes[0].output)
    }

    return this.refresh(api)
  }

  private onRecipe = (api: ChatRoomActionContextApi): Promise<any> => {
    const output = this.getItem(api.getCurrentActionName())
    return this.getState(api).then(state => {
      if (state.output) {
        // Already crafting
        return null
      }
      if (state.stored.length < this.slotCount) {
        // Handle the case of ingredients that are also final products
        return this.onItem(api)
      }
      // Start crafting
      this.logger.log('onRecipe', output.name)
      return this.setRecipe(api, output)
    })
  }

  private onClaim = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onClaim')
    const { hashtribute } = this.config.npc
    return this.getState(api).then(state => {
      const { output } = state
      const recipe = this.findRecipe(output)
      if (!output || !recipe) {
        return null
      }
      const actor = api.getActor()
      const room = api.getChatRoom()
      console.log('recipe', recipe)
      return Promise.all([
        // Award hashtribute points, add a small delay so they don't happen all at once
        hashtribute && incHashtribute(actor, hashtribute.id),
        // Clear the recipe
        this.setRecipe(api, undefined),
        // Delete all the items in slots
        room.saveTiles(
          state.stored.map(item => (
            defaultsDeep({ name: item.id, isDeleted: true }, inputTile)
          ))
        ),
        promiseMap(state.stored, (item) => {
          if (this.useInventory && recipe.tools.some(tool => tool.name === item.actionName)) {
            // Return tools to the user
            return room.transferActionInstance({
              id: item.id, transferToPlayerEid: actor.getEid(),
            })
          }
          // Delete ingredients
          return room.deleteActionInstance({ id: item.id })
        }),
        // Post an optional Newsfeed card
        recipe.newsfeed?.enabled && this.postItemToNewsfeed(api, output, recipe.newsfeed),
        // Trigger the completion of an NPC session
        events.npc.session.completed.notify({ api, success: true, item: output }),
      ])
    })
      .then(() => delay(4000)).then(() => this.onEnter(api))
  }

  private onReady = (api: ChatRoomActionContextApi): Promise<any> => {
    const { itemName } = api.getCurrentAction().args as JobArgs
    this.logger.log('onReady', itemName)
    const actor = api.getActor()
    return actor.sendPing()
      .then(() => this.refresh(api))
      .catch(() => actor.sendNotification({ title: 'Ready!', body: `Your ${itemName} is ready to be claimed!` }))
  }

  private refresh = (api: ChatRoomActionContextApi): Promise<any> => {
    // TODO: Maybe optimize this, we are reloading all the state a lot
    return this.getState(api).then(state => this.updateUI(api, state))
  }

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    // Gather all the items from recipes
    const itemList = _(this.config.recipes)
      .flatMapDeep(recipe => ([recipe.output, recipe.ingredients, recipe.tools]))
      .uniq().value()

    return [...itemList, { s3Key: ImageLibrary.SlotActive }, { s3Key: ImageLibrary.SlotInactive }]
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onEnter')
    return this.getState(api).then(state => {
      return this.updateUI(api, state).then(sft.tap(() => (
        // Track the start of a new NPC session
        !state.stored.length && events.npc.session.started.notify({ api })
      )))
    })
  }

  private onCancel = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onCancel')
    const room = api.getChatRoom()
    return this.getState(api)
      .then(state => Promise.all([
        // Clear the recipe
        this.setRecipe(api, undefined),
        // Delete all the slots
        room.saveTiles(
          state.stored.map(item =>
            defaultsDeep({ name: item.id, isDeleted: true }, inputTile)
          )
        ),
        promiseMap(state.stored, (item) => {
          if (this.useInventory) {
            // Return all the inputs to the user
            return room.transferActionInstance({
              id: item.id, transferToPlayerEid: api.getActor().getEid(),
            })
          }
          return room.deleteActionInstance({ id: item.id })
        }),
        // Track the reset of an NPC session
        events.npc.session.reset.notify({ api }),
      ]))
      .then(() => this.refresh(api))
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onReset')
    return this.onCancel(api)
      .then(() => this.getState(api))
      .then((state) => {
        // Reset the hashtribute value
        const promises: Promise<any>[] = []
        if (this.config.npc.hashtribute) {
          promises.push(resetHashtribute(api.getActor(), this.config.npc.hashtribute.id))
        }
        if (!this.useInventory) {
          return Promise.all(promises)
        }
        const inInventory = stocks.from(state.inventory)
        // Grant the needed ingredients to do all
        for (const recipe of this.config.recipes) {
          const needed = stocks.from(this.recipeInputs(recipe))
          const missing = stocks.sub(needed, inInventory)
          Object.keys(missing).forEach((name) => {
            for (let i = 0; i < missing[name]; i++) {
              promises.push(api.getActor().createActionInstance({ actionName: name }))
            }
          })
        }
        return Promise.all(promises)
      })
      .then(() => this.onEnter(api))
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [Actions.Claim]: this.onClaim,
      [Actions.Cancel]: this.onCancel,
      [Actions.Ready]: this.onReady,
    }
    for (const name of this.allInputs) {
      reactions[name] = this.onItem
    }
    for (const recipe of this.config.recipes) {
      reactions[recipe.output.name] = this.onRecipe
    }
    return registerReactionFnMap(this.id, reactions)
  }

  public createResolver = (): ActionResolver => {
    return {
      unObjectId: this.id,
      onEnter: this.onEnter,
      onLoad: this.registerReactionFns,
      onReset: this.onReset,
      onBeforeEnter: this.onBeforeEnter,
    }
  }

}
