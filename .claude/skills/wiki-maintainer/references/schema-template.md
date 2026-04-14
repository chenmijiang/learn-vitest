# Wiki Schema Template

> 通用 SCHEMA 模板，供项目级 `docs/wiki/SCHEMA.md` 实例化使用。
> 每个 wiki 应在 `docs/wiki/SCHEMA.md` 中有一份针对自身领域的定制版本。

## Domain

[What this wiki covers — e.g., "Vitest learning notes", "AI/ML research", "startup intelligence"]

## Conventions

- File names: lowercase, hyphens, no spaces
  - Publish docs: `NNN-xxx.md`
  - Wiki pages: `topics/xxx.md`, `paths/xxx.md`, `sources/xxx.md`
- Every wiki page starts with YAML frontmatter (see below)
- Use `[[wikilinks]]` to link between wiki layer pages (minimum 2 outbound links per page)
- Use standard Markdown relative links when referencing publish docs (`docs/NNN-xxx.md`)
- When updating a page, always bump the `updated` date
- Every new wiki page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`

## Frontmatter

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: topic | path | source | summary
tags: [from taxonomy below]
sources:
  - https://example.com
  - ../../NNN-xxx.md
---
```

Required fields: `title`, `created`, `updated`, `type`, `tags`, `sources`.

## Tag Taxonomy

Define 10-20 top-level tags for the domain. Add new tags here BEFORE using them.

Example for a testing framework wiki:

- Concepts: api, config, lifecycle, environment, parallelism
- Techniques: mock, spy, snapshot, assertion, coverage
- Meta: beginner, advanced, browser, migration, troubleshooting

Rule: every tag on a page must appear in this taxonomy. If a new tag is needed, add it here first, then use it.

## Page Thresholds

- **Create a page** when an entity/concept appears in 2+ sources OR is central to one source
- **Add to existing page** when a source mentions something already covered
- **DON'T create a page** for passing mentions, minor details, or things outside the domain
- **Split a page** when it exceeds ~200 lines — break into sub-topics with cross-links
- **Archive a page** when its content is fully superseded — move to `_archive/`, remove from index, update inbound links

## Topic Pages

One page per topic. Include:

- 一句话总结
- 适用场景
- 核心概念
- 常见误区
- 关联文档 (`docs/NNN-xxx.md`)
- 来源（官方优先，可补充项目文档与经验说明）

## Path Pages

Learning paths or curated sequences. Include:

- 目标
- 建议顺序
- 配套主题（`[[wikilinks]]` 链接到 topic 页）
- 对应项目任务或验收标准

## Update Policy

When new information conflicts with existing content:

1. Check the dates — newer sources generally supersede older ones
2. If genuinely contradictory, note both positions with dates and sources
3. Mark the contradiction in frontmatter: `contradictions: [page-name]`
4. Flag for user review in the lint report

## Stale Content Policy

A page is considered stale if its `updated` date is >90 days older than the most recent source that mentions the same entities. Stale pages must be flagged during `lint` and scheduled for review.

## Query-Update Criteria

Only file a `query-update` when ALL of the following are true:

1. The conclusion is not explicitly covered by official docs or publish docs
2. The knowledge is likely to be reused within 3 months
3. It can be expressed in 3 sentences or less without introducing new code examples
4. There is an existing topic page that can host it (no new topic creation)

## Log Rotation

When `log.md` exceeds 500 entries, rotate: rename to `log-YYYY.md`, start fresh.
