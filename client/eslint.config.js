// // eslint.config.js
// import js from "@eslint/js";
// import ts from "@typescript-eslint/eslint-plugin";
// import tsParser from "@typescript-eslint/parser";
// import react from "eslint-plugin-react";
// import globals from "globals";

// export default [
//   {
//     files: ["**/*.{ts,tsx}"],
//     languageOptions: {
//       parser: tsParser,
//       globals: globals.browser,
//       ecmaVersion: "latest",
//       sourceType: "module",
//     },
//     plugins: {
//       "@typescript-eslint": ts,
//       react,
//     },
//     rules: {
//       ...js.configs.recommended.rules,
//       ...ts.configs.recommended.rules,
//       ...react.configs.recommended.rules,
//       "no-console": "warn",
//       "@typescript-eslint/no-unused-vars": ["error"],
//       "react/react-in-jsx-scope": "off", // React 17+ doesn’t need import React
//     },
//     settings: {
//       react: {
//         version: "detect",
//       },
//     },
//   },
// ];
