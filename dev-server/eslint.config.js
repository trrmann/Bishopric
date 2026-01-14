module.exports = [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    extends: ["eslint:recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
