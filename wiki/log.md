---
title: Wiki Log
created: 2026-04-14
updated: 2026-04-15
type: summary
tags: []
sources:
  - ./SCHEMA.md
  - ./sources/internal-docs-map.md
---

# Wiki Log

> 维护规则见 [[SCHEMA]]；主题导航见 [[index]]；文档映射以 [[sources/internal-docs-map]] 为准。

## 2026-04-15

- `lint`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
  - checks:
    - 必需文件、frontmatter、topic 必备章节、tag taxonomy
    - `internal-docs-map.md` 与 topic 页 `关联文档` 同步情况
    - `index.md` 条目的 `updated` / `sources` 元数据完整性
    - 相对链接、孤儿 docs、page size
  - findings:
    - 所有必需文件均存在，且 frontmatter、topic 必备章节、tags、相对链接检查通过
    - `internal-docs-map.md` 与各 topic 页 `关联文档` 保持同步，无孤儿 `docs/NNN-*.md`
    - `wiki/index.md` 中 `Execution Model` 与 `Mocking` 的 `updated` / `sources` 元数据落后于实际 topic 页面，现已修正
    - 当前所有 wiki 页面均低于 SCHEMA 建议的 ~200 行分拆阈值；`wiki/log.md` 为 260 行，尚未触发 500 条轮转规则
  - follow-up:
    - 后续每次 `query-update` 或 `ingest` 修改 topic 时，同步更新 `wiki/index.md` 的 `updated` 与 `sources`
    - 若继续频繁写入 `wiki/log.md`，接近 500 条时按 SCHEMA 执行 rotation
    - `Execution Model` 与 `Mocking` 近期更新较快，后续改动后优先复查索引元数据

- `ingest`
  - changed:
    - `docs/013-expect-foundation-chain-and-assert.md`
    - `wiki/index.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/assertions.md`
    - `wiki/log.md`
  - source:
    - https://vitest.dev/api/expect.html
    - https://vitest.dev/api/assert
    - https://vitest.dev/config/expect
    - https://vitest.dev/guide/features
    - https://vitest.dev/guide/extending-matchers
    - https://main.vitest.dev/guide/migration.html
    - https://github.com/vitest-dev/vitest/tree/main/packages/expect
    - https://www.chaijs.com/guide/styles/
    - https://www.chaijs.com/api/bdd/
    - https://www.chaijs.com/api/assert/
  - note: 新增一篇关于 `expect` 底座、链式断言、Jest 兼容层以及 `expect` 与 `assert` 关系的发布型文档，并同步写回 Assertions topic 与文档映射。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
  - note: 补充类 mock 的构造返回值语义，明确 `mockReturnValue` 等简写不适合类构造 mock；需要模拟类实例时优先使用 `mockImplementation(class { ... })`。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
  - note: 补充 `mockClear()` 的作用，明确它只清空调用历史，不重置 mock 实现，也不恢复原始方法。

- `query-update`
  - changed:
    - `wiki/topics/execution-model.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/vi.html
    - https://cn.vitest.dev/api/expect
    - https://cn.vitest.dev/api/test
  - note: 补充 Vitest 中等待异步完成的常见 API 分类，区分直接 `await`、`vi.waitFor()`、`vi.waitUntil()`、`expect.poll()`、`vi.dynamicImportSettled()` 与 fake timers 的异步推进方法。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
    - ../../docs/012-mock-cleanup-methods.md
  - note: 补充 `mockClear()`、`mockReset()`、`mockRestore()` 的边界，明确清历史、重置实现、恢复 `spyOn` 原始方法三者的区别。

## 2026-04-14

- `schema-update`
  - changed:
    - `AGENTS.md`
    - `wiki/SCHEMA.md`
    - `.claude/skills/wiki-maintainer/SKILL.md`
  - source:
    - https://gist.githubusercontent.com/karpathy/442a6bf555914893e9891c11519de94f/raw/ac46de1ad27f92b28ac95459c782c07f6b8c964a/llm-wiki.md
  - note: 对齐 LLM Wiki 的“持续复利”目标，新增 index 元数据要求、topic 证据状态/最近更新、结构化 primary/secondary 映射，以及 query-update 默认写回策略

- `ingest`
  - changed:
    - `wiki/index.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/topics/typing.md`
  - source:
    - `docs/001-expect-custom-message.md`
    - `docs/002-concurrent-sequential.md`
    - `docs/003-beforeeach-aftereach-order.md`
    - `docs/004-aroundEach.md`
    - `docs/005-snapshot-testing.md`
    - `docs/006-vitest-environment-extension.md`
    - `docs/007-vi-mock-guide.md`
    - `docs/008-vi-fn-spy-guide.md`
    - `docs/009-vi-mocked-type-helper.md`
    - `docs/010-vi-dynamic-import-settled.md`
    - `docs/011-mockobject-vs-other-mocking-apis.md`
    - `docs/012-mock-cleanup-methods.md`
  - note: 生成新版 wiki 内容，补齐 topic 证据状态与最近更新，并将 internal-docs-map 转为结构化 primary/secondary

- `lint`
  - changed:
    - `wiki/SCHEMA.md`
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
  - checks:
    - 必需文件是否存在，且是否包含 frontmatter
    - 非 topic/path 页面是否满足最少 wikilink 约束
    - topic 页面是否包含“证据状态”和“最近更新”
    - `internal-docs-map.md` 是否使用结构化 primary/secondary
    - `index.md` 条目是否包含摘要、updated、sources
  - findings:
    - `SCHEMA.md`、`index.md`、`log.md` 缺少 frontmatter，现已补齐
    - `official-docs.md` 与 `internal-docs-map.md` 缺少最少 2 个出站 wikilink，现已补齐
    - 三个 path 页面原先将 `TODO.md` 写成相对 `docs/` 的错误路径，现已修正到仓库根目录
    - 所有 topic 页面均已补齐新增段落
    - mapping 已移除自然语言 secondary 后缀，改为结构化分组
    - index 学习入口与主题导航条目均已补齐元数据
  - follow-up:
    - 后续新增 source/summary 页面时，也按 SCHEMA 检查 frontmatter 与 wikilinks
    - 后续新增 topic/path 时继续维护 index 元数据一致性

---

## 2026-04-14

- `schema-create`
  - changed:
    - `wiki/SCHEMA.md`
    - `.claude/skills/wiki-maintainer/references/schema-template.md`
  - note: 建立项目级 wiki 宪法与通用 SCHEMA 模板，定义 domain、命名规范、frontmatter、tag taxonomy、页面阈值、更新策略、stale content 与 query-update 标准

- `frontmatter-update`
  - changed:
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/typing.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/sources/official-docs.md`
    - `wiki/sources/internal-docs-map.md`
  - note: 为所有 wiki 层页面统一添加 YAML frontmatter（title, created, updated, type, tags, sources）

