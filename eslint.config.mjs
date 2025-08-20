// eslint.config.js (Flat Config)
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  // baseDirectory perlu absolute path, bukan import.meta.dirname langsung
  baseDirectory: __dirname,
});

export default [
  // optional: ignore folders
  {
    ignores: ["**/.next/**", "**/node_modules/**", "**/dist/**", "**/build/**"],
  },

  // Bawa konfigurasi Next.js (legacy) ke Flat Config
  ...compat.config({
    // Lebih direkomendasikan "next/core-web-vitals"
    extends: ["next/core-web-vitals"],
  }),

  // Tambahkan dukungan TypeScript (plugin + parser)
  {
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // set false kecuali kamu pakai type-aware linting:
        project: false,
        // kalau perlu:
        // tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // aturan custom kamu
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/no-explicit-any": "off", // sekarang rule dikenali
      // kalau pengen matiin warning <img> secara global (opsional):
      // "@next/next/no-img-element": "off",
    },
  },
];
