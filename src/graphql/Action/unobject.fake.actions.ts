// TODO: Temporary map to support website rendering
// This is all mostly throw away code until we figure out a deterministic 
// way to annote "priamry" actions to display on the website

import { mapS3KeyToImgixImageUrl } from '../models'
import { items } from 'src/domain/items'

export interface IFakeActionInfoSummary {
  readonly name: string
  readonly image: string
  readonly text?: string
  readonly description?: string
  readonly backgroundColor?: string
}

export interface IFakeActionWrapper {
  actions: IFakeActionInfoSummary[]
}

export interface IFakeActionMap {
  [key: string]: IFakeActionWrapper
}

const PickAction = { name: 'action.generator.pick', image: 'action/color/pickup.png', text: 'Pick' }
const SlapAction = { name: 'action.beat.slap', image: 'action/color/slap.png', text: 'Slap' }
const AnvilAction = { name: 'action.beat.anvil', image: 'action/color/anvil_1.png', text: 'Throw an anvil' }
const PetAction = { name: 'action.beat.pet', image: 'action/color/pet.v2.png', text: 'Pet' }
const ScratchAction = { name: 'action.beat.scratch', image: 'action/color/scratch.png', text: 'Scratch' }
const CrafterActions = [
  items.tiger_milk_110,
  items.tea_leaves_109,
  items.coconut_25,
  items.patty_100,
  items.avocado_9,
].map(({ name, s3Key, text }) => ({ name, image: s3Key, text }))

export const UnobjectPrimaryActionsMap: IFakeActionMap = {
  '35': {
    actions: [],
  },
  '36': {
    actions: [],
  },
  38: {
    actions: [],
  },
  39: {
    actions: [],
  },
  51: {
    actions: [],
  },
  52: {
    actions: [],
  },
  53: {
    actions: [],
  },
  54: { // Donnie Doll
    actions: [],
  },
  55: { // Doctor Spacemen
    actions: [],
  },
  56: {
    actions: [],
  },
  57: {
    actions: [],
  },
  58: {
    actions: [],
  },
  59: {
    actions: [],
  },
  60: {
    actions: [],
  },
  61: {
    actions: [],
  },
  62: {
    actions: [],
  },
  63: {
    actions: [],
  },
  65: {
    actions: [],
  },
  66: {
    actions: [],
  },
  67: {
    actions: [],
  },
  69: {
    actions: [],
  },
  70: {
    actions: [],
  },
  71: {
    actions: [],
  },
  'test-object-001': {
    actions: [],
  },
  'hammock': {
    actions: [],
  },
  'fortuneteller': {
    actions: [],
  },
  'npc.jt.welcome.gnome': {
    actions: [],
  },
  'npc.jt.hairy.monster': {
    actions: [],
  },
  'npc.jt.blue.joe': {
    actions: [],
  },
  'casino.blackjack': {
    actions: [],
  },
  'npc.strawberrypatch': {
    actions: [],
  },
  'npc.jt.red.joe': {
    actions: [],
  },
  'npc.appletree': {
    actions: [],
  },
  'centralbank': {
    actions: [],
  },
  'safe': {
    actions: [],
  },
  'recycle_machine_1315': {
    actions: [],
  },
  'hollywood_producer_36': { actions: [SlapAction, AnvilAction] },
  'brett_the_creep_35': { actions: [SlapAction, AnvilAction] },
  'francois_40': { actions: [PetAction, ScratchAction] },
  'bentley_43': { actions: [PetAction, ScratchAction] },
  'chip_the_dog_14': { actions: [PetAction, ScratchAction] },
  'black_tea_plant_20': { actions: [PickAction] },
  'wheat_generator_113': { actions: [PickAction] },
  'coconut_generator_26': { actions: [PickAction] },
  'pearl_generator_105': { actions: [PickAction] },
  'tiger_mama_21': { actions: [PickAction] },
  'burner_phone_store_16': { actions: [PickAction] },
  'coachella_valley_24': { actions: [PickAction] },
  'meat_factory_77': { actions: [PickAction] },
  'avocado_tree_11': { actions: [PickAction] },
  'sponge_generator_95': { actions: [PickAction] },
  'flour_mill_63': { actions: CrafterActions },
  'barista_49': { actions: CrafterActions },
  'bakery_56': { actions: CrafterActions },
  'gourmet_table_45': { actions: CrafterActions },
  'boomer_home_90': { actions: CrafterActions },
  'helga_47': { actions: CrafterActions },
}

export const fallbackActions: IFakeActionInfoSummary[] = [
  { name: 'action.kiss', image: 'action/color/kiss.png' },
  { name: 'action.inspect', image: 'action/color/inspect.png' },
]

export function getUnObjectFakeActions(unobjectId: string): IFakeActionInfoSummary[] {
  const actions = (UnobjectPrimaryActionsMap[unobjectId] || {}).actions || []

  return actions.length ? actions : fallbackActions
}

export function getUnObjectFakeActionsWithImgixUrls(unobjectId: string): IFakeActionInfoSummary[] {
  return getUnObjectFakeActions(unobjectId).map(a => ({ ...a, image: mapS3KeyToImgixImageUrl(a.image) }))
}
