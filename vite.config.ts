import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			wasm(),
			react(),
			tsconfigPaths(),
			{
				name: "envvars",
				config: () => {
					if (env.MAPTILER_API_KEY && !process.env.MAPTILER_API_KEY) {
						process.env.MAPTILER_API_KEY = env.MAPTILER_API_KEY;
					}

					if (!process.env.MAPTILER_API_KEY) {
						throw new Error(`Missing environment variable: MAPTILER_API_KEY`);
					}

					if (env.KEPLERGL_THEME && !process.env.KEPLERGL_THEME) {
						process.env.KEPLERGL_THEME = env.KEPLERGL_THEME;
					}

					if (
						process.env.KEPLERGL_THEME &&
						!["light", "dark"].includes(process.env.KEPLERGL_THEME)
					) {
						throw new Error(`Invalid environment variable: KEPLERGL_THEME`);
					}
				},
			},
		],
		server: {
			port: 8081,
			open: true,
		},
		build: {
			outDir: "dist",
			sourcemap: false,
			minify: true,
			target: "esnext",
			commonjsOptions: {
				include: [/node_modules/],
				transformMixedEsModules: true,
			},
		},
		define: {
			"process.env.KEPLERGL_THEME": JSON.stringify(env.KEPLERGL_THEME || "light"),
			"process.env.MAPTILER_API_KEY": JSON.stringify(env.MAPTILER_API_KEY || ""),
			"process.env.NODE_ENV": JSON.stringify(env.NODE_ENV || "production"),
		},
		resolve: {
			dedupe: ["styled-components"],
		},
		optimizeDeps: {
			esbuildOptions: {
				target: "es2020",
			},
			exclude: ["parquet-wasm"],
			include: [
				"@deck.gl/aggregation-layers",
				"@deck.gl/core",
				"@deck.gl/extensions",
				"@deck.gl/geo-layers",
				"@deck.gl/layers",
				"@deck.gl/mesh-layers",
				"@kepler.gl/actions",
				"@kepler.gl/common-utils",
				"@kepler.gl/components",
				"@kepler.gl/constants",
				"@kepler.gl/deckgl-layers",
				"@kepler.gl/duckdb",
				"@kepler.gl/effects",
				"@kepler.gl/layers",
				"@kepler.gl/processors",
				"@kepler.gl/schemas",
				"@kepler.gl/styles",
				"@kepler.gl/table",
				"@kepler.gl/tasks",
				"@kepler.gl/utils",
				"@luma.gl/core",
				"@luma.gl/engine",
				"@luma.gl/gltools",
				"@luma.gl/shadertools",
				"@luma.gl/webgl",
				"@loaders.gl/core",
				"@loaders.gl/gltf",
				"@loaders.gl/images",
				"@loaders.gl/parquet",
				"@math.gl/core",
				"@math.gl/web-mercator",
				"apache-arrow",
				"buffer",
				"gl-matrix",
				"lodash.uniq",
				"react",
				"react-dom",
				"react-redux",
				"redux",
				"styled-components",
			],
		},
	};
});
