import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const size = {
  "max-lines": [
    "error",
    { max: 200, skipBlankLines: true, skipComments: true },
  ],
  "max-lines-per-function": [
    "error",
    { max: 100, skipBlankLines: true, skipComments: true },
  ],
  "max-params": ["error", 4],
  "max-depth": ["error", 3],
  complexity: ["error", 15],
  "no-console": "error",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "sword-x-staff-prompt-tool/**",
    "fe-react-structure/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      ...size,
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["../../*", "../../../*"], message: "Dùng alias @/" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "max-lines": [
        "error",
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["src/features/*/views/**"],
    rules: {
      "max-lines": [
        "error",
        { max: 180, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/app/*"],
              message: "shared không import feature",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/features/*/*"],
              message: "Import feature qua public index",
            },
            { group: ["../../*", "../../../*"], message: "Dùng alias @/" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/ui/**", "src/**/*.test.ts"],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },
]);

export default eslintConfig;
