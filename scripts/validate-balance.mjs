import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const registryPath = path.join(repoRoot, "balance", "v2", "registry.json");
const requireLocked = process.argv.includes("--require-locked");

const allowedStatuses = new Set(["missing", "calibration", "provisional", "candidate", "locked"]);

function fail(message) {
  console.error(`balance validation failed: ${message}`);
  process.exitCode = 1;
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

if (typeof registry.balanceVersion !== "string" || !registry.balanceVersion) fail("balanceVersion must be a non-empty string");
if (typeof registry.runtimeReady !== "boolean") fail("runtimeReady must be boolean");
if (!registry.parameters || typeof registry.parameters !== "object") fail("parameters must be an object");

const counts = Object.fromEntries([...allowedStatuses].map((status) => [status, 0]));
const unresolvedRequired = [];

for (const [key, entry] of Object.entries(registry.parameters ?? {})) {
  if (!allowedStatuses.has(entry.status)) {
    fail(`${key} has invalid status ${JSON.stringify(entry.status)}`);
    continue;
  }

  counts[entry.status] += 1;
  if (typeof entry.requiredForRuntime !== "boolean") fail(`${key}.requiredForRuntime must be boolean`);
  if (!Object.prototype.hasOwnProperty.call(entry, "value")) fail(`${key} must include a value field`);
  if (typeof entry.unit !== "string") fail(`${key}.unit must be a string`);
  if (typeof entry.source !== "string" || !entry.source) fail(`${key}.source must be a non-empty string`);
  if (entry.status === "missing" && entry.value !== null) fail(`${key} is missing but value is not null`);
  if (entry.status === "locked" && entry.value === null) fail(`${key} is locked but value is null`);
  if (entry.requiredForRuntime && entry.status !== "locked") unresolvedRequired.push(key);
}

const runtimePath = path.join(repoRoot, "balance", "v2", "runtime.json");
const runtimeExists = fs.existsSync(runtimePath);

if (registry.runtimeReady && unresolvedRequired.length > 0) fail(`runtimeReady is true but ${unresolvedRequired.length} required parameters are not locked`);
if (!registry.runtimeReady && unresolvedRequired.length === 0) fail("all required parameters are locked but runtimeReady is false");
if (!registry.runtimeReady && runtimeExists) fail("runtime.json must not exist while runtimeReady is false");
if (registry.runtimeReady && !runtimeExists) fail("runtimeReady is true but runtime.json does not exist");

if (requireLocked && unresolvedRequired.length > 0) {
  fail(`${unresolvedRequired.length} required parameters are unresolved; first examples: ${unresolvedRequired.slice(0, 8).join(", ")}`);
}

console.log(`balance ${registry.balanceVersion}: ${Object.entries(counts).map(([status, count]) => `${status}=${count}`).join(" ")}; required unresolved=${unresolvedRequired.length}; runtimeReady=${registry.runtimeReady}`);
