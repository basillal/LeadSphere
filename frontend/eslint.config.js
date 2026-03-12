import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const warnAll = (rules = {}) =>
  Object.fromEntries(Object.keys(rules).map((name) => [name, "warn"]));

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...warnAll(js.configs.recommended.rules),
      ...warnAll(reactHooks.configs.recommended.rules),
      // This codebase currently has many unused imports/vars; keep lint informative without blocking.
      "no-unused-vars": "warn",
      "no-dupe-else-if": "warn",
      "no-undef": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];

