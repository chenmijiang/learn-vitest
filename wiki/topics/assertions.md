---
title: Assertions
created: 2026-04-14
updated: 2026-04-15
type: topic
tags: ["assertion", "beginner"]
sources:
  - https://cn.vitest.dev/api/expect.html
  - https://vitest.dev/api/assert
  - https://www.chaijs.com/guide/styles/
  - ../../docs/001-expect-custom-message.md
  - ../../docs/013-expect-foundation-chain-and-assert.md
---

# Assertions

## 一句话总结

断言是 Vitest 测试的结果判断层；先掌握 `expect` 的常用写法，再理解它与 Chai、Jest 兼容层和 `assert` 风格之间的关系。

### 相关主题

- [[hooks]]
- [[execution-model]]

## 适用场景

- 校验函数返回值和对象结构
- 在业务测试里补充更明确的失败提示
- 从 Jest 迁移到 Vitest 时识别 `expect` 的差异
- 理解 `expect` 与 `assert` 的风格差异

## 核心概念

### `expect` 的职责

`expect` 负责表达“实际结果应该满足什么条件”，是测试中最直接的反馈点。

### `expect` 的底座

Vitest 的 `expect` 默认提供 Chai assertions，并在其上提供 Jest-compatible assertions；可以把它理解为“Chai 底座 + Jest 风格 matcher 兼容层”。

### 自定义错误消息

Vitest 支持为 `expect` 传入自定义错误消息，适合在循环、批量校验、业务对象断言中提升可读性。

### `assert` 的关系

`assert` 不是另一套完全独立的系统，而是同样建立在 Chai 之上的另一种断言风格。`expect` 更偏链式 BDD 风格，`assert` 更偏函数式 TDD 风格。

## 常见误区

- 只关注断言是否通过，不关注失败信息是否能帮助快速定位问题
- 用过多复杂断言把真正的业务意图埋掉
- 把 `expect` 和 `assert` 误解为两套完全不同能力的 API
- 把“为什么默认链式断言”误解成纯语法偏好，而忽略状态组合和扩展机制

## 证据状态

- 已验证：`expect` 的基础语义、自定义消息、`assert` API 与 BDD/TDD 风格区分都有官方来源。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-04-14 ingest：补充“失败信息可定位性”作为断言设计原则，统一与 execution-model 的引用关系。
- 2026-04-15 query-update：补充 `expect` 的 Chai 底座、Jest 兼容层、链式断言动机，以及 `expect` 与 `assert` 的关系。

## 关联文档

- [001-expect-custom-message.md](../../docs/001-expect-custom-message.md)
- [013-expect-foundation-chain-and-assert.md](../../docs/013-expect-foundation-chain-and-assert.md)

## 来源

- https://cn.vitest.dev/api/expect.html
- https://vitest.dev/api/assert
- https://www.chaijs.com/guide/styles/
- [001-expect-custom-message.md](../../docs/001-expect-custom-message.md)
- [013-expect-foundation-chain-and-assert.md](../../docs/013-expect-foundation-chain-and-assert.md)
