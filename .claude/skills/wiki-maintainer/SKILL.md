---
name: wiki-maintainer
description: Use when maintaining the Vitest learning wiki from archived docs, new summary articles, recurring audits, or question-driven knowledge updates.
---

# Wiki Maintainer

## Overview

This skill maintains a two-layer knowledge system:

- Publish layer: `docs/NNN-xxx.md`
- Wiki layer: `docs/wiki/`

Use `conversation-summary` to create new publish docs. Use this skill to organize, ingest, audit, and update the wiki layer.

## When To Use

Use this skill for:

- Backfilling existing `docs/NNN-xxx.md` into wiki topics
- Ingesting newly created publish docs into the right topic pages
- Running periodic wiki lint and maintenance
- Updating wiki after answering a question when a stable new conclusion should be retained

Do not use this skill to write a new publish document from a conversation.

## Required Files

Ensure these files exist before maintenance:

- `docs/wiki/SCHEMA.md`
- `docs/wiki/index.md`
- `docs/wiki/log.md`
- `docs/wiki/topics/*.md`
- `docs/wiki/paths/*.md` (recommended)
- `docs/wiki/sources/official-docs.md`
- `docs/wiki/sources/internal-docs-map.md`

Read `references/schema-template.md` for a generic schema template, `references/templates.md` for page shapes, and `references/topic-map.md` for the current doc-to-topic mapping.

## Canonical Mapping

Treat `docs/wiki/sources/internal-docs-map.md` as the runtime source of truth.

- `references/topic-map.md` is a reference starter, not a live authority
- a doc is considered covered only when:
  - it appears in `internal-docs-map.md` as primary or secondary
  - it is linked from the matching topic page under `关联文档`
- every backfill, ingest, and query-update must keep both artifacts in sync

## Canonical Workflow

### 1. Backfill

Trigger:

- Existing `docs/NNN-xxx.md` is not represented in any topic page

Steps:

1. Scan `docs/NNN-xxx.md`
2. Map each doc to one primary topic
3. Distill stable conclusions into the topic page
4. Link the source doc under `关联文档`
5. Add or update its primary or secondary mapping in `docs/wiki/sources/internal-docs-map.md`
6. Update `docs/wiki/index.md` when a new topic or path is added
7. Append a `backfill` entry to `docs/wiki/log.md`

### 2. Ingest

Trigger:

- A new publish doc is created by `conversation-summary`

Steps:

1. Classify the document by topic
2. Prefer updating an existing topic page
3. Create a new topic page only when no good fit exists
4. Update `docs/wiki/sources/internal-docs-map.md`
5. Update `index.md` and any relevant path page
6. Append an `ingest` entry to `log.md`

### 3. Lint

Trigger:

- Scheduled maintenance or before major reorganization

Checks:

1. **SCHEMA presence**: `docs/wiki/SCHEMA.md` exists and is readable.
2. **Frontmatter validation**: Every wiki page has required fields (`title`, `created`, `updated`, `type`, `tags`, `sources`). Tags must be in the taxonomy defined in `SCHEMA.md`.
3. **Orphan docs**: Publish docs (`docs/NNN-xxx.md`) not referenced from any topic page or `internal-docs-map.md`.
4. **Map-topic sync**: Docs present in topics but missing from `internal-docs-map.md`, and vice versa.
5. **Duplicate or overlapping topics**: Two topic pages covering the same concept without clear separation.
6. **Broken links**: Both standard Markdown relative links and `[[wikilinks]]` must resolve.
7. **Missing source sections**: Every topic page must have a `来源` section with at least one official or project doc source.
8. **Stale content**: Pages whose `updated` date is >90 days older than the most recent source that mentions the same entities.
9. **Page size**: Flag pages over ~200 lines as candidates for splitting.
10. **Log rotation**: If `log.md` exceeds 500 entries, recommend rotation.
11. **Contradictions**: Pages sharing tags/entities but stating conflicting facts, or content that contradicts `SCHEMA.md` conventions.
12. **Unverifiable statements**: Claims without sources or explicit "待验证" markers.

Output:

- Append a `lint` entry to `docs/wiki/log.md`
- Record follow-up fixes explicitly, grouped by severity (broken links > orphans > stale content > style issues)

### 4. Query-Update

Trigger:

- During Q&A, the answer creates stable reusable knowledge not yet covered by the wiki

Steps:

1. Answer the user first
2. Extract the reusable knowledge delta
3. Apply the smallest useful update to a topic or path page
4. If a doc relationship changed, update `internal-docs-map.md`
5. Append a `query-update` entry to the log

Do not paste raw conversation into wiki pages.

## Topic Page Rules

Every topic page should include:

- YAML frontmatter with `title`, `created`, `updated`, `type`, `tags`, `sources`
- 一句话总结
- 适用场景
- 核心概念
- 常见误区
- 关联文档
- 来源（官方优先，也可补充项目文档）
- At least 2 `[[wikilinks]]` to other wiki-layer pages

Keep topic pages concise and stable. Put long explanations in `docs/NNN-xxx.md`, not in the wiki.

## Source Priority

1. Official Vitest docs
2. Project publish docs under `docs/NNN-xxx.md`
3. Explicitly marked experience notes

If a statement cannot be verified, mark it as pending verification.

## Logging Rules

Every backfill, ingest, lint, or query-update must append to `docs/wiki/log.md` with:

- date
- action type
- concrete changed files
- source docs or links
- follow-up notes

No silent wiki edits.

## Collaboration Contract

- `AGENTS.md` defines trigger policy and quality gates
- `wiki-maintainer` defines execution steps
- `conversation-summary` remains the only workflow for creating `docs/NNN-xxx.md` from conversation on explicit user request
