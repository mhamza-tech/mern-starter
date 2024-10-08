import _ from 'lodash'
import { strings, StringTag, StringTags } from 'src/domain/strings'
import { StringRow } from 'src/domain/strings/types'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('strings', 'Strings')

const matches = (row: StringRow<string>, tag: StringTag): boolean => {
  // For simplicity accept numbers as tags, but stringify them here for proper comparison
  const sTag = _.isNumber(tag) ? String(tag) : tag
  return row.tags.includes(sTag)
}

export const lookupString = (tags: StringTags, optional?: StringTags): string | undefined => {
  // TODO: This logic needs to be more sophisticated but this works for now
  let candidates = strings.filter(row => (
    tags.every(tag => matches(row, tag))
  ))

  if (optional) {
    // If any candidate matches an optional one, give it priority
    const preferred = candidates.filter(row => (
      optional.some(tag => matches(row, tag))
    ))
    if (preferred.length) {
      candidates = preferred
    } else {
      // if optional tags are provided and none is matched, the matches have to be exact matches
      candidates = candidates.filter(row => row.tags.length === tags.length)
    }
  }

  logger.debug(logger.inspect(tags), 'and', logger.inspect(optional), `yielded ${candidates.length} matches`)
  if (!candidates.length) {
    logger.warn(logger.inspect(tags), 'and', logger.inspect(optional), 'matched no string in the database')
  }
  return _.sample(candidates.map(row => row.string))
}
