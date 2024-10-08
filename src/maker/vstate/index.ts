import _ from 'lodash'
import { BeforeEnterAsset } from 'src/enginev3/types'
import { ReactNativeAnimations } from 'src/maker/animations'
import { AnimationType, ConcurrentEffectGroup, EffectType, EntityScope, SequenceEffectItem, SoundType, SourceType, VibrationType, NativeAnimations } from 'src/gql-types'
import { sleep } from 'src/maker/async_utils'
import { NodeApi, TileMetadata } from 'src/maker/types'
import { toPublicUrl, isAbsolute } from 'src/services/aws'
import { defaultsDeep, isKeyOf, keysOf, isColor } from 'src/utils/misc'
import { NativeAnimationId, nativeAnimations } from 'src/domain/nativeAnimations'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('vstates', 'VStates')

const LAYERS_PREFIX = 'layers'

// Represents a combination of assets to display "visual" state
export interface VState {
  // Layers
  underlay?: string
  background?: string
  avatar?: string
  foreground?: string
  overlay?: string
  // Other props
  sfx?: string
  animation?: keyof typeof ReactNativeAnimations | keyof typeof NativeAnimations | NativeAnimationId | ''
  duration?: number
  loop?: boolean
  vibration?: number
  fullscreen?: boolean
}

const ZINDEXES: Record<keyof Omit<VState, 'loop' | 'sfx' | 'animation' | 'duration' | 'vibration' | 'fullscreen'>, number> = {
  underlay: -20,
  background: -10,
  avatar: 10,
  foreground: 20,
  overlay: 40,
}

export const setVState = (node: NodeApi, vstate: VState | VState[], privately = false): Promise<void> => {
  const vstates = _.isArray(vstate) ? vstate : [vstate]
  logger.info('Setting VStates to', node.getName(), ...vstates.map(logger.inspect))
  // For NPCs, show it to the user(s) in a chat room. For users and rooms, the state is global
  const scope = node.isUnObject() ? EntityScope.ChatRoomScope : (
    privately ? EntityScope.ChatRoomPrivateScope : EntityScope.GlobalScope
  )
  return node.saveEffect({
    type: EffectType.ConcurrentEffect,
    scope,
    metadata: { groups: vstates.map(vstateToEffectGroup) },
  })
    // If vstates have duration, wait the sum of them to resolve the promise to sync with the FE
    // TODO: This will likely go away soon since this practice is not encouraged
    .then(() => (
      sleep(vstates.reduce((accum, vstate) => (
        accum + (vstate.duration || 0)
      ), 0))
    ))
}

export const vstateToEffectGroup = (vstate: VState): ConcurrentEffectGroup => {
  const effects = keysOf(vstate).map(key => createEffect(key, vstate)).filter(val => !!val)
  return { duration: vstate.duration, effects }
}

const imageRegex = /\.(jpe?g|png|gif)/i

export const vstateToAssets = (vstate: VState): BeforeEnterAsset[] => {
  // Gather all the values in the vstate, skip the numbers. Let beforeEnter filter properly
  return Object.values(vstate).filter(val => !!val && _.isString(val)).map(val => (
    // Relative images (s3Key) need to be mapped to imgix
    imageRegex.test(val) && !isAbsolute(val) ? { s3Key: val } : val
  ))
}

const createEffect = (key: keyof VState, vstate: VState): SequenceEffectItem | null => {
  // undefined/missing means we should ignore them
  // Ignore the duration, we use it as part of other keys
  if (vstate[key] === undefined || key === 'duration') {
    return null
  }
  if (isKeyOf(key, ZINDEXES)) {
    const { fullscreen } = vstate
    const defaults: TileMetadata = {
      name: `${LAYERS_PREFIX}.${key}`,
      containerStyle: { top: 0, left: 0, height: 100, width: 100, backgroundColor: 'transparent', fullscreen, zIndex: ZINDEXES[key] },
      // Clear properties from other types since tiles might change type and makerApi merges & upserts the metadata
      text: null, animation: null, image: null,
    }
    return {
      type: EffectType.TileEffect,
      metadata: defaultsDeep(createTileEffect(vstate[key], vstate), defaults),
    }
  }
  if (key === 'animation') {
    const anim = vstate.animation
    // TODO: this needs to be refactored soon, it's a mess (move to the resolver or delete as a whole)
    const animationType = NativeAnimations[anim] && AnimationType.NativeAnimation ||
      nativeAnimations[anim] && AnimationType.SpriteAnimation ||
      ReactNativeAnimations[anim] && AnimationType.NativeAnimatableAnimation || AnimationType.SourcedAnimation
    return {
      type: EffectType.AnimationEffect,
      metadata: {
        tileName: `${LAYERS_PREFIX}.avatar`,
        animationType,
        // This can be "" to cancel a previous animation
        animation: NativeAnimations[anim] || ReactNativeAnimations[anim] || (anim && undefined),
        animationTemplate: isKeyOf(anim, nativeAnimations) ? anim : undefined,
        duration: vstate.duration,
        loop: !!vstate.loop,
      },
    }
  }
  if (key === 'sfx' && vstate.sfx) {
    // TODO: If they ever loop, we need to handle cancellation here if ""
    return {
      type: EffectType.SoundEffect,
      metadata: {
        soundType: SoundType.SourcedSound,
        sourceUri: toPublicUrl(vstate.sfx),
      },
    }
  }
  if (key === 'vibration' && vstate.vibration) {
    return {
      type: EffectType.VibrationEffect,
      metadata: {
        vibrationType: VibrationType.Default,
        duration: vstate.vibration,
      },
    }
  }
  return null
}

const createTileEffect = (source: string, vstate: VState): Partial<TileMetadata> => {
  if (source.includes('.json')) {
    // Lottie file
    return {
      animation: {
        animationType: AnimationType.SourcedAnimation,
        sourceType: SourceType.Lottie,
        sourceUri: toPublicUrl(source),
        duration: vstate.duration,
        loopForMs: vstate.loop ? vstate.duration : undefined,
        loop: !!vstate.loop,
      },
    }
  }
  // Static image
  if (imageRegex.test(source)) {
    return { image: isAbsolute(source) ? { uri: source } : { s3Key: source }}
  }
  // Color
  if (isColor(source)) {
    return { containerStyle: { backgroundColor: source, fullscreen: true } }
  }
  // Text/Emoji
  if (source) {
    return {
      text: source,
      textStyle: {
        color: 'white',
        fontSize: 100,
        textAlign: 'center',
      },
      containerStyle: { top: -10 },
    }
  }
  // Send the smallest payload for a deleted tile 
  return {}
}
