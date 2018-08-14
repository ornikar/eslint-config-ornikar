'use strict';

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-prettier',
  ].map(require.resolve),

  plugins: ['stylelint-order'].map(require.resolve),

  rules: {
    'max-nesting-depth': 3,
    'no-descending-specificity': null,

    'order/order': ['declarations', 'rules', 'at-rules'],
  },
};