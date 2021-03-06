module.exports = {
  extends: 'airbnb-base',
  env: {
    mocha: true,
    browser: true
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        functions: 'never'
      }
    ]
  }
};
