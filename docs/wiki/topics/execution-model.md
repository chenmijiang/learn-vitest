---
title: Execution Model
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["parallelism", "lifecycle"]
sources:
  - https://cn.vitest.dev/api/test
  - https://cn.vitest.dev/guide/parallelism
  - ../../002-concurrent-sequential.md
---

# Execution Model

## 一句话总结

理解测试是顺序执行还是并发执行，会直接影响测试隔离性、性能判断和断言写法。

### 相关主题

- [[hooks]]
- [[assertions]]

## 适用场景

- 需要区分 `test.concurrent` 与默认执行方式
- 想优化测试速度，但不希望引入共享状态污染
- 需要判断某个测试为什么在并发下行为不同

## 核心概念

### 默认顺序执行

默认测试更适合依赖共享资源或需要稳定排查顺序的场景。

### 并发执行

并发执行更适合相互独立的测试，但要避免共享可变状态。

### 本地 `expect`

在并发测试中，应优先使用测试上下文提供的本地 `expect`，避免全局断言带来的混淆。

## 常见误区

- 把并发执行误解成“所有代码会无序同时运行”
- 在共享外部资源时直接切到 `test.concurrent`

## 关联文档

- [002-concurrent-sequential.md](../../002-concurrent-sequential.md)

## 来源

- https://cn.vitest.dev/api/test
- https://cn.vitest.dev/guide/parallelism
- [002-concurrent-sequential.md](../../002-concurrent-sequential.md)
