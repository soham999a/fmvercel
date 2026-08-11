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
    rules: {
      // The codebase intentionally uses `any` (Supabase rows, error handling).
      "@typescript-eslint/no-explicit-any": "off",
      // Ported copy uses unescaped apostrophes/quotes in JSX text.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
