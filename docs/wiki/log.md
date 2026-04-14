# Wiki Log

## 2026-04-14

- `schema-create`
  - changed:
    - `docs/wiki/SCHEMA.md`
    - `.claude/skills/wiki-maintainer/references/schema-template.md`
  - note: 建立项目级 wiki 宪法与通用 SCHEMA 模板，定义 domain、命名规范、frontmatter、tag taxonomy、页面阈值、更新策略、stale content 与 query-update 标准

- `frontmatter-update`
  - changed:
    - `docs/wiki/topics/assertions.md`
    - `docs/wiki/topics/execution-model.md`
    - `docs/wiki/topics/hooks.md`
    - `docs/wiki/topics/environment.md`
    - `docs/wiki/topics/mocking.md`
    - `docs/wiki/topics/typing.md`
    - `docs/wiki/topics/modules.md`
    - `docs/wiki/topics/snapshots.md`
    - `docs/wiki/paths/beginner-path.md`
    - `docs/wiki/paths/mocking-path.md`
    - `docs/wiki/paths/environment-path.md`
    - `docs/wiki/sources/official-docs.md`
    - `docs/wiki/sources/internal-docs-map.md`
  - note: 为所有 wiki 层页面统一添加 YAML frontmatter（title, created, updated, type, tags, sources）

- `wikilinks-update`
  - changed:
    - `docs/wiki/index.md`
    - `docs/wiki/topics/assertions.md`
    - `docs/wiki/topics/execution-model.md`
    - `docs/wiki/topics/hooks.md`
    - `docs/wiki/topics/environment.md`
    - `docs/wiki/topics/mocking.md`
    - `docs/wiki/topics/typing.md`
    - `docs/wiki/topics/modules.md`
    - `docs/wiki/topics/snapshots.md`
    - `docs/wiki/paths/beginner-path.md`
    - `docs/wiki/paths/mocking-path.md`
    - `docs/wiki/paths/environment-path.md`
  - note: 在 wiki 层引入 [[wikilinks]] 互链；index.md 与 topic/path 页均增加至少 2 个出站 wikilink

- `skill-update`
  - changed:
    - `.claude/skills/wiki-maintainer/SKILL.md`
  - note: 扩展 lint 检查清单（增加 SCHEMA、frontmatter、wikilinks、stale content、page size、log rotation、contradictions 等 12 项检查），并在 Required Files 中增加 SCHEMA.md

- `lint`
  - changed:
    - `docs/wiki/log.md`
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
    - `docs/wiki/index.md`
    - `docs/wiki/paths/beginner-path.md`
    - `docs/wiki/paths/environment-path.md`
    - `docs/wiki/paths/mocking-path.md`
    - `docs/wiki/sources/internal-docs-map.md`
    - `docs/wiki/sources/official-docs.md`
    - `docs/wiki/topics/assertions.md`
    - `docs/wiki/topics/environment.md`
    - `docs/wiki/topics/execution-model.md`
    - `docs/wiki/topics/hooks.md`
    - `docs/wiki/topics/mocking.md`
    - `docs/wiki/topics/modules.md`
    - `docs/wiki/topics/snapshots.md`
    - `docs/wiki/topics/typing.md`
  - source: `docs/001-expect-custom-message.md` 到 `docs/012-mock-cleanup-methods.md`
  - note: 建立首批 topic 和 path 页面，并完成现有文档到 wiki 的映射

- `ingest`
  - changed:
    - `docs/wiki/sources/internal-docs-map.md`
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
    - `docs/wiki/log.md`
    - `docs/wiki/sources/internal-docs-map.md`
    - `docs/wiki/topics/hooks.md`
    - `docs/wiki/topics/mocking.md`
    - `docs/wiki/topics/modules.md`
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
