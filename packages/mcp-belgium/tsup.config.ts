import { createRequire } from "node:module";
import { defineConfig } from "tsup";

const require = createRequire(import.meta.url);
const typescriptVersion = require("typescript/package.json").version as string;
const typescriptMajor = Number.parseInt(typescriptVersion.split(".")[0] ?? "0", 10);
const dtsCompilerOptions = typescriptMajor >= 6 ? { ignoreDeprecations: "6.0" } : undefined;

export default defineConfig({
  entry: ["src/index.ts", "src/register.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: dtsCompilerOptions ? { compilerOptions: dtsCompilerOptions } : true,
  shims: false,
  noExternal: [/^@lacausecrypto\//],
  external: ["@modelcontextprotocol/sdk", "express", "pino", "pino-pretty", "zod"],
});
