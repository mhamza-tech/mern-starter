import { VState } from './'
import { misc } from 'src/utils'
import { LottieLibrary } from 'src/maker/assets'
import { vstates } from './db'

// Util

export const noop = misc.deepFreeze<VState>({
})

export const clearState = misc.deepFreeze<VState>({
  background: '',
  // The avatar layer remains untouched
  avatar: undefined,
  foreground: '',
  animation: '',
  loop: false,
})

export const clearAction = misc.deepFreeze<VState>({
  underlay: '',
  overlay: '',
  animation: '',
  duration: 0,
})

export const clear = misc.deepFreeze<VState>({
  ...clearState,
  ...clearAction,
})

// States

export const victory = misc.deepFreeze<VState>({
  // overlay: LottieLibrary.confetti,
  sfx: 'sounds/victory1.mp3',
  loop: true,
})

export const defeat = misc.deepFreeze<VState>({
  sfx: 'sounds/defeat2.mp3',
  animation: 'Tada',
  loop: true,
})

export const confused = misc.deepFreeze<VState>({
  background: LottieLibrary.confused_bg,
  foreground: LottieLibrary.confused_fg,
  loop: true,
})

export const dizzy = misc.deepFreeze<VState>({
  background: LottieLibrary.dizzy_bg,
  foreground: LottieLibrary.dizzy_fg,
  loop: true,
  // Not looking great yet
  // animation: 'Dizzy',
})

export const ko = misc.deepFreeze<VState>({
  background: '',
  foreground: LottieLibrary.spinning_birds,
  loop: true,
})

export const buffed = misc.deepFreeze<VState>({
  background: LottieLibrary.buff_crown,
  foreground: '',
  sfx: '',
  loop: true,
})

export const pollenized = misc.deepFreeze<VState>({
  background: LottieLibrary.buff_pollen,
  foreground: '',
  loop: true,
})

export const pollenizedWithButterflies = misc.deepFreeze<VState>({
  ...pollenized,
  foreground: LottieLibrary.spinning_butterflies,
})

export const inLove = misc.deepFreeze<VState>({
  background: LottieLibrary.heart_particles,
  foreground: '',
  sfx: '',
  loop: true,
})

export const pickable = misc.deepFreeze<VState>({
  background: '',
  foreground: LottieLibrary.spinning_particles_small,
  loop: true,
})

export const overlayCogs = misc.deepFreeze<VState>({
  background: '',
  foreground: 'rgba(0, 0, 0, 0.7)',
  overlay: LottieLibrary.cogs,
  loop: true,
})

export const overlayCountdown = misc.deepFreeze<VState>({
  background: '',
  foreground: 'rgba(0, 0, 0, 0.7)',
  overlay: LottieLibrary.countdown_fullscreen,
  loop: true,
})

// Mood avatars

export const depressed = misc.deepFreeze<VState>({
  background: LottieLibrary.concentric_circles,
  loop: true,
})

export const sad = misc.deepFreeze<VState>({
  background: LottieLibrary.yellow_warp_glitter,
  loop: true,
})

export const happy = misc.deepFreeze<VState>({
  background: LottieLibrary.buff_crown,
  loop: true,
})

export const euphoric = misc.deepFreeze<VState>({
  background: LottieLibrary.heart_particles,
  loop: true,
})

// Actions

// TODO: Find a way to use these when x,y is needed, maybe setVState(tile, {...})
export const pickup = misc.deepFreeze<VState>({
  overlay: LottieLibrary.pickup,
  sfx: 'sounds/swoosh2.mp3',
  duration: 500,
})

// Re-export with the hand-made ones
export default { ...vstates, noop, clearState, clearAction, clear, victory, defeat, confused, dizzy, ko, buffed, pollenized, pollenizedWithButterflies, inLove, pickable, overlayCogs, overlayCountdown, depressed, sad, happy, euphoric, pickup }
