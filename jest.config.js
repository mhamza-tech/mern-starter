const tsConfig = './src/tsconfig.json'
const tsconfigJson = require(tsConfig)
const paths = tsconfigJson.compilerOptions.paths

const moduleNameMapper = Object.keys(paths).reduce((acc, curr) => {
  return curr === 'src/*'
    ? acc
    : { ...acc, [curr]: '<rootDir>/src/' + paths[curr].map(a => a.replace('./', '')) }
}, { '^(?!\/)src\/(.*)': '<rootDir>/src/$1' })

module.exports = {
  rootDir: '.',
  preset: 'ts-jest',
  testMatch: ['**/src/**/*.spec.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.(ts)',
  ],
  coveragePathIgnorePatterns: [
    '/vendor/',
  ],
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
  },
  moduleNameMapper,
  globals: {
    'ts-jest': {
      tsConfig,
    },
  },
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
}
