'use strict'

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  diff: true,
  reporter: 'spec',
  slow: 75,
  timeout: 10000,
  ui: 'bdd',
  color: true,
  file: ['./src/test/setup.ts', './src/test/teardown.ts'],
  spec: [
    './src/graphql/Root/root.test.ts',
    './src/test/test.ts',
  ],
}
