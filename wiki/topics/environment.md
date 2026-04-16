---
title: Environment
created: 2026-04-14
updated: 2026-04-16
type: topic
tags: ["environment", "config", "beginner"]
sources:
  - https://cn.vitest.dev/guide/environment
  - https://vitest.dev/guide/features
  - https://vitest.dev/config/#env
  - https://vite.dev/config/shared-options#define
  - https://cn.vitest.dev/guide/test-context
  - ../../docs/006-vitest-environment-extension.md
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

### `test.env` 和 `define`

`test.env` 是给测试运行时注入环境变量，测试里按环境变量方式读取；`define` 是把代码里的常量标识符在转换阶段直接替换，更像构建期常量，而不是真正往 `process.env` 里塞值。

### `populateGlobal`

在自定义环境里，把运行时对象安全地挂到全局环境时，这个工具很关键。

## 常见误区

- 遇到浏览器 API 就立即上完整浏览器模式，而不是先判断 DOM 模拟是否够用
- 扩展全局对象后忘记资源清理
- 把 `define` 当成运行时环境变量配置，导致以为它会同步出现在 `process.env` 的动态读取结果里

## 证据状态

- 已验证：预设环境选择、自定义环境、`test.env` 的运行时注入、`.env` 自动加载边界，以及 `define` 的常量替换语义都已回到官方文档核对。
- 待验证：不同 Vitest/Vite 大版本下 `import.meta.env` 暴露细节和周边兼容行为，仍应以当前版本文档为准。
- 冲突中：无。

## 最近更新

- 2026-04-16 query-update：补充 `test.env` 与 `define` 的边界，明确前者是运行时环境变量注入，后者是转换期常量替换，并说明测试中的读取方式。
- 2026-04-14 ingest：把“先选宿主，再写测试”明确为环境页的主判断原则，避免把环境问题误当断言问题。

## 关联文档

- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)

## 来源

- https://cn.vitest.dev/guide/environment
- https://vitest.dev/guide/features
- https://vitest.dev/config/#env
- https://vite.dev/config/shared-options#define
- https://cn.vitest.dev/guide/test-context
- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)
