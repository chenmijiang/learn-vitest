---
title: Projects
created: 2026-04-15
updated: 2026-04-15
type: topic
tags: ["config", "beginner", "troubleshooting"]
sources:
  - https://cn.vitest.dev/guide/projects
  - https://vitest.dev/guide/projects
  - https://vitest.dev/api/advanced/vitest
  - https://vitest.dev/config/include
---

# Projects

## 一句话总结

`test.projects` 用来定义“有哪些项目”，而每个项目自己的 `test.include` 用来定义“这个项目里哪些文件是测试”；根配置默认不是项目本身，所以项目配置不会自动继承根配置里的 `include` 等选项。

## 相关主题

- [[environment]]
- [[execution-model]]

## 适用场景

- monorepo 里按包拆分多个 Vitest 项目
- 同一仓库里区分 `unit`、`integration`、`browser` 等不同测试项目
- 排查“根配置生效了，但子项目的 `vitest.config` 看起来没生效”的问题

## 核心概念

### `test.projects` 只负责选项目

`projects` 里的目录、配置文件或 glob 模式，决定 Vitest 要解析哪些项目。

### `test.include` 只负责选测试文件

`include` 是在单个项目内部找测试文件，不是用来挑选子项目目录。把根配置里的 `test.include` 写成 `packages/**` 这一类路径，本质上是在改“根项目怎么找测试文件”，不是在告诉 Vitest “这些包是项目”。

### 根配置默认不是一个测试项目

官方文档明确说明：定义了 `projects` 之后，根 `vitest.config` 默认不会被当成其中一个项目。它主要影响根级能力，例如 `reporters`、`coverage`，以及根配置里注册的部分插件钩子。

### 项目配置默认不继承根配置

官方文档在 `Projects -> Configuration` 里明确说明：项目配置默认不继承根级配置。想复用根配置，需要显式做一层共享：

- 内联项目配置可用 `extends: true`
- 独立 `vitest.config.ts` 可用共享配置文件加 `mergeConfig(...)`

## 常见误区

- 误把根配置的 `test.include` 当成“项目发现规则”；真正控制项目发现的是 `test.projects`
- 看到根配置里写了 `include`，就以为子项目会自动继承同一套匹配规则
- 以为“根配置不继承到子项目”代表根配置完全没作用；实际上根配置仍然控制一部分全局能力和根级插件行为

## 证据状态

- 已验证：`projects` 的职责、根配置默认不是项目、项目配置默认不继承根配置，均来自 Vitest 官方 `Projects` 与 Advanced API 文档。
- 待验证：不同 Vitest 大版本对少数边缘选项的支持范围可能变化，排查具体版本行为时仍应回到当前版本文档。
- 冲突中：无。

## 最近更新

- 2026-04-15 query-update：补充 `test.projects` 与 `test.include` 的层级区分，明确“根配置默认不是项目”和“项目配置默认不继承根配置”这两个最容易混淆的点。

## 关联文档

- 当前暂无项目内 `docs/NNN-*.md` 专门覆盖 `projects` 主题。

## 来源

- https://cn.vitest.dev/guide/projects
- https://vitest.dev/guide/projects
- https://vitest.dev/api/advanced/vitest
- https://vitest.dev/config/include
