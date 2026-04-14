---
title: Hooks
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["lifecycle", "beginner"]
sources:
  - https://cn.vitest.dev/api/hooks
  - https://cn.vitest.dev/guide/lifecycle
  - ../../003-beforeeach-aftereach-order.md
  - ../../004-aroundEach.md
---

# Hooks

## 一句话总结

Hooks 负责测试前后的准备与清理；理解执行顺序和包裹式 hook，才能写出可复用且不互相污染的测试。

### 相关主题

- [[execution-model]]
- [[environment]]

## 适用场景

- 需要在每个测试前创建固定上下文
- 需要在测试后清理状态、资源或副作用
- 需要把 setup 和 cleanup 写成一个闭环

## 核心概念

### `beforeEach` / `afterEach`

它们适合做常规初始化和资源清理，重点是弄清嵌套和异步场景下的执行顺序。

在当前项目的结论里，可以先记成一条稳定规则：`beforeEach -> 测试体 -> afterEach -> cleanup`。如果 `beforeEach` 返回的是 cleanup 函数，这个 cleanup 会在对应测试结束后执行，而不是在 setup 刚完成时执行。

### `aroundEach`

`aroundEach` 适合把一次测试包裹进统一的事务、上下文或性能测量逻辑里。

它的关键契约是“在 hook 内显式调用 `runTest()` 来执行被包裹的测试逻辑”。如果存在嵌套，外层和内层会形成包裹关系，而不是简单追加到 `beforeEach/afterEach` 队列里。

## 常见误区

- 误以为返回任意 Promise 都会变成 cleanup
- 把过多业务逻辑塞进 hooks，导致测试本身难读

## 证据状态

- 已验证：`beforeEach/afterEach` 与 `aroundEach` 的基本契约来自官方 hooks/lifecycle 文档与项目实证文档。
- 待验证：跨版本在细节时序上的实现变化需以当前版本官方文档为准。
- 冲突中：无。

## 最近更新

- 2026-04-14 backfill：补充 `runTest()` 必须调用这一 aroundEach 核心契约，并将其与 execution-model 页面互链。

## 关联文档

- [003-beforeeach-aftereach-order.md](../../003-beforeeach-aftereach-order.md)
- [004-aroundEach.md](../../004-aroundEach.md)

## 来源

- https://cn.vitest.dev/api/hooks
- https://cn.vitest.dev/guide/lifecycle
- [003-beforeeach-aftereach-order.md](../../003-beforeeach-aftereach-order.md)
- [004-aroundEach.md](../../004-aroundEach.md)
