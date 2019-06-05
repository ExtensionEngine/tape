const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018
  },
  // https://github.com/Flet/eslint-config-semistandard
  extends: ['semistandard'],
  rules: {
    indent: ['error', 2, {
      SwitchCase: 1,
      MemberExpression: 'off'
    }],
    'arrow-parens': 'off',
    'no-debugger': isDev ? 'warn' : 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never'
    }]
  }
};
