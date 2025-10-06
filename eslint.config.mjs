import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // テストファイルとデバッグファイルを除外
      "test-*.js",
      "check-*.js",
      "debug-*.js",
      "fix-*.js",
      "create-*.js",
      "upgrade-*.js",
      "auth-debug-test.js",
      "console-debug-test.js",
      "flexible-site-analysis.js",
      "manual-signin-sidebar-check.js",
      "signin-and-sidebar-check.js",
      "simple-color-test.js",
      "comprehensive-slider-test.js",
      "*.test.js",
      "*.spec.js",
    ],
  },
];

export default eslintConfig;
