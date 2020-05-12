module.exports = {
  root: true,
  env: {
    // this section will be used to determine which APIs are available to us
    // (i.e are we running in a browser environment or a node.js env)
    node: true,
    browser: true,
    jest: true,
  },
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
    'plugin:compat/recommended',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    // we should always disable console logs and debugging in production
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-param-reassign': [2, {
      props: false,
    }],
    'no-restricted-syntax': ['error', 'WithStatement', 'LabeledStatement'],
    'import/no-unresolved': 'off',
    'babel/camelcase': 1,
  },
  plugins: [
    'babel',
  ],
};
