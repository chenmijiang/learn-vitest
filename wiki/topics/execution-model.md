---
title: Execution Model
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["parallelism", "lifecycle"]
sources:
  - https://cn.vitest.dev/api/test
  - https://cn.vitest.dev/guide/parallelism
  - ../../docs/002-concurrent-sequential.md
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

### 判断并发是否真的生效

判断重点不是日志顺序，而是总耗时是否重叠、共享状态是否被隔离。看到 start/end 输出看似有序，并不代表测试仍然是顺序执行。

## 常见误区

- 把并发执行误解成“所有代码会无序同时运行”
- 在共享外部资源时直接切到 `test.concurrent`

## 证据状态

- 已验证：默认执行模型、并发 API 和本地 `expect` 约束有官方文档与项目文档双重来源。
- 待验证：不同版本对并发细节的描述可能随实现演进变化，涉及版本差异时应回到官方文档确认。
- 冲突中：无。

## 最近更新

- 2026-04-14 ingest：从项目文档提炼“总耗时优先于日志顺序”的判断方法，避免把 trace 顺序误读为执行模型。

## 关联文档

- [002-concurrent-sequential.md](../../docs/002-concurrent-sequential.md)

## 来源

- https://cn.vitest.dev/api/test
- https://cn.vitest.dev/guide/parallelism
- [002-concurrent-sequential.md](../../docs/002-concurrent-sequential.md)
