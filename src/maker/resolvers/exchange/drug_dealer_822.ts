import { LoggerFactory, AppLogger } from 'src/utils/logger'
import { ChatRoomActionContextApi } from 'src/types'
import { incUserState } from 'src/maker/userStates'
import { items } from 'src/domain/items'
import { GeneratorConfig } from './mechanics/engine/types'
import { ReactionFnMap, BeforeEnterAsset } from 'src/enginev3/types'
import { registerReactionFnMap } from 'src/enginev3'
import { ActionResolver } from 'src/maker/types'
import { setVState, vstateToAssets } from 'src/maker/vstate'
import vstates from 'src/maker/vstate/states'
import { Engine } from './mechanics/engine/engine'
import { NPCId } from 'src/domain/npcs'
import _ from 'lodash'
import { Actions } from './common/types'
import { config } from './mechanics/configs/drug_dealer_822'

export const ID: NPCId = 'drug_dealer_822'

//const logger = LoggerFactory('JoseAlt', 'NPC')

class JoseNPC {

  public constructor(config: GeneratorConfig) {
    this.engine = new Engine(config)
    this.logger = LoggerFactory(ID, 'NPC')
  }

  private readonly logger: AppLogger
  private engine: Engine

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    const assets = _.flatMap([vstates.take_puff_of_smokable_item_104], vstateToAssets)
    const moves = await this.engine.onBeforeEnter()
    return [...assets, ...moves]
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

  private onSmokingJob = (api: ChatRoomActionContextApi): Promise<any> => {
    const room = api.getChatRoom()
    return this.engine.runJobCallback(api, 'smoking', (api): Promise<any> => {
      return Promise.all([
        incUserState(room, 'wasted_304', 20),
        setVState(room, items.regular_joint_696.effectVState!),
        this.engine.startJob(api, 'smoking'),
        this.engine.showString(api, 'job', { jobId: 'smoking' }),
      ])
    })
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [Actions.Smoking]: this.onSmokingJob,
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

const npc = new JoseNPC(config)

export default npc.createResolver()
