# Vitest 中 `expect` 的底座、链式断言与 `assert` 的关系

## 问题背景

学习 Vitest 时，很多人会先接触 `expect(...).toBe(...)`，但很快又会碰到几个更底层的问题：

- `expect` 断言到底是怎么工作的？
- 为什么默认是链式断言风格？
- 为什么 Vitest 还要兼容 Jest 的断言写法？
- `expect` 和 `assert` 到底是什么关系？

这篇文档把这些问题放在一起解释，重点区分哪些是官方文档直接说明的，哪些是基于官方文档和源码结构做出的合理推断。

## 一句话结论

Vitest 的 `expect` 不是完全从零实现的一套断言系统，而是以 **Chai 的断言对象和链式机制** 为底座，再在其上提供 **Jest 兼容的 matcher API**；而 `assert` 则是同一底座下的另一种断言风格，属于函数式、非链式接口。

## `expect` 的底层基础是什么？

Vitest 官方文档明确说明：

- `expect` 默认提供 Chai assertions
- 同时在其上提供 Jest-compatible assertions

这意味着 `expect` 的底层并不是独立于 Chai 的第二套断言引擎，而是建立在 Chai 断言机制之上的统一入口。

从 `@vitest/expect` 包的说明也能看到同样的设计：它把 “Jest's expect matchers” 实现成了 **Chai plugin**。换句话说，Vitest 不是把 Chai 和 Jest 做成两个平行系统，而是“用 Chai 做底座，再把 Jest 风格能力挂上去”。

## `expect` 断言是如何工作的？

从 Chai 的 BDD API 和 Vitest 的实现方式看，`expect(actual)` 可以理解成“创建一个携带当前断言状态的断言对象”。

这类断言对象通常会保存：

- 当前被断言的值
- 是否取反，例如 `.not`
- 是否进入 Promise 断言语义，例如 `.resolves`、`.rejects`
- 失败时的错误上下文和展示信息

链上的不同部分职责不同：

- `to`、`be`、`that` 这类词主要用于组织语义，提升可读性
- `equal`、`toBe`、`toEqual`、`toMatchObject` 这类 matcher 才会真正执行比较
- 断言失败时，统一生成断言错误和 diff 信息

对于 Vitest 而言，Jest 风格的 `toBe`、`toEqual` 等 matcher 也是注册到这套断言对象上的，而不是完全绕开 Chai 另起炉灶。

## 为什么默认采用链式断言？

这里要分清楚两层：

### 官方能直接确认的部分

Chai 官方把 `expect` / `should` 归类为 **BDD 风格**，这套风格本身就是以链式语言组织断言的。它提供很多 chainable language helpers，用来让断言读起来更像自然语言。

### 基于文档和实现的合理推断

Vitest 之所以天然呈现为链式断言，核心原因不是单纯“语法更好看”，而是它选用了 Chai 作为断言底座。基于这个底座，链式模型会同时带来三件事：

1. **可读性更强**  
   `expect(user.name).toBe("Alice")` 比纯函数嵌套更接近日常语言。

2. **状态组合更自然**  
   `.not`、`.resolves`、`.rejects` 这些能力本质上都是在“最终 matcher 执行前”逐步修改断言状态。链式模型很适合表达这种逐层叠加的语义。

3. **扩展成本更低**  
   Chai 本身就有 property、method、chainable method 这套扩展机制。Vitest 在这个基础上接入 Jest 风格 matcher、自定义 matcher 和其他兼容层，会更顺手。

因此，“默认采用 chain”更准确的理解是：**这是 Vitest 所选断言底座自然带来的结果，也是扩展和状态组合最省成本的方案。**

## 为什么要基于 chain 兼容 Jest 断言？

Vitest 官方文档一直强调对 Jest API 的兼容性，这个设计主要解决三个现实问题。

### 1. 降低迁移成本

大量前端项目已经在使用 Jest 风格断言，例如：

```typescript
expect(result).toBe(1);
expect(user).toEqual({ id: 1 });
```

如果迁移到 Vitest 后这些写法还能继续工作，测试迁移成本就会低很多。

### 2. 兼容已有 matcher 生态

Vitest 提供 `expect.extend`，让依赖 Jest matcher 约定的扩展能力可以继续复用。这样做能减少生态割裂。

