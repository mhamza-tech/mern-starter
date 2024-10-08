import { TileTemplate, NewsfeedItemTemplate } from '../types'
import { sf, misc } from '../../utils'
import {
  TileType,
  EntityScope,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import { SYSTEM_USER_EID } from 'src/env'

export const statusTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.centralbank.status',
  type: TileType.TextTile,
  scope: EntityScope.ChatRoomPrivateScope,
  metadata: {
    // text: '',
    containerStyle: {
      backgroundColor: 'transparent',
      top: 27,
      left: 2,
      height: 75,
      width: 40,
      zIndex: 9,
    },
    textStyle: {
      color: 'black',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      alignSelf: null,
    },
  },
})

export const initialNewsFeedTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    statusText:
      'I just opened up a savings account at the Unreal Central Bank!',
  },
})

export const interestNewsFeedTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  rateId: null,
  rateLimit: { days: 1 },
  fromEid: SYSTEM_USER_EID,
  metadata: {
    statusText: null,
  },
})

export const noBalanceNewsFeedTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  rateId: null,
  rateLimit: { days: 1 },
  fromEid: SYSTEM_USER_EID,
  metadata: {
    statusText:
      'Your bank account has been empty for a while, you can deposit money and start earning interest again!',
  },
})

export const metadataTextLens = sf.lens('metadata.text')
