import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run vitals:summary -- path/to/runtime-logs.jsonl");
  process.exit(1);
}

const thresholds = { CLS: 0.1, FCP: 1800, INP: 200, LCP: 2500, TTFB: 800 };
const samples = new Map();
const input = createReadStream(file, { encoding: "utf8" });
input.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
const lines = createInterface({ input, crlfDelay: Infinity });
for await (const line of lines) {
  try {
    // Accept JSONL and the prefixed JSON lines found in common runtime exports.
    let metric = JSON.parse(line.slice(line.indexOf("{")));
    if (typeof metric.message === "string") metric = JSON.parse(metric.message);
    if (metric.event !== "web-vital" || !Object.hasOwn(thresholds, metric.name)
      || typeof metric.value !== "number" || !Number.isFinite(metric.value)
      || metric.value < 0 || typeof metric.id !== "string") continue;
    // An updated measurement replaces the previous value for the same metric ID.
    samples.set(`${metric.name}:${metric.id}`, metric);
  } catch { /* Ignore unrelated hosting log messages. */ }
}

const summary = Object.entries(thresholds).map(([name, target]) => {
  const values = [...samples.values()].filter((metric) => metric.name === name)
    .map((metric) => metric.value).sort((a, b) => a - b);
  const p75 = values[Math.ceil(values.length * 0.75) - 1];
  return {
    metric: name, samples: values.length,
    p75: p75 === undefined ? "—" : Number(p75.toFixed(name === "CLS" ? 3 : 1)),
    unit: name === "CLS" ? "score" : "ms",
    "good target": target,
    result: p75 === undefined ? "no data" : p75 <= target ? "good" : "needs attention",
  };
});
console.table(summary);
