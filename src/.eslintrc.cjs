module.exports = {
  parser: '@babel/eslint-parser',
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['airbnb', 'airbnb/hooks', 'plugin:prettier/recommended'],
  plugins: ['react', 'react-hooks', 'import', 'prettier'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    // Prevent accidental inclusion of debugging statements.
    'no-console': 2,

    // force linting warnings to be dealt with as errors
    'prettier/prettier': [0, { endOfLine: 'auto' }],

    // i like `this`
    'class-methods-use-this': 0,

    // sometimes useful
    'no-underscore-dangle': 0,

    // this drives me crazy in forEach loops
    'no-return-assign': ['error', 'except-parens'],

    // IMO this is fine
    'no-param-reassign': 0,

    // stylistically prefer `continue`
    'no-continue': 0,

    // i like destructuring imports
    'import/prefer-default-export': 0,

    'import/extensions': ['error', 'always', { ignorePackages: true }],

    // newly introduced and competes with the "private class in file concept"
    'max-classes-per-file': 0,

    // disabled so often I give up
    'react/forbid-prop-types': 0,
    'react/sort-comp': 0,
    'react/prop-types': 0,

    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],

    // these are super annoying and a11y is required as a peer package so 🤷
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/accessible-emoji': 0,

    // this is actually OK
    'react/no-did-update-set-state': 0,

    // I really like this syntax
    'react/jsx-props-no-spreading': 0,

    // suggested by react-hooks plugin documentation
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // prefer names components assigned to lambdas
    'react/function-component-definition': 0,
  },
};
