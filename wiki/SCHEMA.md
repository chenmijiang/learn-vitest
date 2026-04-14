---
title: Wiki Schema
created: 2026-04-14
updated: 2026-04-14
type: summary
tags: []
sources:
  - ../../docs/AGENTS.md
  - https://gist.githubusercontent.com/karpathy/442a6bf555914893e9891c11519de94f/raw/ac46de1ad27f92b28ac95459c782c07f6b8c964a/llm-wiki.md
---

# Wiki Schema

## Domain

Vitest 初学者学习 wiki。聚合项目内发布文档与官方资料，帮助有前端经验但刚接触 Vitest 的读者快速建立可复用的知识结构。

## Related Pages

- [[index]]
- [[sources/internal-docs-map]]
- [[log]]

## Conventions

- File names: lowercase, hyphens, no spaces
  - Publish docs: `docs/NNN-xxx.md`
  - Wiki pages: `topics/xxx.md`, `paths/xxx.md`, `sources/xxx.md`
- Every wiki page starts with YAML frontmatter (see below)
- Use `[[wikilinks]]` to link between wiki layer pages (minimum 2 outbound links per page)
- Use standard Markdown relative links when referencing publish docs (`docs/NNN-xxx.md`)
- When updating a page, always bump the `updated` date
- Every new wiki page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`
- `index.md` entries must include: link, one-line summary, updated date, source count

## Frontmatter

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: topic | path | source | summary
tags: [from taxonomy below]
sources:
  - https://cn.vitest.dev/...
  - ../../docs/NNN-xxx.md
---
```

Required fields: `title`, `created`, `updated`, `type`, `tags`, `sources`.

## Tag Taxonomy

- **api**: 核心测试 API（test, expect, describe, hooks, vi）
- **config**: 配置与环境（vitest.config.ts, environment, projects）
- **lifecycle**: 测试生命周期（beforeEach, afterEach, aroundEach, execution order）
- **environment**: 测试环境（node, jsdom, happy-dom, browser mode）
- **parallelism**: 并发与顺序执行（concurrent, sequential, sharding）
- **mock**: Mock 相关技术（vi.mock, vi.fn, vi.spyOn, vi.mockObject）
- **spy**: 监听与断言交互（vi.fn, vi.spyOn, call history）
- **snapshot**: 快照测试（toMatchSnapshot, inline snapshot）
- **assertion**: 断言技巧（expect, custom messages, matchers）
- **coverage**: 覆盖率（v8, istanbul, coverage config）
- **browser**: 浏览器模式与组件测试
- **migration**: 从 Jest 等框架迁移
- **troubleshooting**: 常见问题与调试
- **beginner**: 适合初学者优先阅读
- **advanced**: 进阶或特定场景内容

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
- 证据状态（`已验证` / `待验证` / `冲突中`）
- 最近更新（列出最近一次 ingest/backfill/query-update 的变化点）
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
3. It can be expressed as a short reusable conclusion (plus optional minimal example)
4. Prefer updating an existing topic page; create a new topic only when no existing page can host it cleanly

## Log Rotation

When `log.md` exceeds 500 entries, rotate: rename to `log-YYYY.md`, start fresh.

## Canonical Mapping Format

`wiki/sources/internal-docs-map.md` is the only canonical mapping file and must use explicit `primary` / `secondary` sub-lists for each topic section.

Example:

```md
## Mocking

### primary

- [007-vi-mock-guide.md](../../docs/007-vi-mock-guide.md)

### secondary

- [009-vi-mocked-type-helper.md](../../docs/009-vi-mocked-type-helper.md)
```

Do not encode mapping type in prose suffixes like `（secondary）`.
