import prettierPlugin from "eslint-plugin-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          printWidth: 120,
          tabWidth: 2,
          singleQuote: false,
          bracketSpacing: true,
          jsxBracketSameLine: true,
          semi: true,
          trailingComma: "all",
          arrowParens: "avoid",
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.vue", "**/*.js", "**/*.mjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: false,
        },
      ],
    },
  },
);
