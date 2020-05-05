'use strict';

const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package.json'));
const workspaces = pkg.workspaces || false;
const isLernaRepo = Boolean(pkg.devDependencies && pkg.devDependencies.lerna);
const hasTypescript = Boolean(pkg.devDependencies && pkg.devDependencies.typescript);
const shouldGenerateTsconfigInLernaRepo = isLernaRepo && hasTypescript;

const getSrcDirectories = (srcDirectoryName = 'src') =>
  workspaces ? `{${workspaces.join(',')}}${srcDirectoryName && `/${srcDirectoryName}`}` : srcDirectoryName;

module.exports = function createLintStagedConfig(options = {}) {
  const srcExtensions = options.srcExtensions || ['js'];
  const srcDirectories = getSrcDirectories(options.srcDirectoryName);

  return {
    [`{yarn.lock,package.json${
      workspaces ? `,${workspaces.map((workspacePath) => `${workspacePath}/package.json`).join(',')}` : ''
    }}`]: (filenames) => {
      const packagejsonFilenames = filenames.filter((filename) => filename.endsWith('.json'));
      return [
        'yarn-update-lock',
        packagejsonFilenames.length === 0
          ? undefined
          : `prettier --parser json --write ${packagejsonFilenames.join(' ')}`,
        'git add yarn.lock',
        // eslint-disable-next-line node/no-extraneous-require
        shouldGenerateTsconfigInLernaRepo && require.resolve('@ornikar/lerna-config/generate-tsconfig-files.js'),
        shouldGenerateTsconfigInLernaRepo && 'git add **/tsconfig.json **/tsconfig.build.json',
      ].filter(Boolean);
    },
    [`{.eslintrc.json${
      workspaces ? `,${workspaces.map((workspacePath) => `${workspacePath}/{.eslintrc.json}`).join(',')}` : ''
    }}`]: ['prettier --parser json --write'],
    [`{.storybook,${srcDirectories}}/**/*.css`]: ['prettier --parser css --write', 'stylelint --quiet --fix'],

    [`${srcDirectories}/**/*.{${srcExtensions.join(',')}}`]: ['eslint --fix --quiet'],
    '{scripts,config,.storyboook}/*.js': ['eslint --fix --quiet'],
  };
};

module.exports.srcDirectory = 'src';
module.exports.getSrcDirectories = getSrcDirectories;
