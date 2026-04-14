---
title: Snapshots
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["snapshot", "beginner"]
sources:
  - https://cn.vitest.dev/guide/snapshot
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

## 常见误区

- 用快照代替所有精确断言
- 在包含时间、随机数等不稳定数据时直接生成快照

## 证据状态

- 已验证：快照基本 API 与使用建议来自官方 snapshot 文档和项目文档。
- 待验证：大型项目下的快照治理策略（阈值、分层审查）当前仓库尚无系统化文档，后续可补充。
- 冲突中：无。

## 最近更新

- 2026-04-14 ingest：补充“先审 diff 再更新快照”的流程化建议，减少机械更新。

## 关联文档

- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)

## 来源

- https://cn.vitest.dev/guide/snapshot
- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)
