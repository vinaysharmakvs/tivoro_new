import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const source = await readFile("packages/threeui/src/shaders/3d-paper/sources/3d-paper.html", "utf8");
if (createHash("sha256").update(source).digest("hex") !== "8ec1b71c0dbcafbadf908100ae2a08045d0a1087c00a09d28245ef19366c7353") throw new Error("Motion reference archive changed");
const library=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
await writeFile("dist/assets/three-r149.js",library);
await build({entryPoints:["src/project-flow.js"],outfile:"dist/assets/project-flow.js",bundle:true,minify:true,format:"iife"});
