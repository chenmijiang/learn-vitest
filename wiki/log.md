---
title: Wiki Log
created: 2026-04-14
updated: 2026-05-29
type: summary
tags: []
sources:
  - ./SCHEMA.md
  - ./sources/internal-docs-map.md
---

# Wiki Log

> 维护规则见 [[SCHEMA]]；主题导航见 [[index]]；文档映射以 [[sources/internal-docs-map]] 为准。

## 2026-05-29

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://vitest.dev/guide/browser/locators
  - note: 在 [[component-testing]] 新增 "Locator：惰性、可重试的元素句柄" 一节，澄清用户对"locator 是 testing-library 封装"的误解——`page.getBy*` 返回 locator（非元素，与 testing-library 立即返回元素不同），三特性（惰性求值 / 自动重试 / 可组合），`element()/query()/elements()` 与 `expect.element` 的关系；并明确"封装"的准确性质：`getBy*` 对齐 testing-library 语义/命名，但实现 fork 自 Playwright locators（`Ivya`），真正被封装的是 provider 层（playwright 原生、webdriverio/preview 转 CSS 选择器）。新增官方 locators 来源（sources 7→8）。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
  - note: 在 [[component-testing]] "核心概念"前置新增 "ARIA：role 与 accessible name（查询的语义地基）" 一节，解释 role（多数来自原生标签隐含角色）与 accessible name（`aria-labelledby`/`aria-label`/`<label>`/文本/`title`）的来源及其与 `getByRole` / `getByLabelText` 的对应关系，点明"优先语义化原生 HTML"的 ARIA 第一法则，作为查询优先级的语义背景。新增 MDN ARIA 来源（sources 6→7）。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/guide/browser/
  - note: 在 [[environment]] 证据状态补记一条已验证事实——Browser Mode 经 `test.browser.enabled: true` 启用（独立于 `environment` 字段，需 `provider` + `instances`），官方 `guide/browser/` 已移除 "experimental" 标记。源自本日 lint 的官方文档抽检；本页历来未声称其实验性，故仅作正向记录、未改动正文措辞。未新增 `docs/NNN-xxx.md`，来源已在页内 sources 列表中，`internal-docs-map.md` 无需变更。

- `lint`（整体巡检）
  - mechanical：`bun run .claude/skills/wiki-maintainer/scripts/lint.ts` → clean（无孤儿文档、map↔关联文档一致、无失效链接、必含章节齐全）
  - 结构：11 个 topic 全部含完整 8 段（一句话总结 / 适用场景 / 核心概念 / 常见误区 / 证据状态 / 最近更新 / 关联文档 / 来源）；frontmatter 完整，tags 全部在 SCHEMA 分类内
  - 体量：最大页 component-testing 150 行，均未超 ~200 行拆分阈值；`log.md` 414 行（< 500 条轮转阈值）
  - 时效：最旧 `updated` 为 typing/modules 2026-04-14（距今约 45 天），未触发 90 天 stale 阈值
  - 内容校验（vitest-doc-verifier，对照官方文档）：
    - [[visual-regression]]：`toMatchScreenshot`、`__screenshots__` 基准、`test.browser.expect.toMatchScreenshot` 下 `comparatorName: 'pixelmatch'` + `comparatorOptions.allowedMismatchedPixelRatio`、`name-browser-platform.png` 文件名、stable screenshot detection 全部 VERIFIED
    - [[component-testing]]：`userEvent` 从 `vitest/browser` 引入、默认实例为单例、`setup()` 仍推荐 全部 VERIFIED
    - [[environment]]：`test.browser`（需 `provider` + `instances`）、`browser.enabled` 独立于 `environment` 字段 VERIFIED；另确认官方已移除 Browser Mode 的 "experimental" 标记——经核查本项目 topic 页并未声称其为实验性，故无需修正
  - 结论：本轮无需内容改动；wiki 与官方文档一致。

