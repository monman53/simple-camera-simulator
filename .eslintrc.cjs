/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:vue/vue3-essential',
    "eslint:recommended",
    '@vue/eslint-config-typescript',
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: './tsconfig.app.json',
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowAny: true // TODO: 
      }
    ]
  },
}
