import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "index.ts",
  output: {
    file: "build/all.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    typescript(),
  ],
};

export default config;
