---
title: Environment
created: 2026-04-14
updated: 2026-04-14
type: topic
tags: ["environment", "config", "beginner"]
sources:
  - https://cn.vitest.dev/guide/environment
  - https://cn.vitest.dev/guide/test-context
  - ../../006-vitest-environment-extension.md
---

# Environment

## 一句话总结

测试环境决定你的代码运行在什么宿主之下；先选对 `node`、DOM 模拟环境或自定义环境，再写测试，成本最低。

### 相关主题

- [[hooks]]
- [[execution-model]]

## 适用场景

- 测 Node 逻辑、浏览器 API 或框架组件
- 需要扩展全局对象或 environment options
- 需要按文件切换测试环境

## 核心概念

### 预设环境

默认环境是 `node`，涉及 DOM 时才切到 `jsdom` 或 `happy-dom`。

### 自定义环境扩展

当预设环境不够用时，可以扩展 global 和 environment options，或实现自定义环境。

### `populateGlobal`

在自定义环境里，把运行时对象安全地挂到全局环境时，这个工具很关键。

## 常见误区

- 遇到浏览器 API 就立即上完整浏览器模式，而不是先判断 DOM 模拟是否够用
- 扩展全局对象后忘记资源清理

## 关联文档

- [006-vitest-environment-extension.md](../../006-vitest-environment-extension.md)

## 来源

- https://cn.vitest.dev/guide/environment
- https://cn.vitest.dev/guide/test-context
- [006-vitest-environment-extension.md](../../006-vitest-environment-extension.md)
