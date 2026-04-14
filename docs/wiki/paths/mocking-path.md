---
title: Mocking Path
created: 2026-04-14
updated: 2026-04-14
type: path
tags: ["mock", "spy", "beginner"]
sources:
  - ../../TODO.md
---

# Mock 学习路径

## 目标

帮助读者从最基础的假函数与监听开始，逐步进入模块替换、对象改写和 mock 清理策略。

## 建议顺序

1. 先看 [Mocking](../topics/mocking.md) 里的 `vi.fn` 和 `vi.spyOn`。
2. 再看模块级 mocking，重点理解 `vi.mock` 的 hoisted 行为。
3. 然后补 [Typing](../topics/typing.md)，解决 TypeScript 下的 mock 类型问题。
4. 再看 [Modules](../topics/modules.md)，理解动态导入和模块副作用。

## 配套主题

- [[mocking]]
- [[typing]]
- [[modules]]

## 对应项目任务

- [TODO.md](../../TODO.md)

## 完成标志

- 能根据依赖层级选择 `vi.fn`、`vi.spyOn`、`vi.mock`
- 能判断何时需要清理调用记录、重置实现、恢复原方法
- 能避免最常见的 hoisted 和类型误用
