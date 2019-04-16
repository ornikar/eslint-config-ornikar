'use strict';

const fs = require('fs');
const path = require('path');

const useTypescript = fs.existsSync(path.resolve('tsconfig.json'));

module.exports = {
  cacheDirectory: './node_modules/.cache/jest',
  testMatch: [
    `<rootDir>/src/**/__tests__/**/*.${useTypescript ? 'ts?(x)' : 'js'}`,
    `<rootDir>/src/**/*.test.${useTypescript ? 'ts?(x)' : 'js'}`,
  ],
  setupFilesAfterEnv: [
    require.resolve('./test-setup-framework.js'),
    require.resolve('./test-shim.js'),
    require.resolve('./global-mocks.js'),
  ],
  setupFiles: ['<rootDir>/test-setup.js'],
};
