#!/usr/bin/env bun
/// <reference types="bun" />
/**
 * Wiki lint — enforces the consistency rules from
 * .agents/rules/wiki-orchestration-rules.md.
 *
 * Checks:
 *   1. Every `docs/NNN-*.md` is mapped under at least one topic in
 *      `wiki/sources/internal-docs-map.md` (orphan-doc detection).
 *   2. Every doc listed in the map (primary OR secondary) appears in the
 *      matching `wiki/topics/<topic>.md` under the `## 关联文档` section.
 *   3. Every doc link inside a topic's `## 关联文档` section points to a
 *      file that actually exists under `docs/`.
 *   4. Every topic page has the required sections defined by the rules
 *      (`一句话总结`, `适用场景`, `核心概念`, `常见误区`, `证据状态`,
 *      `最近更新`, `关联文档`, `来源`).
 *
 * Exits 0 if clean, 1 if any check fails. Output is plain text, grouped
 * by problem class so the dispatching agent can act on each independently.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..", "..", "..");
const DOCS_DIR = join(REPO_ROOT, "docs");
const WIKI_DIR = join(REPO_ROOT, "wiki");
const TOPICS_DIR = join(WIKI_DIR, "topics");
const MAP_FILE = join(WIKI_DIR, "sources", "internal-docs-map.md");

const REQUIRED_TOPIC_SECTIONS = [
  "一句话总结",
  "适用场景",
  "核心概念",
  "常见误区",
  "证据状态",
  "最近更新",
  "关联文档",
  "来源",
] as const;

const DOC_LINK_RE = /\[([^\]]+)\]\(\.\.\/\.\.\/docs\/([^)]+)\)/;

const slugify = (header: string): string =>
  header.trim().toLowerCase().replace(/\s+/g, "-");

const listMarkdown = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).filter((f: string) => f.endsWith(".md"))
    : [];

function parseMap(text: string): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  let currentTopic: string | null = null;
  let inSubsection = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      const header = line.slice(3).trim();
      if (header === "相关页面") {
        currentTopic = null;
        continue;
      }
      currentTopic = slugify(header);
      if (!result.has(currentTopic)) result.set(currentTopic, new Set());
      inSubsection = false;
      continue;
    }
    if (line.startsWith("### ")) {
      inSubsection = currentTopic !== null;
      continue;
    }
    if (currentTopic && inSubsection) {
      const m = DOC_LINK_RE.exec(line);
      if (m) result.get(currentTopic)!.add(m[2]);
    }
  }
  return result;
}

function parseTopicRelated(text: string): Set<string> {
  const related = new Set<string>();
  let inSection = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (line.startsWith("## ")) {
      inSection = line.slice(3).trim() === "关联文档";
      continue;
    }
    if (inSection) {
      const m = DOC_LINK_RE.exec(line);
      if (m) related.add(m[2]);
    }
  }
  return related;
}

function topicSections(text: string): Set<string> {
  const out = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    if (raw.startsWith("## ") && !raw.startsWith("### ")) {
      out.add(raw.slice(3).trim());
    }
  }
  return out;
}

function main(): number {
  if (!existsSync(MAP_FILE)) {
    console.error(`FATAL: missing ${MAP_FILE}`);
    return 1;
  }
  if (!existsSync(TOPICS_DIR)) {
    console.error(`FATAL: missing ${TOPICS_DIR}`);
    return 1;
  }

  const docFiles = new Set(listMarkdown(DOCS_DIR));
  const topicFiles = new Map<string, string>();
  for (const name of listMarkdown(TOPICS_DIR)) {
    topicFiles.set(name.replace(/\.md$/, ""), join(TOPICS_DIR, name));
  }

  const mapping = parseMap(readFileSync(MAP_FILE, "utf-8"));

  const problems: Record<string, string[]> = {
    orphan_docs: [],
    map_topic_missing_page: [],
    doc_in_map_not_in_related: [],
    doc_in_related_missing_file: [],
    topic_missing_sections: [],
  };

  const mappedDocs = new Set<string>();
  for (const docs of mapping.values()) for (const d of docs) mappedDocs.add(d);
  for (const d of [...docFiles].sort()) {
    if (!mappedDocs.has(d)) problems.orphan_docs.push(d);
  }

  for (const [slug, docs] of mapping) {
    const topicPath = topicFiles.get(slug);
    if (!topicPath) {
      problems.map_topic_missing_page.push(slug);
      continue;
    }
    const topicText = readFileSync(topicPath, "utf-8");
    const related = parseTopicRelated(topicText);
    for (const d of [...docs].sort()) {
      if (!related.has(d))
        problems.doc_in_map_not_in_related.push(`${slug}: ${d}`);
    }
    for (const d of [...related].sort()) {
      if (!docFiles.has(d))
        problems.doc_in_related_missing_file.push(`${slug}: ${d}`);
    }
    const sections = topicSections(topicText);
    const missing = REQUIRED_TOPIC_SECTIONS.filter((s) => !sections.has(s));
    if (missing.length) {
      problems.topic_missing_sections.push(`${slug}: ${missing.join(", ")}`);
    }
  }

  for (const [slug, path] of topicFiles) {
    if (mapping.has(slug)) continue;
    const text = readFileSync(path, "utf-8");
    const sections = topicSections(text);
    const missing = REQUIRED_TOPIC_SECTIONS.filter((s) => !sections.has(s));
    if (missing.length) {
      problems.topic_missing_sections.push(
        `${slug} (unmapped topic): ${missing.join(", ")}`,
      );
    }
  }

  const anyProblem = Object.values(problems).some((v) => v.length > 0);
  if (!anyProblem) {
    console.log("wiki lint: clean");
    return 0;
  }

  const headers: Record<string, string> = {
    orphan_docs: "Orphan docs (in docs/ but not in internal-docs-map.md)",
    map_topic_missing_page: "Map topics with no matching wiki/topics/*.md",
    doc_in_map_not_in_related:
      "Docs mapped to a topic but missing from its 关联文档",
    doc_in_related_missing_file:
      "Topic 关联文档 entries pointing at missing doc files",
    topic_missing_sections: "Topic pages missing required sections",
  };
  for (const [key, items] of Object.entries(problems)) {
    if (!items.length) continue;
    console.log(`\n## ${headers[key]}`);
    for (const item of items) console.log(`  - ${item}`);
  }
  const total = Object.values(problems).reduce((n, v) => n + v.length, 0);
  console.log(`\nwiki lint: ${total} problem(s) found`);
  return 1;
}

process.exit(main());
