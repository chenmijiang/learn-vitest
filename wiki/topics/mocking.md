---
title: Mocking
created: 2026-04-14
updated: 2026-04-15
type: topic
tags: ["mock", "spy", "beginner"]
sources:
  - https://cn.vitest.dev/guide/mocking
  - https://cn.vitest.dev/guide/mocking/functions
  - https://cn.vitest.dev/guide/mocking/modules
  - https://cn.vitest.dev/api/mock
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
  - ../../docs/007-vi-mock-guide.md
  - ../../docs/008-vi-fn-spy-guide.md
  - ../../docs/009-vi-mocked-type-helper.md
  - ../../docs/011-mockobject-vs-other-mocking-apis.md
  - ../../docs/012-mock-cleanup-methods.md
---

# Mocking

## 一句话总结

Mocking 用来隔离外部依赖、控制副作用和验证交互；它是 Vitest 实战里最常见、也最容易写乱的一块。

### 相关主题

- [[typing]]
- [[modules]]

## 适用场景

- 替换 import 的模块实现
- 校验函数是否被调用、参数是否正确
- 避免请求、时间、数据库等不稳定因素影响测试

## 核心概念

### `vi.fn`

用于创建假函数，适合独立验证调用次数、入参和返回值。

### `vi.spyOn`

用于监听现有对象的方法，适合“保留原接口，只观察或局部改写行为”的场景。

### `vi.mock`

用于替换模块依赖，重点在于理解 hoisted 行为和工厂函数限制。

### 对象级与模块级 mocking

`vi.mockObject` 处理的是已存在对象属性，不能替代模块加载阶段的 `vi.mock`。

### 清理策略

`clearAllMocks`、`resetAllMocks`、`restoreAllMocks` 解决的问题不同，选错会让测试状态互相污染。

其中 `mockClear()` 只清空调用历史，比如 `mock.calls`、`mock.results`、`mock.instances`；它不会改动当前 mock 实现。适合在同一个测试内或相邻断言之间“清零计数”，但继续保留既有实现。

`mockReset()` 会先做 `mockClear()` 的事，再重置 mock 实现并清掉所有一次性设定。对 `vi.fn()` 来说，重置后会回到空实现；对 `vi.fn(impl)` 来说，会回到初始传入的实现。

`mockRestore()` 会先做 `mockReset()` 的事；如果这个 mock 来自 `vi.spyOn()`，还会把对象上的原始方法或属性描述符恢复回去。对于单纯 `vi.fn()` 创建的 mock，`mockRestore()` 的效果等同于 `mockReset()`。

### 类构造 mock 的返回值语义

类 mock 不能按普通函数那样直接套用 `mockReturnValue` 一类简写。构造函数如果显式返回对象，`new` 表达式最终拿到的是这个对象，而不是 mock 类实例，原型链和 `instanceof` 判断都会失效。需要模拟类实例时，优先用 `mockImplementation(class { ... })` 保留构造语义；只有在测试“构造函数故意返回自定义对象”这种特殊用例时，才在 `mockImplementation(class { constructor() { return {...} } })` 中显式表达。

## 常见误区

- 把 `vi.fn`、`vi.spyOn`、`vi.mock` 当成同一层级工具
- 在 hoisted 工厂里直接引用外部变量
- 清理 mock 时只记 API 名字，不理解它会不会重置实现或恢复原方法
- 把类 mock 当普通函数 mock 使用，直接用 `mockReturnValue` 返回对象，结果得到普通对象而不是类实例
- 以为 `mockRestore()` 只比 `mockReset()` 多“恢复实现”；实际上它只在 `spyOn` 场景下额外恢复对象上的原始方法

## 证据状态

- 已验证：`vi.fn`、`vi.spyOn`、`vi.mock` 与清理 API 的能力边界有官方文档与多篇项目文档支撑。
- 待验证：部分源码级解释依赖特定版本实现，升级后应复核。
- 冲突中：无。

## 最近更新

- 2026-04-14 backfill：整合对象级与模块级 mocking 边界，强调 `vi.mockObject` 不能替代模块加载阶段替换。
- 2026-04-15 query-update：补充类 mock 的构造返回值陷阱，明确类实例 mock 优先使用 `mockImplementation(class { ... })`。
- 2026-04-15 query-update：补充 `mockClear()` 只清空调用历史、不重置实现，与 `mockReset()` / `mockRestore()` 的边界。
- 2026-04-15 query-update：补充 `mockReset()` 与 `mockRestore()` 的差异，明确前者重置实现，后者在 `spyOn` 场景还会恢复原始方法。

## 关联文档

- [007-vi-mock-guide.md](../../docs/007-vi-mock-guide.md)
- [008-vi-fn-spy-guide.md](../../docs/008-vi-fn-spy-guide.md)
- [009-vi-mocked-type-helper.md](../../docs/009-vi-mocked-type-helper.md)
- [011-mockobject-vs-other-mocking-apis.md](../../docs/011-mockobject-vs-other-mocking-apis.md)
- [012-mock-cleanup-methods.md](../../docs/012-mock-cleanup-methods.md)

## 来源

- https://cn.vitest.dev/guide/mocking
- https://cn.vitest.dev/guide/mocking/functions
- https://cn.vitest.dev/guide/mocking/modules
- https://cn.vitest.dev/api/mock
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
- [009-vi-mocked-type-helper.md](../../docs/009-vi-mocked-type-helper.md)