### 3. 保留 Chai 底座的扩展性

Vitest 不是放弃 Chai 去完全重写 Jest 的断言系统，而是把 Jest 风格 matcher 建立在 Chai 之上。这样可以同时得到：

- Chai 的链式能力
- Jest 风格的常用 matcher
- 相对统一的错误展示、状态管理和扩展机制

## `expect` 和 `assert` 有什么关系？

`expect` 和 `assert` 在 Vitest 中不是彼此无关的两套体系，它们都来自 Chai，只是暴露为不同的断言风格。

### `expect`

- 属于 BDD 风格
- 通常是链式表达
- 更适合日常测试阅读
- 在 Vitest 里还承担了 Jest 兼容入口的角色

### `assert`

- 属于 TDD 风格
- 是函数调用式、非链式 API
- 写法更接近传统断言库

例如：

```typescript
import { expect, assert } from "vitest";

expect(2 + 2).toBe(4);
assert.strictEqual(2 + 2, 4);
```

这两种写法表达的是同一件事，只是接口风格不同。

## Vitest 里的一个额外细节：`expect.assert`

Vitest 官方文档还说明，它为了方便使用，把 Chai 的 `assert` API 重新暴露为了 `expect.assert`。

也就是说，下面两种入口在语义上是同一家族：

```typescript
import { assert, expect } from "vitest";

assert.strictEqual(1, 1);
expect.assert.strictEqual(1, 1);
```

这再次说明：`expect` 和 `assert` 在 Vitest 中不是竞争关系，而是同一断言底座下的不同访问方式。

## 使用时怎么选？

对初学者来说，可以用一个简单标准：

- **优先学 `expect`**  
  因为它是 Vitest 教程、示例和 Jest 迁移场景里最常见的写法。

- **看到 `assert` 不要把它当成另一套框架**  
  它只是另一种风格，不代表测试能力完全不同。

- **团队已有 Jest 习惯时，优先保留 `expect` 风格**  
  这样阅读成本和迁移成本都更低。

- **只有在团队明确偏好函数式断言时，再更多使用 `assert`**

## 常见误区

### 误区 1：`expect` 是 Vitest 完全独立原创的一套断言系统

不准确。官方文档明确说明它默认提供 Chai assertions，并在其上提供 Jest-compatible assertions。

### 误区 2：链式断言只是“看起来更像英语”

这只说对了一部分。它更重要的作用是承载断言状态组合和扩展机制。

### 误区 3：`expect` 和 `assert` 是两套能力完全不同的测试 API

不准确。它们更像是同一底座上的两种接口风格。

### 误区 4：用了 `assert` 也会被 `expect.assertions()` 统计

不会。Vitest 配置文档明确说明，`expect.assertions()` 和 `expect.hasAssertions()` 只统计 `expect` 调用。

## 证据说明

- **已验证**
  - Vitest `expect` 默认提供 Chai assertions，并提供 Jest-compatible assertions
  - Vitest 提供 `assert` API
  - Vitest 将 Chai 的 `assert` 重新暴露为 `expect.assert`
  - Chai 将 `expect` 归为 BDD 风格，将 `assert` 归为 TDD 风格

- **基于官方文档与源码结构的推断**
  - “为什么默认采用链式断言”这一点，Vitest 官方没有直接写成一条设计宣言；这里的解释基于 Chai 的链式 BDD API、Vitest 对 Chai 的依赖，以及 `@vitest/expect` 作为 Chai plugin 的实现方式推导得出。

## 参考来源

- Vitest API - `expect`: https://vitest.dev/api/expect.html
- Vitest API - `assert`: https://vitest.dev/api/assert
- Vitest Config - `expect`: https://vitest.dev/config/expect
- Vitest Guide - Features: https://vitest.dev/guide/features
- Vitest Guide - Extending Matchers: https://vitest.dev/guide/extending-matchers
- Vitest Guide - Migration: https://main.vitest.dev/guide/migration.html
- `@vitest/expect` README: https://github.com/vitest-dev/vitest/tree/main/packages/expect
- Chai Styles Guide: https://www.chaijs.com/guide/styles/
- Chai BDD API: https://www.chaijs.com/api/bdd/
- Chai Assert API: https://www.chaijs.com/api/assert/
