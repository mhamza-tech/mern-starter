import { LoggerFactory, AppLogger } from 'src/utils/logger'
import { ChatRoomActionContextApi } from 'src/types'
import { GeneratorConfig, NewsfeedConfig } from './mechanics/engine/types'
import { ReactionFnMap, BeforeEnterAsset } from 'src/enginev3/types'
import { registerReactionFnMap } from 'src/enginev3'
import { ActionResolver } from 'src/maker/types'
import { Engine } from './mechanics/engine/engine'
import { NPCId } from 'src/domain/npcs'
import { config } from './mechanics/configs/fortune_teller_branching_2034'
import { incUserState } from 'src/maker/userStates'
import { Actions } from './common/types'
import { misc } from 'src/utils'

export const ID: NPCId = 'fortune_teller_branching_2034'

//const logger = LoggerFactory('JoseAlt', 'NPC')

class FortuneTellerBranching {

  public constructor(config: GeneratorConfig) {
    this.engine = new Engine(config)
    this.logger = LoggerFactory(ID, 'NPC')
  }

  private readonly logger: AppLogger
  private engine: Engine

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    return this.engine.onBeforeEnter()
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onEnter')
    return Promise.all([
      this.engine.onEnter(api),
    ])
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    return Promise.all([
      this.engine.onReset(api),
    ])
  }
 
  private onCursedInjuredJob = (api: ChatRoomActionContextApi): Promise<any> => {
    console.log('onCursedInjuredJob Callback executing...')
    return this.engine.runJobCallback(api, 'cursedInjured', (): Promise<any> => {
      const config = misc.deepFreeze<NewsfeedConfig>({
        context: 'future-complete',
        contextId: 'injured_876',
        debug: 'Broadcasting scheduled job complete - cursed / Injured',
        stringTags: ['target_actor', 'news', 'fortune_teller_branching_2034', 'cursed', 'injured_876', 'complete'],
        backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
      })
      return Promise.all([
        incUserState(api.getActor(), 'injured_876', 100),
        this.engine.postToNewsfeed(api, config),
      ])
    })
  }
  
  private onBlessedDesiredJob = (api: ChatRoomActionContextApi): Promise<any> => {
    console.log('onBlessedDesiredJob Callback executing...')
    return this.engine.runJobCallback(api, 'blessedDesired', (): Promise<any> => {
      const config = misc.deepFreeze<NewsfeedConfig>({
        context: 'future-complete',
        contextId: 'desired_33',
        debug: 'Broadcasting scheduled job complete - blessing / desired',
        stringTags: ['target_actor', 'news', 'fortune_teller_branching_2034', 'blessed', 'desired_33', 'complete'],
        backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
      })
      return Promise.all([
        incUserState(api.getActor(), 'desired_33', 100),
        this.engine.postToNewsfeed(api, config),
      ])
    })
  }

  private onBlessedLuckJob = (api: ChatRoomActionContextApi): Promise<any> => {
    console.log('onBlessedLuckJob Callback executing...')
    return this.engine.runJobCallback(api, 'blessedLuck', (): Promise<any> => {
      const config = misc.deepFreeze<NewsfeedConfig>({
        context: 'future-complete',
        contextId: 'lucky_2121',
        debug: 'Broadcasting scheduled job complete - blessing / lucky',
        stringTags: ['target_actor', 'news', 'fortune_teller_branching_2034', 'blessed', 'lucky_2121', 'complete'],
        backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
      })
      return Promise.all([
        incUserState(api.getActor(), 'lucky_2121', 100),
        this.engine.postToNewsfeed(api, config),
      ])
    })
  }

  private onCursedLuckJob = (api: ChatRoomActionContextApi): Promise<any> => {
    console.log('onCursedLuckJob Callback executing...')
    return this.engine.runJobCallback(api, 'cursedLuck', (): Promise<any> => {
      const config = misc.deepFreeze<NewsfeedConfig>({
        context: 'future-complete',
        contextId: 'lucky_2121',
        debug: 'Broadcasting scheduled job complete - cursed / lucky',
        stringTags: ['target_actor', 'news', 'fortune_teller_branching_2034', 'cursed', 'lucky_2121', 'complete'],
        backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
      })
      return Promise.all([
        incUserState(api.getActor(), 'lucky_2121', 0),
        this.engine.postToNewsfeed(api, config),
      ])
    })
  }

  private onCursedDesireJob = (api: ChatRoomActionContextApi): Promise<any> => {
    console.log('onCursedDesireJob Callback executing...')
    return this.engine.runJobCallback(api, 'cursedDesire', (): Promise<any> => {
      const config = misc.deepFreeze<NewsfeedConfig>({
        context: 'future-complete',
        contextId: 'desired_33',
        debug: 'Broadcasting scheduled job complete - cursed / desired',
        stringTags: ['target_actor', 'news', 'fortune_teller_branching_2034', 'cursed', 'desired_33', 'complete'],
        backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
      })
      return Promise.all([
        incUserState(api.getActor(), 'desired_33', 0),
        this.engine.postToNewsfeed(api, config),
      ])
    })
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [Actions.CursedInjured]: this.onCursedInjuredJob,
      [Actions.CursedLuck]: this.onCursedLuckJob,
      [Actions.CursedDesire]: this.onCursedDesireJob,
      [Actions.BlessedDesired]: this.onBlessedDesiredJob,
      [Actions.BlessedLuck]: this.onBlessedLuckJob,
    }
    this.engine.registerInteractions(reactions)
    return registerReactionFnMap(ID, reactions)
  }

  public createResolver = (): ActionResolver => {
    return {
      unObjectId: ID,
      onEnter: this.onEnter,
      onLoad: this.registerReactionFns,
      onReset: this.onReset,
      onBeforeEnter: this.onBeforeEnter,
    }
  }

}

const npc = new FortuneTellerBranching(config)

export default npc.createResolver()