## 2026-05-29

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/visual-regression.md`（新建）
  - source:
    - https://cn.vitest.dev/guide/browser/visual-regression-testing.html
  - note: 新建 [[visual-regression]] 主题页，沉淀 Browser Mode 下的视觉回归测试：概念上拆"可视化外观 + 回归对比"、与功能测试和文本 [[snapshots]] 的区别、`toMatchScreenshot` 用法、`__screenshots__` 基准目录（需提交 git）、稳定截图检测机制、`comparatorName: 'pixelmatch'` 与 `allowedMismatchedPixelRatio` 配置、稳定性最佳实践（只截元素 / `mask` 遮盖动态内容 / 禁用动画 / 固定视口 / 统一 CI 环境）、跨平台文件名差异（`name-chromium-darwin.png`）、基准更新走手动工作流。组件测试方法论已在 [[component-testing]]，故另起独立 topic 避免该页膨胀。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-27

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://testing-library.com/docs/user-event/setup
    - https://vitest.dev/guide/browser/interactivity-api
  - note: 在 [[component-testing]] 新增 "user-event：setup 实例 vs 直接调用"，沉淀 `setup()` 的三个动机（共享输入设备状态、可传选项如 `advanceTimers`/`delay`/`pointerEventsCheck`、替换 clipboard stub）、直接调用在 testing-library 的 v13→v14 过渡定位，以及 Vitest Browser Mode 下从 `vitest/browser` 引入的 `userEvent` 是单例（与 `@testing-library/user-event` 不同），但 setup 仍然必要用于测试间隔离与传配置。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-26

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/config/setupfiles
    - https://cn.vitest.dev/config/globalsetup
    - https://cn.vitest.dev/guide/lifecycle
  - note: 在 [[hooks]] 新增配置层 `setupFiles` 与 `globalSetup` 与文件内 hooks 的三层 setup 边界（执行频率、进程归属、teardown 顺序、`project.provide` + `inject` 传值、`sequence.setupFiles`、`setupFiles` 导出被忽略），补充 setup 文件按"作用域 + 环境"两维拆分的组织建议，以及 matcher 注入误放 `globalSetup`、容器/数据库误放 `setupFiles` 等典型误区；并在 [[environment]] 的"依赖选择"末尾加一行跨主题指引，指向 [[hooks]] 处理 setup 文件层级。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
    - `wiki/topics/environment.md`
  - source:
    - https://testing-library.com/docs/queries/about/#priority
    - https://testing-library.com/docs/dom-testing-library/api-events
    - https://github.com/vitest-community/vitest-browser-react
    - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
  - note: 新建 [[component-testing]] 主题页，沉淀 Browser Mode 下 RTL 方法论：查询优先级三档分类（accessible > semantic > test ids）、`fireEvent` 的 target 赋值 + dispatch 语义和 file input 的 `Object.defineProperty` 兜底、`fireEvent` vs `user-event` 的官方偏向、断言风格差异、`<input type="date">` 的 `YYYY-MM-DD` 规范化坑；同时把 [[environment]] 里的 RTL 方法论描述收拢成一行交叉链接，环境页只保留选型结论。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-22

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://github.com/facebook/react/blob/main/CHANGELOG.md
    - https://github.com/testing-library/react-testing-library
    - https://github.com/vitest-community/vitest-browser-react
  - note: 在 Environment 主题下新增 Browser Mode 下的 React 组件测试库选型，明确 React 19 起 `react-dom/test-utils` 移除、`react-test-renderer` 弃用并被官方点名替换为 RTL；本项目用 `vitest-browser-react` 即可，不应再叠加 `@testing-library/react`。

## 2026-04-22

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/guide/environment
    - https://vitest.dev/config/environmentoptions
    - https://cn.vitest.dev/guide/browser/
  - note: 补充“浏览器环境但不是 Browser Mode”应优先使用 `jsdom` 或 `happy-dom` 的判断，并明确它们与 `@vitest/browser-*` provider 依赖不是一回事。

## 2026-04-20

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/snapshots.md`
  - source:
    - https://cn.vitest.dev/guide/snapshot
    - https://cn.vitest.dev/config/snapshotformat
    - https://cn.vitest.dev/config/snapshotserializers
    - ../../docs/005-snapshot-testing.md
  - note: 补充快照自定义序列化器的直白解释，明确 `test` / `serialize` / `printer` 的分工，并区分 `expect.addSnapshotSerializer`、`snapshotFormat`、`snapshotSerializers` 的职责边界。

## 2026-04-16

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://vitest.dev/guide/features
    - https://vitest.dev/config/#env
    - https://vite.dev/config/shared-options#define
  - note: 补充 `test.env` 与 `define` 的差异，明确前者是测试运行时环境变量注入，后者是转换期常量替换，并记录测试侧通过 `process.env`、`import.meta.env` 或定义的常量标识符读取的边界。

## 2026-04-15

- `ingest`
  - changed:
    - `docs/014-vitest-projects-config-and-extends.md`
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/projects.md`
  - source:
    - https://cn.vitest.dev/guide/projects
    - https://vitest.dev/guide/projects
    - https://vitest.dev/config/include
    - https://vitest.dev/api/advanced/vitest
    - https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/types/config.ts
    - https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/public/config.ts
  - note: 新增一篇围绕 `test.projects`、配置继承边界、`extends` 适用范围和 `defineProject` 类型约束的发布型文档，并将其映射到 `Projects` topic。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/paths/environment-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/projects.md`
  - source:
    - https://cn.vitest.dev/guide/projects
    - https://vitest.dev/guide/projects
    - https://vitest.dev/api/advanced/vitest
    - https://vitest.dev/config/include
  - note: 新增 `Projects` 主题页，明确 `test.projects` 负责项目发现、`test.include` 负责项目内测试文件匹配，并补充“根配置默认不是项目”和“项目配置默认不继承根配置”的排查结论。

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
