import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "main.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    typescript(),
    //typescript({
    //esModuleInterop: true,
    //module: "node20",
    //target: "es2022"
    //})
  ],
};

export default config;

