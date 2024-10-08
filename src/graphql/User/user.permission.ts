import { Role } from 'src/gql-types'
import { keysOf } from 'src/utils/misc'

const roleLevel = {
  [Role.User]: 10,
  [Role.Tester]: 100,
  [Role.Maker]: 1000,
  [Role.Admin]: 10000,
}

export const hasPermission = (input: {
  userRole: Role
  targetRole: Role
}): boolean => {
  return roleLevel[input.userRole] >= roleLevel[input.targetRole]
}

export const allowedRoles = (role: Role): Role[] => {
  return keysOf(roleLevel).filter(r => roleLevel[r] <= roleLevel[role])
}
