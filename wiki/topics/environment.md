---
title: Environment
created: 2026-04-14
updated: 2026-04-22
type: topic
tags: ["environment", "config", "beginner"]
sources:
  - https://cn.vitest.dev/guide/environment
  - https://vitest.dev/config/environmentoptions
  - https://cn.vitest.dev/guide/browser/
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

默认环境是 `node`，涉及 DOM 时才切到 `jsdom` 或 `happy-dom`；`browser` 不属于这里的 `environment` 取值，它对应的是另一套 Browser Mode 运行方式。

### 自定义环境扩展

当预设环境不够用时，可以扩展 global 和 environment options，或实现自定义环境。

### 浏览器环境 vs Browser Mode

“浏览器环境但不是 Browser Mode” 在 Vitest 里通常就是指 DOM 模拟环境，也就是 `jsdom` 或 `happy-dom`。它们仍然在 Node 进程里执行测试，只是补了一层浏览器 API；如果你改成 Browser Mode，才会进入 `@vitest/browser-*` provider 那套真实浏览器执行链路。

### 依赖选择

- `jsdom`：兼容性更高，接近浏览器行为，但通常更重一些；使用时需要额外安装 `jsdom`
- `happy-dom`：更轻更快，但浏览器行为覆盖面和细节兼容性通常不如 `jsdom`；使用时需要额外安装 `happy-dom`
- Browser Mode 相关包如 `@vitest/browser-playwright` 只在真实浏览器模式下需要，不能替代 `jsdom` / `happy-dom`

### `environmentOptions`

如果你已经选择 `jsdom` 或 `happy-dom`，进一步的 URL、视口等环境细节应放到 `test.environmentOptions` 下，并按环境名分组配置。

### `test.env` 和 `define`

`test.env` 是给测试运行时注入环境变量，测试里按环境变量方式读取；`define` 是把代码里的常量标识符在转换阶段直接替换，更像构建期常量，而不是真正往 `process.env` 里塞值。

### `populateGlobal`

在自定义环境里，把运行时对象安全地挂到全局环境时，这个工具很关键。

## 常见误区

- 遇到浏览器 API 就立即上完整浏览器模式，而不是先判断 DOM 模拟是否够用
- 以为把 `environment` 设成 `browser` 就能进入“浏览器环境”；实际上 DOM 模拟环境要用 `jsdom` 或 `happy-dom`
- 已经装了 `@vitest/browser-playwright`，就误以为不再需要 `jsdom` 或 `happy-dom`
- 扩展全局对象后忘记资源清理
- 把 `define` 当成运行时环境变量配置，导致以为它会同步出现在 `process.env` 的动态读取结果里

## 证据状态

- 已验证：预设环境选择、DOM 模拟环境与 Browser Mode 的边界、`environmentOptions` 配置入口、自定义环境、`test.env` 的运行时注入、`.env` 自动加载边界，以及 `define` 的常量替换语义都已回到官方文档核对。
- 待验证：不同 Vitest/Vite 大版本下 `import.meta.env` 暴露细节和周边兼容行为，仍应以当前版本文档为准。
- 冲突中：无。

## 最近更新

- 2026-04-22 query-update：补充“浏览器环境但不是 Browser Mode”的判断方式，明确应使用 `jsdom` 或 `happy-dom`，并区分它们与 `@vitest/browser-*` provider 的依赖关系。
- 2026-04-16 query-update：补充 `test.env` 与 `define` 的边界，明确前者是运行时环境变量注入，后者是转换期常量替换，并说明测试中的读取方式。
- 2026-04-14 ingest：把“先选宿主，再写测试”明确为环境页的主判断原则，避免把环境问题误当断言问题。

## 关联文档

- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)

## 来源

- https://cn.vitest.dev/guide/environment
- https://vitest.dev/config/environmentoptions
- https://cn.vitest.dev/guide/browser/
- https://vitest.dev/guide/features
- https://vitest.dev/config/#env
- https://vite.dev/config/shared-options#define
- https://cn.vitest.dev/guide/test-context
- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)
