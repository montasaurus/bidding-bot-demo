module.exports = {
  env: {
    node: true,
  },
  root: true,
  reportUnusedDisableDirectives: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
  },
  ignorePatterns: [".eslintrc.js"],
  plugins: ["@typescript-eslint", "import", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    curly: ["error"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal"],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unused-modules": [1, { unusedExports: true }],
    "no-control-regex": "off",

    "object-shorthand": ["error", "always"],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".tsx", ".json"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: "src",
      },
    },
  },
}
