/**
 * @rob4lderman
 * sep2019
 */

import Joi, { Schema, string } from '@hapi/joi'

const parseAndThrowJoiError = (result: any): void => {
  if (!!!result.error) {
    return
  }
  throw result.error
}

export const validate = <T>(input: T, schema: Schema): T => {
  const result = schema.validate(input)
  parseAndThrowJoiError(result)
  return input
}

export const buildEmptyOrNullStringValidator = (): Joi.StringSchema => string().valid('').allow(null)

export const buildOptionalStringValidator = (): Joi.StringSchema[] => [
  buildEmptyOrNullStringValidator(),
  string(),
]

// js/typescript enums: http://www.typescriptlang.org/play/#code/KYOwrgtgBAcpBGwBOBnKBvKAvZB7ANFLiMIQC4DuBUZAFksKVAGa5hJQC+AsAFABuAQw4QAnnAiIOAXlgJkKAHTFgAbj6CANsjIAKCVJQBtMQeQBdAJTreWnfvmojAJis27SPWacAiOg2AfNw1tTwdJBUVWdmsQ+wB5eAArYABjMkUAa2BRFHDDS1jeUEhYQQhgNEwcJFwoWQByGtwGwhV6qAaVBq5VIA
export const buildEnumSchema = (e: any): Joi.StringSchema => string().valid(...Object.values(e))

// const eidRegex = /^[a-z]+\/[\w-]{36}$/;
const eidRegex = /^[a-z]+\/[\w-.]+$/
export const buildEidSchema = (): Joi.StringSchema => string().lowercase().regex(eidRegex)
