import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const config = {
  input: "./index.js",
  output: {
    dir: "output",
    format: "cjs",
  },
  plugins: [commonjs(), babel({ babelHelpers: "bundled" }), json()],
};

export default config;
