/**
 * @rob4lderman
 * oct2019
 * 
 */
import { admin } from './firebase'
import { sf } from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'

const logger = LoggerFactory('fcm', 'FCM')

export type FcmMessage = admin.messaging.Message;

export interface MessageInput {
  token: string
  badge?: number
  data: MessageData
  title?: string
  body?: string
}

export interface MessageData {
  [key: string]: string
}

/**
 * 
 * @param message 
 * @return response
 */
export function sendMulticast(message: admin.messaging.MulticastMessage): Promise<admin.messaging.BatchResponse> {
  return admin.messaging().sendMulticast(message)
    // response.successCount 
    // response.failureCount
    // response.responses.
    //      .success
    .then(sf.tap(response => logger.debug('sendMulticast', { message, response })))
    .catch(sf.tap_throw(err => logger.error('sendMulticast', { message, err })))
}

export function send(message: admin.messaging.Message): Promise<string> {
  return admin.messaging().send(message)
    // Response is a message ID string.
    .then(sf.tap(response => logger.debug('send', { message, aps: _.get(message, 'apns.payload.aps'), response })))
    .catch(sf.tap_throw(err => logger.debug('ERROR: send', { message, err })))
}

export function trySend(message: admin.messaging.Message): Promise<string> {
  return send(message)
    .then(msgId => `SUCCESS: msgId=${msgId}, token=${_.get(message, 'token')}`)
    .catch(err => `FAILED: error=${err.message}, token=${_.get(message, 'token')}`)
}

/**
 * Message type:
 * https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
 * 
 * apns.payload.aps: 
 * https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html#//apple_ref/doc/uid/TP40008194-CH17-SW1
 * 
 * apns:
 * https://firebase.google.com/docs/reference/admin/node/admin.messaging.ApnsConfig.html
 * 
 * @return admin.messaging.Message, to be passed to send()
 */
export const mapMessageInputToApnMessage = (s: MessageInput): admin.messaging.Message => {
  return {
    notification: {
      title: s.title,
      body: s.body,
    },
    data: s.data,
    token: s.token,
    apns: {
      payload: {
        aps: {
          // truncateAtWordEnd: true,
          badge: s.badge,
          sound: 'ping.aiff',
          contentAvailable: true,
        },
      },
    },
  }
}

/**
 * @return admin.messaging.Message, to be passed to send()
 */
export const mapMessageInputToSilentApnMessage = (s: MessageInput): admin.messaging.Message => {
  return {
    data: s.data,
    token: s.token,
    apns: {
      payload: {
        aps: {
          'content-available': true,
          badge: s.badge,
        },
      },
    },
  }
}

/**
 * @return admin.messaging.Message, to be passed to send()
 */
export const mapMessageInputToAndroidMessage = (s: MessageInput): admin.messaging.Message => {
  return {
    notification: {
      title: s.title,
      body: s.body,
    },
    data: s.data,
    token: s.token,
  }
}

/**
 * @return admin.messaging.Message, to be passed to send()
 */
export const mapMessageInputToSilentAndroidMessage = (s: MessageInput): admin.messaging.Message => {
  return {
    data: s.data,
    token: s.token,
  }
}

// -rx- export const sendApn = (s:Something) => {
// -rx-     if ( _.isEmpty( s.notification ) ) {
// -rx-         return sendSilentApn(s);
// -rx-     }
// -rx-     return send( mapSomethingToApnMessage(s) );
// -rx- };

// -rx- // https://stackoverflow.com/questions/37570200/firebase-silent-apns-notification
// -rx- export const sendSilentApn = (s:Something) => {
// -rx-     return send( mapSomethingToSilentApnMessage(s) );
// -rx- };

