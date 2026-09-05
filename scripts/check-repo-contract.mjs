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
  "docs/BUILD.md",
  "docs/SKILLS.md",
  "docs/design/DESIGN.md",
  "docs/design/REFERENCES.md",
  "docs/content/CONTENT.md",
  "docs/balance/BALANCE_SPEC_V2.md",
  "docs/automation/AUTOMATION.md",
  "balance/v2/registry.json",
  "balance/v2/schema.json",
  "simulation/README.md",
  ".agents/skills/opu-build-guardian/SKILL.md",
  ".agents/skills/opu-simulation-guardian/SKILL.md",
  ".agents/skills/opu-balance-guardian/SKILL.md",
  ".agents/skills/opu-design-guardian/SKILL.md",
  ".agents/skills/opu-visual-qa/SKILL.md",
  ".agents/skills/opu-content-guardian/SKILL.md",
  ".agents/skills/opu-asset-generation/SKILL.md",
  ".agents/skills/opu-asset-request/SKILL.md",
];

const retiredTopLevelContext = [
  "CODEX_REBUILD_BRIEF.md",
  "CODEX_RUNBOOK.md",
];

let failed = false;
function fail(message) {
  failed = true;
  console.error(`repo contract failed: ${message}`);
}

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) fail(`missing required file ${relative}`);
}

for (const relative of retiredTopLevelContext) {
  if (fs.existsSync(path.join(root, relative))) {
    fail(`retired competing context file still exists: ${relative}`);
  }
}

const canonicalPath = path.join(root, "ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md");
if (fs.existsSync(canonicalPath)) {
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  if (!canonical.includes("CURRENT PRODUCT TRUTH FOR V2 SYSTEM DESIGN")) {
    fail("canonical context no longer declares V2 product-truth status");
  }
}

const agentsPath = path.join(root, "AGENTS.md");
if (fs.existsSync(agentsPath)) {
  const agents = fs.readFileSync(agentsPath, "utf8");
  for (const needle of [
    "ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md",
    "docs/BUILD.md",
    "ARCHITECTURE.md",
    "BALANCE_SPEC_V2.md",
    "balance/v2/registry.json",
    "docs/design/DESIGN.md",
    "docs/content/CONTENT.md",
    "docs/SKILLS.md",
  ]) {
    if (!agents.includes(needle)) fail(`AGENTS.md must map to ${needle}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const allFiles = walk(root);

for (const file of allFiles) {
  const relative = path.relative(root, file).split(path.sep).join("/");

  const instructionName = path.basename(file).toLowerCase();
  if (instructionName === "agents.override.md") {
    fail(`agent override can shadow the canonical root map: ${relative}`);
  }

  if (instructionName === "agents.md" && relative !== "AGENTS.md") {
    fail(`nested or case-variant AGENTS.md creates competing instruction scope: ${relative}`);
  }

  if (relative.includes("/.codex/skills/") || relative.startsWith(".codex/skills/")) {
    fail(`project skills belong only in root .agents/skills: ${relative}`);
  }

  if (relative.includes("/.agents/skills/")) {
    fail(`nested project skills create competing workflow scope: ${relative}`);
  }
}

const simulationFiles = [
  ...walk(path.join(root, "simulation")),
  ...walk(path.join(root, "src", "simulation")),
].filter((file) => /\.(?:[cm]?js|tsx?)$/.test(file));

for (const file of simulationFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (/\bMath\.random\s*\(/.test(source)) {
    fail(`${path.relative(root, file)} uses Math.random(); simulation must be seeded`);
  }
}

const productionFiles = [
  ...walk(path.join(root, "app")),
  ...walk(path.join(root, "src")),
].filter((file) => /\.(?:[cm]?js|tsx?)$/.test(file));

for (const file of productionFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("balance/v2/registry.json") || source.includes("balance/v2/schema.json")) {
    fail(
      `${path.relative(root, file)} imports balance registry/schema directly; production must consume locked runtime balance through a simulation boundary`,
    );
  }
}

const designGuardianPath = path.join(root, ".agents", "skills", "opu-design-guardian", "SKILL.md");
if (fs.existsSync(designGuardianPath)) {
  const designGuardian = fs.readFileSync(designGuardianPath, "utf8");
  if (designGuardian.includes("one-person-unicorn-design-context-v2.2/design.md")) {
    fail("design guardian still points to legacy design.md");
  }
}

if (failed) process.exitCode = 1;
else console.log("repository contract passed");
