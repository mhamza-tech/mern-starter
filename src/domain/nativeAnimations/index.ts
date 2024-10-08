import { SpriteAnimations } from 'src/gql-types'
import { NativeAnimation } from './types'
import { deepFreeze } from 'src/utils/misc'

export type NativeAnimationId = 'orbit_loop' | 'orbit_5' | 'explosion' | 'explosion_loop'

export const nativeAnimations = deepFreeze<Record<NativeAnimationId, NativeAnimation>>({
  explosion: {
    animation: SpriteAnimations.Explosion,
    loop: false,
    spriteSize: 10,
    iterationCount: 1,
    duration: 100,
    numberOfParticles: 30,
    emissionRate: 8,
    particleLife: 1500,
    direction: 30,
    gravity: 0.2,
    spread: 360,
  },
  explosion_loop: {
    animation: SpriteAnimations.Explosion,
    loop: true,
    spriteSize: 10,
    duration: 100,
    numberOfParticles: 30,
    emissionRate: 8,
    particleLife: 1500,
    direction: 30,
    gravity: 0.2,
    spread: 360,
  },
  orbit_loop: {
    animation: SpriteAnimations.Orbit,
    duration: 1000,
    loop: true,
    spriteSize: 10,
    radius: 1,
  },
  orbit_5: {
    animation: SpriteAnimations.Orbit,
    duration: 1000,
    iterationCount: 5,
    loop: false,
    spriteSize: 10,
    radius: 1,
  },
})
