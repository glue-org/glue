import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import path from "path";
import dfxJson from "./dfx.json";
import fs from "fs";

const isDev = process.env["DFX_NETWORK"] !== "ic";

type Network = "ic" | "local";

interface CanisterIds {
  [key: string]: { [key in Network]: string };
}

let canisterIds: CanisterIds = {};
try {
  canisterIds = JSON.parse(
    fs
      .readFileSync(
        isDev ? ".dfx/local/canister_ids.json" : "./canister_ids.json",
      )
      .toString(),
  );
} catch (e) {
  console.error("\n⚠️  Before starting the dev server run: dfx deploy\n\n");
}

// List of all aliases for canisters
// This will allow us to: import { canisterName } from "canisters/canisterName"
const aliases = Object.entries(dfxJson.canisters).reduce(
  (acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env["DFX_NETWORK"] || "local";
    const outputRoot = path.join(
      __dirname,
      ".dfx",
      networkName,
      "canisters",
      name,
    );

    return {
      ...acc,
      ["canisters/" + name]: path.join(outputRoot, "index" + ".js"),
    };
  },
  {},
);

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
// This strange way of JSON.stringifying the value is required by vite
const canisterDefinitions = Object.entries({
  ...canisterIds,
}).reduce(
  (acc, [key, val]) => ({
    ...acc,
    [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDev
      ? JSON.stringify(val.local)
      : JSON.stringify(val.ic),
  }),
  {},
);

console.log(canisterDefinitions);

// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "es2020",
  },
  resolve: {
    alias: {
      // Here we tell Vite the "fake" modules that we want to define
      ...aliases,
    },
  },
  publicDir: "./src/frontend/public",
  server: {
    host: true,
    fs: {
      allow: ["."],
    },
    proxy: {
      // This proxies all http requests made to /api to our running dfx instance
      "/api": {
        target: `http://127.0.0.1:4943}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  define: {
    // Here we can define global constants
    // This is required for now because the code generated by dfx relies on process.env being set
    ...canisterDefinitions,
    "process.env.NODE_ENV": JSON.stringify(
      isDev ? "development" : "production",
    ),
  },
});