- `wikilinks-update`
  - changed:
    - `wiki/index.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/typing.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/paths/environment-path.md`
  - note: 在 wiki 层引入 [[wikilinks]] 互链；index.md 与 topic/path 页均增加至少 2 个出站 wikilink

- `skill-update`
  - changed:
    - `.claude/skills/wiki-maintainer/SKILL.md`
  - note: 扩展 lint 检查清单（增加 SCHEMA、frontmatter、wikilinks、stale content、page size、log rotation、contradictions 等 12 项检查），并在 Required Files 中增加 SCHEMA.md

- `lint`
  - changed:
    - `wiki/log.md`
  - checks:
    - `internal-docs-map.md` 与 topic 页关联文档是否一致
    - 所有 wiki 页面 frontmatter 是否完整
    - wikilink 出站链接是否满足最低数量
  - findings:
    - 所有 topic/path 页 frontmatter 已补齐
    - 所有 topic 页关联文档与 `internal-docs-map.md` 一致
    - wikilink 覆盖率已达标
  - follow-up:
    - 后续新增 wiki 页时同步维护 frontmatter 与 wikilinks
    - 建议 90 天后执行 stale content 复审

---

## 2026-04-14 (earlier)

- `backfill`
  - changed:
    - `wiki/index.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/topics/typing.md`
  - source: `docs/001-expect-custom-message.md` 到 `docs/012-mock-cleanup-methods.md`
  - note: 建立首批 topic 和 path 页面，并完成现有文档到 wiki 的映射

- `ingest`
  - changed:
    - `wiki/sources/internal-docs-map.md`
  - source:
    - `docs/001-expect-custom-message.md`
    - `docs/002-concurrent-sequential.md`
    - `docs/003-beforeeach-aftereach-order.md`
    - `docs/004-aroundEach.md`
    - `docs/005-snapshot-testing.md`
    - `docs/006-vitest-environment-extension.md`
    - `docs/007-vi-mock-guide.md`
    - `docs/008-vi-fn-spy-guide.md`
    - `docs/009-vi-mocked-type-helper.md`
    - `docs/010-vi-dynamic-import-settled.md`
    - `docs/011-mockobject-vs-other-mocking-apis.md`
    - `docs/012-mock-cleanup-methods.md`
  - note: 明确每篇发布型文档的 primary topic 与需要保留的 secondary topic，后续新增文档沿用同一规则

- `lint`
  - changed:
    - `wiki/log.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
  - checks:
    - `internal-docs-map.md` 与 topic 页关联文档是否一致
    - 是否存在 secondary 映射缺失
    - hooks 主题页是否提炼出可复用结论
  - findings:
    - 为 `009-vi-mocked-type-helper.md` 补齐 Mocking secondary 映射
    - 为 `011-mockobject-vs-other-mocking-apis.md` 补齐 Modules secondary 映射
    - 为 `hooks.md` 补齐执行顺序与 `runTest()` 契约摘要
  - follow-up:
    - 后续新增文档时同步维护 `internal-docs-map.md` 与 topic 页
