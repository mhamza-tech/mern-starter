import { REGISTER_ACTION_FN_MAP } from './metadata'
import { UnrealOnLoad, UnrealOnBeforeEnter } from './lifecycle'
import { mapS3KeyToPublicUrl } from 'src/services/aws'
import { registerReactionFnMap } from 'src/enginev3'
import { NPCId } from 'src/domain/npcs'

export interface UnrealRoomOrgOpts {
  readonly id: NPCId
  readonly assets?: string[]
}

export function UnrealChatroom(opts: UnrealRoomOrgOpts) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function UnrealNpcRoomFactory<TFunction extends { new(...args: any[]): {} }>(constructor: TFunction) {
    const fnMap = Reflect.getMetadata(REGISTER_ACTION_FN_MAP, constructor) || {}

    return class extends constructor implements UnrealOnBeforeEnter, UnrealOnLoad {

      constructor(...args: any[]) {
        super(...args)
      }

      unObjectId = opts.id || constructor.name as NPCId

      onBeforeEnter(): Promise<string[]> {
        const urls = (opts.assets || []).map(a => a.includes('http') ? a : mapS3KeyToPublicUrl(a))

        return Promise.resolve(urls)
      }

      onLoad(): Promise<any> {
        return registerReactionFnMap(this.unObjectId, fnMap)
      }

    }
  }
}
