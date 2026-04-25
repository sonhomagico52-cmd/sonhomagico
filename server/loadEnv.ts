import fs from "node:fs";
import path from "node:path";

let envLoaded = false;

function normalizeEnvValue(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function loadLocalEnv() {
  if (envLoaded) {
    return;
  }

  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    envLoaded = true;
    return;
  }

  const content = fs.readFileSync(envPath, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const currentValue = process.env[key];
    if (!key || (currentValue !== undefined && currentValue !== "")) {
      continue;
    }

    const value = line.slice(separatorIndex + 1);
    process.env[key] = normalizeEnvValue(value);
  }

  envLoaded = true;
}
