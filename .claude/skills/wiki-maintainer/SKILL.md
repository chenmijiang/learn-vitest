---
name: wiki-maintainer
description: Use when maintaining the Vitest learning wiki from archived docs, new summary articles, recurring audits, or reusable conclusions from Q&A.
---

# Wiki Maintainer

## Overview

Maintain the wiki as a stable knowledge layer between raw docs and user answers. Prefer updating existing topic pages over creating new pages.

## When To Use

- Backfilling existing `docs/NNN-xxx.md` into `docs/wiki/`
- Ingesting a newly created publish doc into topic/path/index/map/log
- Running periodic wiki lint before larger updates
- Writing back stable, reusable conclusions from Q&A

## When NOT to Use

- Do not use this skill to create new `docs/NNN-xxx.md` from conversation
- Do not use this skill for one-off chat answers that should not be persisted
- Do not create new topics when an existing topic can absorb the update cleanly

## Required Files

- `docs/wiki/SCHEMA.md`
- `docs/wiki/index.md`
- `docs/wiki/log.md`
- `docs/wiki/topics/*.md`
- `docs/wiki/sources/official-docs.md`
- `docs/wiki/sources/internal-docs-map.md`

## Quick Reference

| Operation      | Must update                                                          |
| -------------- | -------------------------------------------------------------------- |
| `backfill`     | topic, map, index if needed, log                                     |
| `ingest`       | topic, map, index, path if relevant, log                             |
| `lint`         | checks + log                                                         |
| `query-update` | answer user, then smallest useful wiki writeback, map if needed, log |

## Canonical Rules

- `docs/wiki/sources/internal-docs-map.md` is the runtime source of truth
- A publish doc is covered only when it appears in the map and is linked under the matching topic page `关联文档`
- Use explicit `primary` / `secondary` sections in the map; never encode mapping type as prose suffixes
- Every topic page must include:
  - 一句话总结
  - 适用场景
  - 核心概念
  - 常见误区
  - 证据状态
  - 最近更新
  - 关联文档
  - 来源
- Every index entry must include: link, one-line summary, `updated`, source count
- No silent wiki edits; every operation appends to `docs/wiki/log.md`

## Workflows

### Backfill

1. Read the publish doc.
2. Map it to one primary topic and any needed secondary topics.
3. Distill stable conclusions into the topic page.
4. Update `internal-docs-map.md`.
5. Update `index.md` only if navigation changes.
6. Append `backfill` to `log.md`.

### Ingest

1. Classify the new publish doc by topic.
2. Prefer updating an existing topic.
3. Update touched topic pages, `internal-docs-map.md`, `index.md`, and relevant path pages.
4. Ensure touched topics include `证据状态` and `最近更新`.
5. Append `ingest` to `log.md`.

### Lint

Check:

- required files exist
- frontmatter fields are complete
- tags are valid per `SCHEMA.md`
- map/topic links are in sync
- orphan docs and broken links
- missing `来源`
- stale pages, duplicate topics, oversized pages
- unverifiable statements
- index metadata completeness
- topic `证据状态` / `最近更新` presence

Append `lint` to `log.md` with findings and follow-up.

### Query-Update

1. Answer the user first.
2. Extract the reusable knowledge delta.
3. Apply the smallest useful writeback in the same turn by default.
4. Update `internal-docs-map.md` if document relationships changed.
5. Append `query-update` to `log.md`.

Do not paste raw conversation into the wiki.

## Source Priority

1. Official Vitest docs
2. Project publish docs under `docs/NNN-xxx.md`
3. Explicitly marked experience notes

Unverified claims must be marked `待验证`.

## Conflict Tracking

If lint or ingest finds contradictions, add `conflict-open` in `log.md`. After reconciling the page, add `conflict-resolved`.
