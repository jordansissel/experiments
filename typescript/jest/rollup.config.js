import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    typescript({
      esModuleInterop: true,
      module: "node20",
      target: "es2022"
    })
  ],
};

export default config;

