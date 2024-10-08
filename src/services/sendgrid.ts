/**
 * @rob4lderman
 * aug2019
 */

import sendgrid from '@sendgrid/mail'
import {
  SENDGRID_API_KEY,
  CONFIRM_EMAIL_URL,
  RESET_PASSWORD_URL,
  NODE_ENV,
} from '../env'
import _ from 'lodash'
import {
  sf,
  misc,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import { User } from '../db/entity'

const logger = LoggerFactory('sendgrid', 'SendGrid')

sendgrid.setApiKey(SENDGRID_API_KEY)

// const msg = {
//     to: 'test@example.com',
//     from: 'test@example.com',
//     subject: 'Sending with Twilio SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sendgrid.send(msg);
export const send = (msg: any): Promise<any> => {
  return Promise.resolve(sendgrid.send(msg))
    .then(sf.tap(result => logger.log('send', { msg, result })))
    .catch(sf.tap_throw(err => logger.error('ERROR: send', { msg, err })))
}

const DefaultMsg = {
  from: 'Unreal <notifications@unreal.fun>',
}

const DefaultFollowsConfirmationEmailMsg = {
  templateId: 'd-99650c2d1ffa43d881c07fa6c4e5913a',
}

const buildFollowsConfirmationEmailTemplate = (user: any, unObject: any): any => {
  return {
    objectName: unObject.name,
    objectImageUrl: misc.prefixHttps(unObject.imageUrl),
  }
}

const getUserEmail = (user: any): any => {
  return user.isAnonymous
    ? _.defaultTo(user.tempEmail, user.email)
    : user.email
}

export const sendFollowsConfirmationEmail = (user: any, unObject: any): Promise<any> => {
  logger.log('sendFollowsConfirmationEmail', { user, unObject })
  return send(
    _.extend(
      {},
      DefaultMsg,
      DefaultFollowsConfirmationEmailMsg,
      {
        to: getUserEmail(user),
        dynamic_template_data: buildFollowsConfirmationEmailTemplate(user, unObject),
      },
    ),
  )
}

const DefaultConfirmEmailMsg = {
  // from: 'Unreal Community <community@unreal.fun>',
  templateId: 'd-aa9e869e920e45da8bf08002316d40e1',
}

const DefaultResetPasswordMsg = {
  // from: 'Unreal Support <support@unreal.fun>',
  templateId: 'd-29037a3901b04b9c9ec1174f12ea05bf',
}

// -rx- const ROOT_AUTH_URL = 'https://auth-dev.unreal.fun';

const buildConfirmEmailLink = (user: User): string => {
  return _.replace(CONFIRM_EMAIL_URL, /{{\s*token\s*}}/, user.confirmEmailToken)
  // -rx- return `${ROOT_AUTH_URL}/confirm?i=${user.id}&t=${user.confirmEmailToken}`;
  // -rx- return `${ROOT_AUTH_URL}/confirm/${user.confirmEmailToken}`;
}

const buildConfirmEmailTemplate = (user: User): any => {
  return {
    verifyLink: buildConfirmEmailLink(user),
    username: user.username,
  }
}

export const sendConfirmEmail = (user: User): Promise<any> => {
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultConfirmEmailMsg,
    {
      to: user.email,
      dynamic_template_data: buildConfirmEmailTemplate(user),
    },
  ))
}

const buildResetPasswordLink = (user: User): string => {
  return _.replace(RESET_PASSWORD_URL, /{{\s*token\s*}}/, user.resetPasswordToken)
  // -rx- return `${ROOT_AUTH_URL}/resetpassword?i=${user.id}&t=${user.resetPasswordToken}`;
  // -rx- return `${ROOT_AUTH_URL}/resetpassword/${user.resetPasswordToken}`;
}

const buildResetPasswordTempate = (user: User): any => {
  return {
    resetPasswordLink: buildResetPasswordLink(user),
  }
}

export const sendResetPasswordEmail = (user: User): Promise<any> => {
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultResetPasswordMsg,
    {
      to: user.email,
      dynamic_template_data: buildResetPasswordTempate(user),
    },
  ))
}

const DefaultPreRegisterEmailMsg = {
  // from: 'Unreal Community <community@unreal.fun>',
  templateId: 'd-0382aa5e3c13439092baca547d837497',
}

export const sendPreRegisterEmail = (email: string): Promise<any> => {
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultPreRegisterEmailMsg,
    {
      to: email,
      bcc: 'support@unreal.fun',
    },
  ))
}

const DefaultUserReportedEmailMsg = {
  templateId: 'd-de3b2a232e914247be915328d607991b',
}

export const sendUserReportedEmail = (reporter: string, reported: string, reason: string): Promise<any> => {
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultUserReportedEmailMsg,
    {
      to: 'support@unreal.fun',
      dynamic_template_data: {
        reporter,
        reported,
        reason,
        environment: NODE_ENV,
      },
    },
  ))
}

const DefaultUsernameChangedEmailMsg = {
  templateId: 'd-2e6b4b9dab234c5fb42c259866990ff2',
}

export const sendUsernameChangedEmail = (email: string, username: string): Promise<any> => {
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultUsernameChangedEmailMsg,
    {
      to: email,
      dynamic_template_data: {
        username,
      },
    },
  ))
}

const DefaultPasswordChangedEmailMsg = {
  templateId: 'd-963f5808c1104c9da4f0242e0f748388',
}

export const sendPasswordChangedEmail = (email: string, username: string): Promise<any> => {
  const url = new URL(CONFIRM_EMAIL_URL)
  return send(_.extend(
    {},
    DefaultMsg,
    DefaultPasswordChangedEmailMsg,
    {
      to: email,
      dynamic_template_data: {
        username,
        site_url: url.hostname,
      },
    },
  ))
}
