import { BeforeEnterAsset } from 'src/enginev3'
import { deepFreeze } from '../../../../utils/misc'
import { ChatRoomActionContextApi, TileTemplate, HandlebarsValues } from '../../../types'
import { Config, PrizeInput, InteractiveItem } from './types'
import { items, ItemName, Item } from 'src/domain/items'
import { AppLogger, LoggerFactory } from 'src/utils/logger'
import { misc } from 'src/utils'
import { NPCId } from 'src/domain/npcs'
import { DurationInputObject } from 'moment'
import { incCounter, getCounter, resetCounter } from 'src/maker/counters'
import { vstateToAssets } from 'src/maker/vstate'
import vstates from 'src/maker/vstate/states'
import { Move, moves } from 'src/domain/moves'
import { stringValueLens, itemFieldTemplate } from './assets'
import _ from 'lodash'
import { Asset } from 'src/domain/assets'
import { StringTag } from 'src/domain/strings'

export default abstract class ExchangeNPC {

  private readonly config: Readonly<Config>
  protected readonly logger: AppLogger
  private readonly oldTiles: Asset[]
  protected readonly dropTileTemplate: TileTemplate

  public constructor(config: Config) {
    this.config = deepFreeze(config)
    this.logger = LoggerFactory(this.id, 'NPC')
  }

  protected get id(): NPCId {
    return this.config.npcId
  }

  protected onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    const assets = _.flatMap([vstates.pickable, vstates.pickup], vstateToAssets)
    return assets
  }

  protected incFrequentVisitorCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['frequentVisitorCounter']
    const resetIn: DurationInputObject = { minutes: 1 }
    return incCounter(room, keys, 1, resetIn)
  }

  protected incActionPerformedCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['actionPerformedCounter']
    return incCounter(room, keys, 1)
  }

  protected getActionPerformedCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['actionPerformedCounter']
    return getCounter(room, keys)
  }
  
  protected resetActionPerformedCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['actionPerformedCounter']
    return resetCounter(room, keys)
  }

  protected onExchangeAnimationFinished = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onExchangeAnimationFinished')
    return this.retreiveWin(api).then((prize) => {
      const item = items[prize as ItemName]
      return Promise.all([
        this.showString(api, 'rewarded', item),
        this.exchangeItem(api, item),
      ])
    })
  }

  protected showString = (api: ChatRoomActionContextApi, context: string, input?: InteractiveItem, options?: {mentioned?: boolean; counter?: number}) : Promise<any> => {
    let item: Item
    let move: Move
    if (input?.name in items) {
      item = input as Item
    } else if (input?.name in moves) {
      move = input as Move
    }
    const tags: StringTag[] = [this.id, 'target_actor']
    const opts: StringTag[] = []
    console.log('context', context)
    console.log('input', this.logger.inspect(input))
    console.log('options', options)
    const vals: HandlebarsValues = { item, move }
    // unify these strings in the calls to this function. It will simplify the code
    if(context === 'welcome') {
      tags.push('onroomentered')
    } else if(context === 'welcomeBack') {
      tags.push('onroomentered', 'gte_1')
    } else if(context === 'noInventory') {
      tags.push('inventory_mention', 'lte_0')
    } else if((context === 'offered') && input) {
      item && tags.push('inventory_mention')
    } else if((context === 'moveused') && input) {
      move && options?.mentioned && tags.push('onmovetriggered', move.name)
      options?.counter !== undefined && tags.push(options.counter)
    } else if((context === 'barmenu') && input) {
      move && options?.mentioned && tags.push('onmovetriggered', 'm2m', move.name)
    } else if(context === 'rewarded') {
      tags.push('rewarded')
      if(input && options?.mentioned) {
        tags.push(input.name)
      }
    } else if(context === 'bar_closed') {
      tags.push('onnpcsessioncompleted', 'm2m')
    } else if(context === 'session_finished') {
      tags.push('onnpcsessioncompleted')
    } else if(context === 'smoking') {
      tags.push('good_vibes')           // temp tag, no access to generic tags
    } else if(context === 'stoned') {
      tags.push('warning')           // temp tag, no access to generic tags
    } else if(context === 'reset') {
      tags.push('reset')
    }

    console.log('tags', this.logger.inspect(tags))
    console.log('opts', this.logger.inspect(opts))
    console.log('vals', this.logger.inspect(vals))
    
    return api.getActor().sendMessage({ tags, optional: opts, from: api.getUnObject(), values: vals })
  }

  protected doCelebration = (api: ChatRoomActionContextApi, input: PrizeInput) : Promise<any> => {
    const prize = this.getPrize(input)
    return prize ? Promise.all([
      this.persistWin(api, prize),
      api.getChatRoom().saveEffect(this.config.celebrationEffectTemplate(prize)),
    ]) : null
  }

  protected exchangeItem = (api: ChatRoomActionContextApi, input: Item) : Promise<any> => {
    return Promise.all([
      api.getChatRoom().saveEffect(this.config.prizeEffectTemplate(input)),
    ])
  }

  protected getPrize = (choices: PrizeInput) : Item => {
    const isRNG = this.config.prizes[0].chance !== undefined
    if(isRNG) {
      const rng = misc.randomInt(0, 100)
      const prize = _.find(_.orderBy(this.config.prizes, ['chance'], ['asc']), (option) => {
        return rng < option.chance
      })
      if(prize) {
        return prize.outItem  
      }
    } else {
      const prize = _.find(this.config.prizes, (option) => {
        return choices[0] == option.inItems[0] && choices[1] == option.inItems[1] ||
           choices[0] == option.inItems[1] && choices[1] == option.inItems[0]
      })
      if(prize) {
        return prize.outItem
      }
    }
  
    return null
  }

  protected createActionResolversFromMoves = (collection: Move[], fnCallback: (api: ChatRoomActionContextApi) => Promise<any>) : any => {
    return collection.map((move) => {
      return [move.name, fnCallback]
    })
  }
  
  protected persistWin = (api: ChatRoomActionContextApi, item: Item) : Promise<any> => {
    const prize = (item as Item).name
    return api.getChatRoom().saveField(stringValueLens.set(prize)(itemFieldTemplate))
  }
  
  protected retreiveWin = (api: ChatRoomActionContextApi): Promise<any> => {
    return api.getChatRoom().field(itemFieldTemplate)
      .then(stringValueLens.get)
      .then((storedItem) => {
        return storedItem
      })
  }
  
}
