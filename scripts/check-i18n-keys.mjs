import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "src", "messages");
const baseLocaleFile = path.join(messagesDir, "en.json");
const compareLocaleFile = path.join(messagesDir, "zh.json");

function flattenKeys(input, prefix = "") {
  if (Array.isArray(input) || input === null || typeof input !== "object") {
    return [prefix];
  }

  const entries = Object.entries(input);
  if (entries.length === 0) {
    return [prefix];
  }

  return entries.flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(value, nextPrefix);
  });
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

const baseLocale = readJson(baseLocaleFile);
const compareLocale = readJson(compareLocaleFile);

const baseKeys = new Set(flattenKeys(baseLocale).filter(Boolean));
const compareKeys = new Set(flattenKeys(compareLocale).filter(Boolean));

const missingInCompare = [...baseKeys].filter((key) => !compareKeys.has(key));
const extraInCompare = [...compareKeys].filter((key) => !baseKeys.has(key));

if (missingInCompare.length === 0 && extraInCompare.length === 0) {
  console.log("i18n key check passed: en.json and zh.json are in sync.");
  process.exit(0);
}

console.error("i18n key check failed:");

if (missingInCompare.length > 0) {
  console.error("\nMissing keys in zh.json:");
  for (const key of missingInCompare.sort()) {
    console.error(`  - ${key}`);
  }
}

if (extraInCompare.length > 0) {
  console.error("\nExtra keys in zh.json:");
  for (const key of extraInCompare.sort()) {
    console.error(`  - ${key}`);
  }
}

process.exit(1);
