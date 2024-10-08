import { FakeUser } from '../../src/domain/fakeUsers/types'
import * as util from './util'
import { SYSTEM_USER_EID } from '../../src/env'

const TABLE = 'Fake Users'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/fakeUsers/index.ts'

type Row = Omit<FakeUser, 'hasCompletedSignup' | 'isConfirmed'>

const defaults: Omit<FakeUser, keyof Row> = {
  isConfirmed: true,
  hasCompletedSignup: true,
}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  displayName: 'Display Name',
  email: 'Email',
  username: 'Username',
  gender: 'Gender',
  password: 'Password',
  birthday: 'Birthday',
  bio: 'Biography',
  s3Key: 'avatarImageId',
  signedUpAt: 'Signed Up',
  isVerifiedAccount: 'Is Verified',
}

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const data = util.indexBy(rows, 'id', (row): FakeUser => ({
    ...row,
    ...defaults,
    birthday: util.parseDate(row.birthday),
    signedUpAt: util.parseDate(row.signedUpAt),
    s3Key: util.ref('assets', row.s3Key, 's3Key'),
    gender: util.ref('Gender', row.gender),
  }))

  const systemId = SYSTEM_USER_EID.split('/').pop()!
  if (!(systemId in data)) {
    throw new Error(`System User not found in the list ("${systemId}")`)
  }

  const code = `import { FakeUser } from './types'
export * from './types'

const data = ${util.stringify(data)} as const

export const fakeUsers: (Record<keyof typeof data, FakeUser> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
