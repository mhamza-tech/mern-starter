import { User } from 'src/db/entity'

export type FakeUser = Pick<User, 'id' | 'displayName' | 'username' | 'email' | 'gender' | 'birthday' | 'bio' | 'password' | 'signedUpAt' | 's3Key' | 'hasCompletedSignup' | 'isVerifiedAccount' | 'isConfirmed' >
