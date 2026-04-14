---
title: Modules
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["mock", "advanced"]
sources:
  - https://cn.vitest.dev/api/vi
  - https://cn.vitest.dev/guide/mocking/modules
  - ../../010-vi-dynamic-import-settled.md
  - ../../011-mockobject-vs-other-mocking-apis.md
---

# Modules

## 一句话总结

模块相关能力主要处理“导入时机”和“模块初始化副作用”；动态导入场景下，最重要的是知道 Vitest 到底在等什么。

### 相关主题

- [[mocking]]
- [[typing]]

## 适用场景

- 代码里触发了拿不到 Promise 的动态导入
- 需要等待导入链和其副作用完成后再断言
- 想区分模块 mocking 和对象 mocking

## 核心概念

### `vi.dynamicImportSettled`

它用于等待已经触发但你手里没有 Promise 的动态导入链稳定下来。

### 模块加载时机

模块测试很多问题都来自“导入发生在何时”和“副作用发生在何时”，而不是断言本身。

## 常见误区

- 把 `vi.dynamicImportSettled` 当成等待一切异步任务的通用工具
- 没分清模块层面的替换和对象层面的改写

## 关联文档

- [010-vi-dynamic-import-settled.md](../../010-vi-dynamic-import-settled.md)
- [011-mockobject-vs-other-mocking-apis.md](../../011-mockobject-vs-other-mocking-apis.md)

## 来源

- https://cn.vitest.dev/api/vi
- https://cn.vitest.dev/guide/mocking/modules
- [011-mockobject-vs-other-mocking-apis.md](../../011-mockobject-vs-other-mocking-apis.md)
