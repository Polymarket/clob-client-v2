import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	sourcemap: true,
	tsconfig: "tsconfig.build.json",
	target: "es2022",
	platform: "browser",
	// Combined with `sideEffects: false` in package.json, this allows to achieve much better tree-shaking
	// compared to bundling it into a single file
	unbundle: true,
});
