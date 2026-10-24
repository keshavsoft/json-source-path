import { defineConfig } from "vite";
import { readdirSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const latestSrcVersion = readdirSync(resolve(__dirname, "src"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map((entry) => ({ name: entry.name, n: Number(entry.name.slice(1)) }))
    .sort((a, b) => b.n - a.n)[0]?.name;

if (!latestSrcVersion) {
    throw new Error("No src/vN folders found");
}

const entryFile = resolve(__dirname, "src", latestSrcVersion, "index.js");

export default defineConfig({
    plugins: [
        {
            name: "copy-latest-to-root-dist",
            closeBundle() {
                try {
                    const targetDir = resolve(__dirname, "docs/dist");
                    if (!existsSync(targetDir)) {
                        mkdirSync(targetDir, { recursive: true });
                    }
                    copyFileSync(
                        resolve(__dirname, "docs/dist", latestSrcVersion, "min.js"),
                        resolve(targetDir, "min.js")
                    );
                } catch (e) {
                    console.warn("Could not copy latest to docs/dist/min.js", e);
                }
            }
        }
    ],
    server: {
        fs: {
            allow: [".."]
        }
    },
    build: {
        outDir: resolve(__dirname, "docs/dist", latestSrcVersion),
        emptyOutDir: false,
        minify: true,
        lib: {
            entry: entryFile,
            name: "jsonToDomTable",
            formats: ["es"],
            fileName: () => "min.js"
        }
    }
});
