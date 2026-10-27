import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".dstar-backups/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts"
  ])
]);

export default eslintConfig;
