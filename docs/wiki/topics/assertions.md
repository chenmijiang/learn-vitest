---
title: Assertions
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["assertion", "beginner"]
sources:
  - https://cn.vitest.dev/api/expect.html
  - ../../001-expect-custom-message.md
---

# Assertions

## 一句话总结

断言是 Vitest 测试的结果判断层；在这个项目里，先掌握 `expect` 的基本判断，再理解如何让失败信息更容易定位。

### 相关主题

- [[hooks]]
- [[execution-model]]

## 适用场景

- 校验函数返回值和对象结构
- 在业务测试里补充更明确的失败提示
- 从 Jest 迁移到 Vitest 时识别 `expect` 的差异

## 核心概念

### `expect` 的职责

`expect` 负责表达“实际结果应该满足什么条件”，是测试中最直接的反馈点。

### 自定义错误消息

Vitest 支持为 `expect` 传入自定义错误消息，适合在循环、批量校验、业务对象断言中提升可读性。

## 常见误区

- 只关注断言是否通过，不关注失败信息是否能帮助快速定位问题
- 用过多复杂断言把真正的业务意图埋掉

## 证据状态

- 已验证：`expect` 基础语义和自定义消息能力来自官方 API 文档。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-04-14 ingest：补充“失败信息可定位性”作为断言设计原则，统一与 execution-model 的引用关系。

## 关联文档

- [001-expect-custom-message.md](../../001-expect-custom-message.md)

## 来源

- https://cn.vitest.dev/api/expect.html
- [001-expect-custom-message.md](../../001-expect-custom-message.md)
