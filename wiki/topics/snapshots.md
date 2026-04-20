---
title: Snapshots
created: 2026-04-14
updated: 2026-04-20
type: topic
tags: ["snapshot", "beginner"]
sources:
  - https://cn.vitest.dev/guide/snapshot
  - https://cn.vitest.dev/config/snapshotformat
  - https://cn.vitest.dev/config/snapshotserializers
  - ../../docs/005-snapshot-testing.md
---

# Snapshots

## 一句话总结

快照适合保存“结构化输出的当前样子”，但它不是万能断言，只有在变化本身值得被审查时才应该用。

### 相关主题

- [[assertions]]
- [[mocking]]

## 适用场景

- UI 渲染结果或复杂对象输出
- 错误消息、代码生成结果等文本化产物
- 需要审查变更 diff，而不是只关心真假断言

## 核心概念

### 文件快照与内联快照

文件快照更适合长期维护，内联快照更适合简单场景和局部表达。

### 审查流程

先看 diff 是否合理，再决定是否更新快照，而不是直接按 `u`。

### 自定义序列化器

自定义序列化器的目标不是“改测试结果”，而是“改快照里最终写出来的文本”。也就是说，被测值本身没变，只是你决定用更适合审查的方式把它打印出来。

可以把它理解成两步：

- `test(val)`：先判断“这个值要不要交给我处理”
- `serialize(...)`：如果要处理，就返回一段最终写进快照的字符串

官方示例里 `test(val)` 会检查对象上是否有 `foo` 属性；命中后，`serialize(...)` 不直接把整个对象原样打印，而是只取 `val.foo`，再配合 `printer(...)` 继续复用 Vitest 已有的默认序列化能力。

对初学者来说，最容易记的心智模型是：

- `test` 像过滤器，负责“拦不拦”
- `serialize` 像格式化函数，负责“怎么显示”
- `printer` 像“调用 Vitest 默认打印机”，避免你自己递归处理嵌套对象

什么时候需要它：

- 快照里有噪音字段，导致 diff 很难看
- 某类对象默认输出不可读，需要统一改成更稳定、更短的文本
- 你想保留对象的一部分结构，而不是整个对象原样入快照

什么时候不需要它：

- 你只是想调整通用格式，例如 key 排序、函数名、shadow root、输出长度，这类优先看 `snapshotFormat`
- 你只是想在多个测试文件里复用同一个序列化器，这类优先用 `test.snapshotSerializers` 配置模块路径，而不是每个测试里手动 `expect.addSnapshotSerializer(...)`

## 常见误区

- 用快照代替所有精确断言
- 在包含时间、随机数等不稳定数据时直接生成快照

## 证据状态

- 已验证：快照基本 API、自定义序列化器、`snapshotFormat` 与 `snapshotSerializers` 的职责边界来自官方文档和项目文档。
- 待验证：大型项目下的快照治理策略（阈值、分层审查）当前仓库尚无系统化文档，后续可补充。
- 冲突中：无。

## 最近更新

- 2026-04-20 query-update：补充自定义序列化器的心智模型，明确 `test` / `serialize` / `printer` 的分工，并区分 `expect.addSnapshotSerializer`、`snapshotFormat`、`snapshotSerializers` 的适用边界。
- 2026-04-14 ingest：补充“先审 diff 再更新快照”的流程化建议，减少机械更新。

## 关联文档

- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)

## 来源

- https://cn.vitest.dev/guide/snapshot
- https://cn.vitest.dev/config/snapshotformat
- https://cn.vitest.dev/config/snapshotserializers
- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)
