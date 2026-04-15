---
title: Environment Path
created: 2026-04-14
updated: 2026-04-15
type: path
tags: ["environment", "config", "beginner"]
sources:
  - ../../TODO.md
---

# 环境与配置路径

## 目标

帮助读者先理解运行宿主和测试上下文，再进入环境扩展与自定义。

## 建议顺序

1. 先看 [Execution Model](../topics/execution-model.md)，理解测试怎么跑。
2. 再看 [Environment](../topics/environment.md)，区分 `node`、DOM 模拟和自定义环境。
3. 补看 [Projects](../topics/projects.md)，理解根配置、项目配置和 `include` 的层级边界。
4. 回到 [TODO.md](../../TODO.md) 的阶段 3 与阶段 5，对照当前项目动手验证。

## 配套主题

- [[execution-model]]
- [[environment]]
- [[projects]]

## 对应项目任务

- [TODO.md](../../TODO.md)

## 完成标志

- 能为不同代码选择合理环境
- 能解释为什么默认环境是 `node`
- 能解释 `test.projects` 和 `test.include` 分别解决什么问题
- 知道什么时候该扩展环境、什么时候只需要 setup
