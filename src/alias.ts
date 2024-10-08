// The purpose of this file is to keep typescript path aliases synced with the transpiled javascript code. 
// This allows runtime paths to be respected.

import { addAliases } from 'module-alias'
import * as tsconfig from './tsconfig.json'

function constructAlias(path: string): string {
  return __dirname + '/' + path.replace('.ts', '.js')
}

const aliasesToRegister = Object
  .keys(tsconfig.compilerOptions.paths)
  .reduce((acc, key) => {
    return {
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key]: constructAlias((tsconfig.compilerOptions.paths as any)[key][0]),
    }
  }, { src: __dirname })

addAliases(aliasesToRegister)
