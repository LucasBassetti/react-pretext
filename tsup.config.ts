import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  // @chenglou/pretext ships raw .ts — bundle it so consumers don't need to compile it
  noExternal: ["@chenglou/pretext"],
});
