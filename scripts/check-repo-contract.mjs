import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const required = [
  "AGENTS.md",
  "ARCHITECTURE.md",
  "ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md",
  "docs/index.md",
  "docs/balance/BALANCE_SPEC_V2.md",
  "docs/automation/AUTOMATION.md",
  "balance/v2/registry.json",
  "balance/v2/schema.json",
  "simulation/README.md",
  "CODEX_REBUILD_BRIEF.md"
];

let failed = false;
function fail(message) {
  failed = true;
  console.error(`repo contract failed: ${message}`);
}

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) fail(`missing required file ${relative}`);
}

const canonicalPath = path.join(root, "ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md");
if (fs.existsSync(canonicalPath)) {
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  if (!canonical.includes("CURRENT PRODUCT TRUTH FOR V2 SYSTEM DESIGN")) fail("canonical context no longer declares V2 product-truth status");
}

const agentsPath = path.join(root, "AGENTS.md");
if (fs.existsSync(agentsPath)) {
  const agents = fs.readFileSync(agentsPath, "utf8");
  for (const needle of ["ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md", "BALANCE_SPEC_V2.md", "balance/v2/registry.json", "ARCHITECTURE.md"]) {
    if (!agents.includes(needle)) fail(`AGENTS.md must map to ${needle}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const simulationFiles = [...walk(path.join(root, "simulation")), ...walk(path.join(root, "src", "simulation"))].filter((file) => /\.(?:[cm]?js|tsx?)$/.test(file));
for (const file of simulationFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (/\bMath\.random\s*\(/.test(source)) fail(`${path.relative(root, file)} uses Math.random(); simulation must be seeded`);
}

const productionFiles = [...walk(path.join(root, "app")), ...walk(path.join(root, "src"))].filter((file) => /\.(?:[cm]?js|tsx?)$/.test(file));
for (const file of productionFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("balance/v2/registry.json") || source.includes("balance/v2/schema.json")) {
    fail(`${path.relative(root, file)} imports balance registry/schema directly; production must consume locked runtime balance through a simulation boundary`);
  }
}

if (fs.existsSync(path.join(root, ".codex", "skills"))) fail("active project skills belong in .agents/skills, not root .codex/skills");

if (failed) process.exitCode = 1;
else console.log("repository contract passed");
