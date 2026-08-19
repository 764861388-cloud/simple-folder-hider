import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";

const isProd = process.env.BUILD === "production";

export default {
	input: "src/main.ts",
	output: {
		file: "dist/main.js",
		sourcemap: isProd ? false : "inline",
		format: "cjs",
		exports: "auto",
	},
	external: ["obsidian"],
	plugins: [
		typescript({ tsconfig: "./tsconfig.json" }),
		nodeResolve(),
		copy({
			targets: [
				{ src: "manifest.json", dest: "dist" },
				{ src: "versions.json", dest: "dist" },
			],
		}),
	],
};
