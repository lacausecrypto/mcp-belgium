import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/register.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  shims: false,
  noExternal: [/^@lacausecrypto\//],
  external: ["@modelcontextprotocol/sdk", "express", "pino", "pino-pretty", "zod"],
});
