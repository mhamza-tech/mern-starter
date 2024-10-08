import { AnimationEffectMetadata as Meta, SpriteAnimations } from 'src/gql-types'

// TODO: We need to unify the animatable ones, native and sprite animations into one thing. Lotties as its own thing

type Common = Required<Pick<Meta, 'duration' | 'loop' | 'spriteSize'>> & Pick<Meta, 'delay' | 'iterationCount'>

interface Orbit extends Common, Required<Pick<Meta, 'radius'>> {
  animation: SpriteAnimations.Orbit
}

interface Explosion extends Common, Pick<Meta, 'gravity' | 'numberOfParticles' | 'emissionRate' | 'particleLife' | 'direction' | 'spread'> {
  animation: SpriteAnimations.Explosion
}

export type NativeAnimation = Orbit | Explosion
