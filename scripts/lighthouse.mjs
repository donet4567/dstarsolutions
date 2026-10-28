import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const [mode = "mobile", url = "http://127.0.0.1:3100"] = process.argv.slice(2);
if (!["mobile", "desktop"].includes(mode)) throw new Error("Choose mobile or desktop.");
if (!process.env.npm_execpath) throw new Error("Run with npm run audit:lighthouse -- mobile|desktop [URL].");
await readFile(".next/BUILD_ID", "utf8");
const directory = resolve(".dstar-backups/performance");
await mkdir(directory, { recursive: true });
const output = resolve(directory, `${mode}-${new Date().toISOString().replace(/[:.]/g, "-")}`);
const args = [process.env.npm_execpath, "exec", "--yes", "--package=lighthouse@13.6.0", "--", "lighthouse", url,
  "--chrome-flags=--headless=new --no-first-run", "--output=json", "--output=html", `--output-path=${output}`,
  "--save-assets", "--max-wait-for-load=90000", "--quiet"];
if (mode === "desktop") args.push("--preset=desktop");
const code = await new Promise((done, reject) => {
  const child = spawn(process.execPath, args, { stdio: "inherit", env: process.env });
  child.once("error", reject);
  child.once("exit", done);
});
if (code !== 0) process.exit(code || 1);
const report = JSON.parse(await readFile(`${output}.report.json`, "utf8"));
if (report.runtimeError) throw new Error(report.runtimeError.message);
console.table(Object.fromEntries(Object.entries(report.categories).map(([name, category]) => [name, { score: Math.round(category.score * 100) }])));
console.table(Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "speed-index", "mainthread-work-breakdown"].map(id => [id, { value: report.audits[id].displayValue }])));
console.log(`Report: ${output}.report.html`);