// -rx- export const sendNewChatContentAPN = async (
// -rx-   message: string,
// -rx-   deviceToken: string,
// -rx-   badgeCount: number,
// -rx-   payload: object,
// -rx- ) => {
// -rx-   // https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
// -rx-   const messageObj: admin.messaging.Message = {
// -rx-     notification: {
// -rx-       // title: 'Hello from FCM!!!',
// -rx-       body: message,
// -rx-       // Contains the URL of an image that is going to be downloaded on the
// -rx-       // device and displayed in a notification. JPEG, PNG, BMP have full
// -rx-       // support across platforms. Animated GIF and video only work on iOS. WebP
// -rx-       // and HEIF have varying levels of support across platforms and platform
// -rx-       // versions. Android has 1MB image size limit. Quota usage and
// -rx-       // implications/costs for hosting image on Firebase Storage:
// -rx-       // https://firebase.google.com/pricing
// -rx-       // image: 
// -rx-     },
// -rx-     data: { ...payload },
// -rx-     apns: {
// -rx-       payload: {
// -rx-         // https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html#//apple_ref/doc/uid/TP40008194-CH17-SW1
// -rx-         aps: {
// -rx-           // truncateAtWordEnd: true,
// -rx-           badge: badgeCount,
// -rx-           sound: 'ping.aiff',
// -rx-           contentAvailable: true,
// -rx-         },
// -rx-       },
// -rx-     },
// -rx-     token: deviceToken,
// -rx-   }
// -rx- 
// -rx-   try {
// -rx-     await admin
// -rx-       .messaging()
// -rx-       .send(messageObj)
// -rx-       .then(response => {
// -rx-         // Response is a message ID string.
// -rx-         // console.log(`FCM: Successfully sent APN message with badge:${badgeCount} and response:${response}`)
// -rx-         console.log(`FCM: SUCCESS sendNewChatContentAPN
// -rx-         message: ${message} 
// -rx-         deviceToken: ${deviceToken}
// -rx-         badgeCount: ${badgeCount}
// -rx-         payload: ${inspect(payload, false, 10)}
// -rx-         response: ${inspect(response, false, 10)}
// -rx-         `)
// -rx-       })
// -rx-       .catch(error => {
// -rx-         console.log(`FCM: ERROR sendNewChatContentAPN
// -rx-         message: ${message}
// -rx-         deviceToken: ${deviceToken}
// -rx-         badgeCount: ${badgeCount}
// -rx-         payload: ${inspect(payload, false, 10)}
// -rx-         error: ${inspect(error, false, 10)}
// -rx-         `)
// -rx-       })
// -rx-   } catch (error) {
// -rx-     console.log(`FCM: ERROR sendNewChatContentAPN
// -rx-     message: ${message}
// -rx-     deviceToken: ${deviceToken}
// -rx-     badgeCount: ${badgeCount}
// -rx-     payload: ${inspect(payload, false, 10)}
// -rx-     error: ${inspect(error, false, 10)}
// -rx-     `)
// -rx-   }
// -rx- }
// -rx- 
// -rx- export const sendSilentAPN = async (deviceToken: string, badgeCount: number, payload: object = {}) => {
// -rx-   const messageObj: admin.messaging.Message = {
// -rx-     data: { ...payload },
// -rx-     apns: {
// -rx-       payload: {
// -rx-         aps: {
// -rx-           badge: badgeCount,
// -rx-           contentAvailable: true,
// -rx-         },
// -rx-       },
// -rx-     },
// -rx-     token: deviceToken,
// -rx-   }
// -rx-   try {
// -rx-     await admin
// -rx-       .messaging()
// -rx-       .send(messageObj)
// -rx-       .then(response => {
// -rx-         // Response is a message ID string.
// -rx-         console.log(`FCM: SUCCESS sendSilentAPN
// -rx-         deviceToken: ${deviceToken}
// -rx-         badgeCount: ${badgeCount}
// -rx-         payload: ${inspect(payload, false, 10)}
// -rx-         response: ${inspect(response, false, 10)}
// -rx-         `)
// -rx-       })
// -rx-       .catch(error => {
// -rx-         console.log(`FCM: ERROR sendSilentAPN
// -rx-         deviceToken: ${deviceToken}
// -rx-         badgeCount: ${badgeCount}
// -rx-         payload: ${inspect(payload, false, 10)}
// -rx-         error: ${inspect(error, false, 10)}
// -rx-         `)
// -rx-       })
// -rx-   } catch (error) {
// -rx-     console.log(`FCM: ERROR sendSilentAPN
// -rx-     deviceToken: ${deviceToken}
// -rx-     badgeCount: ${badgeCount}
// -rx-     payload: ${inspect(payload, false, 10)}
// -rx-     error: ${inspect(error, false, 10)}
// -rx-     `)
// -rx-   }
// -rx- }
// -rx- 
