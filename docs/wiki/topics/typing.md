---
title: Typing
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["mock", "advanced"]
sources:
  - https://cn.vitest.dev/api/vi
  - https://cn.vitest.dev/guide/mocking
  - ../../009-vi-mocked-type-helper.md
---

# Typing

## 一句话总结

类型辅助的价值不在“让 mock 能跑”，而在“让 TypeScript 正确理解 mock 之后的函数和对象形态”。

### 相关主题

- [[mocking]]
- [[modules]]

## 适用场景

- TypeScript 中使用被 mock 的函数时缺少类型提示
- 需要深度 mock 或部分 mock 的类型补全
- 想避免到处写重复断言或类型转换

## 核心概念

### `vi.mocked`

它是类型助手，用来告诉 TypeScript：这个值现在应该按 mock 后的类型来理解。

### deep / partial

不同选项对应不同程度的 mock 类型推断，适用场景不一样。

## 常见误区

- 以为 `vi.mocked` 会执行 mock 行为，它只影响类型层
- 在对象层级很深时滥用 deep mock，导致类型和意图都变得难读

## 证据状态

- 已验证：`vi.mocked` 的类型助手定位有官方 API 与项目文档支撑。
- 待验证：复杂 deep/partial 组合在大型 TS 项目中的可维护性更多属于经验结论，必要时应结合实际代码验证。
- 冲突中：无。

## 最近更新

- 2026-04-14 backfill：明确 typing 页只讨论“类型解释”，不重复承载 mock 行为本身，减少与 mocking 页重叠。

## 关联文档

- [009-vi-mocked-type-helper.md](../../009-vi-mocked-type-helper.md)

## 来源

- https://cn.vitest.dev/api/vi
- https://cn.vitest.dev/guide/mocking
- [009-vi-mocked-type-helper.md](../../009-vi-mocked-type-helper.md)
