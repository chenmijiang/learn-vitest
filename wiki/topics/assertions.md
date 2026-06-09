---
title: Assertions
created: 2026-04-14
updated: 2026-06-09
type: topic
tags: ["assertion", "beginner"]
sources:
  - https://cn.vitest.dev/api/expect.html
  - https://vitest.dev/api/assert
  - https://www.chaijs.com/guide/styles/
  - https://github.com/testing-library/jest-dom
  - ../../docs/001-expect-custom-message.md
  - ../../docs/013-expect-foundation-chain-and-assert.md
---

# Assertions

## 一句话总结

断言是 Vitest 测试的结果判断层；先掌握 `expect` 的常用写法，再理解它与 Chai、Jest 兼容层和 `assert` 风格之间的关系。

### 相关主题

- [[hooks]]
- [[execution-model]]
- [[environment]]
- [[component-testing]]

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

### DOM 断言：`@testing-library/jest-dom` 的定位

`jsdom`（测试环境，见 [[environment]]）和 `jest-dom`（断言扩展）名字撞脸但毫不相干：前者在 Node 里造出 `document`/DOM API 提供「舞台」，后者是一组**DOM 专用断言匹配器**提供「断言能力」。

- **为什么 jsdom 下要用它**：Vitest 原生 `expect` 只有通用 matcher（`toBe`/`toEqual`…），对 DOM 元素断言会很啰嗦（`btn.hasAttribute('disabled')` 之类）。`jest-dom` 注册了 `toBeInTheDocument()`、`toBeVisible()`、`toHaveTextContent()`、`toHaveClass()`、`toBeDisabled()`、`toHaveValue()`、`toHaveAttribute()` 等声明式 matcher，让 DOM 断言可读。
- **环境无关**：它虽带「jest」字样，但**不绑定 Jest 框架**，只要「从查询返回 DOM 元素」就能用，所以提供了专门给 Vitest 的入口。
- **接入方式**：在 `setupFiles` 里 `import '@testing-library/jest-dom/vitest'`——这是**纯副作用导入**，把 matcher 挂进 Vitest 的 `expect`，全局生效，测试文件无需再 import（配置层归属见 [[hooks]]）。
- **断言链路**：`jsdom`（环境）→ `@testing-library/react` 的 `render`/`screen` 查询（返回 DOM 元素）→ `expect` + jest-dom matcher（断言元素状态）。
- **与 Browser Mode 的对比**：jest-dom 是**同步** matcher（`expect(el).toBeInTheDocument()`），两端都能用；Browser Mode 另有自带的 `expect.element(...)`（**异步、自动重试/等待**），更适配真实浏览器时序（详见 [[component-testing]]）。

## 常见误区

- 只关注断言是否通过，不关注失败信息是否能帮助快速定位问题
- 用过多复杂断言把真正的业务意图埋掉
- 把 `expect` 和 `assert` 误解为两套完全不同能力的 API
- 把“为什么默认链式断言”误解成纯语法偏好，而忽略状态组合和扩展机制
- **把 `jsdom` 和 `jest-dom` 当成相关/同类东西**：一个是测试环境，一个是断言匹配器扩展，毫无从属关系
- 以为 `jest-dom` 绑定 Jest 框架而不敢在 Vitest 用；或忘了它需在 `setupFiles` 注册，导致 `toBeInTheDocument` 等 matcher 不存在
- 误以为 DOM 断言只能在 Browser Mode 做，而忽略 jsdom + jest-dom 已是常规组合

## 证据状态

- 已验证：`expect` 的基础语义、自定义消息、`assert` API 与 BDD/TDD 风格区分都有官方来源；`@testing-library/jest-dom` 的环境无关定位、`/vitest` 接入入口、matcher 列表来自官方仓库。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-04-14 ingest：补充“失败信息可定位性”作为断言设计原则，统一与 execution-model 的引用关系。
- 2026-04-15 query-update：补充 `expect` 的 Chai 底座、Jest 兼容层、链式断言动机，以及 `expect` 与 `assert` 的关系。
- 2026-06-09 query-update：新增「DOM 断言：`@testing-library/jest-dom` 的定位」——厘清 `jsdom`（环境）vs `jest-dom`（断言扩展）的撞脸误区、环境无关性、`setupFiles` 副作用接入、断言链路，以及与 Browser Mode `expect.element`（异步重试）的对比。

## 关联文档

- [001-expect-custom-message.md](../../docs/001-expect-custom-message.md)
- [013-expect-foundation-chain-and-assert.md](../../docs/013-expect-foundation-chain-and-assert.md)

## 来源

- https://cn.vitest.dev/api/expect.html
- https://vitest.dev/api/assert
- https://www.chaijs.com/guide/styles/
- https://github.com/testing-library/jest-dom （`@testing-library/jest-dom`：环境无关 DOM 匹配器、`/vitest` 接入、matcher 列表）
- [001-expect-custom-message.md](../../docs/001-expect-custom-message.md)
- [013-expect-foundation-chain-and-assert.md](../../docs/013-expect-foundation-chain-and-assert.md)
