---
title: Coverage
created: 2026-06-03
updated: 2026-06-06
type: topic
tags: ["coverage", "config", "beginner"]
sources:
  - https://cn.vitest.dev/guide/coverage
  - https://cn.vitest.dev/config/coverage
  - ../../docs/017-coverage-internals-v8-vs-istanbul.md
---

# Coverage

## 一句话总结

覆盖率衡量的是「测试运行时源码被实际执行到的比例」，它是发现测试盲区的工具，而不是代码质量的保证。

### 相关主题

- [[execution-model]]
- [[projects]]

## 适用场景

- 想知道现有测试到底覆盖了哪些代码、漏了哪些分支
- 重构或改老代码前，想确认这段逻辑有没有测试兜底
- 在 CI 中加质量门禁，防止覆盖率随新代码倒退
- 旧项目首次引入覆盖率，需要一套循序渐进的落地步骤

## 核心概念

### 覆盖率是什么

覆盖率统计的是「源码被执行到的比例」，与你写了多少行测试代码无关。同一条代码路径测一百遍，覆盖率也不会比测一遍更高；只有走到此前没走过的路径，覆盖率才上升。

### 四类指标

- **Lines（行）/ Statements（语句）**：每一行 / 每一条语句是否被执行到。
- **Branches（分支）**：`if/else`、三元、`&&` 等每个岔路口的「成立」和「不成立」两条路是否都走过。
- **Functions（函数）**：每个函数是否被调用过。

其中 **Branches 最能暴露漏测**：一个 `if` 即使被执行（行覆盖 100%），也可能只测了成立那条路，分支覆盖只有 50%。要让一个 `if/else` 分支覆盖满，至少需要分别走「成立」和「不成立」两种输入。

### Provider：v8 vs istanbul

Vitest 本身不含覆盖率引擎，需单独安装 provider 包：

- **`v8`（默认，推荐）**：借 V8 引擎运行时收集，**无需预先转译/插桩**，速度快、内存省。自 Vitest v3.2.0 起精度已与 Istanbul 相当（基于 AST 重映射）。依赖 V8 环境，Firefox / Bun 等非 V8 环境不支持。
  - 安装：`npm i -D @vitest/coverage-v8`
- **`istanbul`**：业界沉淀 13 年的成熟方案，靠**代码插桩**实现，可在任意 JS 环境运行；代价是执行前要插桩，更慢、更占内存。
  - 安装：`npm i -D @vitest/coverage-istanbul`

首次运行 `--coverage` 时，Vitest 会**提示自动安装**对应 provider 包。

### 底层原理：插桩 vs 原生（机制速览）

两个 provider 解决同一问题（源码哪些被执行），但路线相反：

- **Istanbul = 改你的代码来数（插桩）**：运行**前**把源码解析成 AST，在每条语句 / 分支 / 函数入口注入计数器，维护全局 `__coverage__` 对象，跑完读取生成报告。通常由 `babel-plugin-istanbul` 完成。优点是跨任意 JS 运行时、精度天然准；代价是要预处理、更慢、文件变大、更占内存。
- **V8 = 让引擎帮你数（原生）**：复用 V8 引擎运行时本就存在的 invocation counter（feedback vector 上的调用计数器，原是给优化编译器做内联决策用的），源码**原样执行、无需插桩**。分 `best-effort`（零开销、只报"跑没跑过"、被 GC 回收的函数会丢）与 `precise`（钉住 feedback vector 防丢、可报执行次数、计数完全准确需关优化）两种模式，Vitest provider 走 precise 路线。

历史与精度补充：

- V8 早期块覆盖「精确计数必须关优化」的限制约 2019 年（`crrev.com/c/1613996`）已解除，函数现在可在所有块覆盖模式下被优化和内联。
- Istanbul 由 Yahoo 的 Krishnan Anantheswaran 于 ~2012 年创建，现以 istanbuljs 生态（`nyc` + `babel-plugin-istanbul`）存续，原始 `istanbul` 包已停更。
- 精度差距已被抹平：Vitest 自 **v3.2.0** 起 V8 provider 用 **AST 重映射**，报告与 Istanbul **一致**——兼得 V8 的速度与 Istanbul 的精度。

> 机制细节、best-effort/precise 四维差异、插桩示例与完整选型见 [017-coverage-internals-v8-vs-istanbul.md](../../docs/017-coverage-internals-v8-vs-istanbul.md)。

### 启用方式

```bash
# 命令行
npx vitest run --coverage
# 也可指定 provider
npx vitest run --coverage --coverage.provider v8
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // 默认 v8
      include: ["src/**/*.{ts,tsx}"], // 只统计真正的源码
      exclude: ["**/*.d.ts", "**/*.config.*"],
      reporter: ["text", "html"], // 终端表格 + 网页报告
      reportsDirectory: "./coverage", // 默认就是这个
    },
  },
});
```

### Reporter 与默认值

- `coverage.provider` 默认 `'v8'`
- `coverage.reporter` 默认 `['text', 'html', 'clover', 'json']`；`html` 报告可点进每个文件看红行
- `coverage.reportsDirectory` 默认 `'./coverage'`
- `coverage.include` 默认仅统计「测试过程中实际引入的文件」
- `coverage.exclude` 默认 `[]`
- `coverage.clean` 默认 `true`（运行前清空报告目录）

### Thresholds：阈值门禁

`coverage.thresholds` 用来设质量门禁，低于阈值时测试失败：

```ts
thresholds: {
  functions: 90,     // 正数 = 最低百分比
  lines: -10,        // 负数 = 允许的最大「未覆盖项目数」
  branches: 80,
  perFile: true,     // 按每个文件分别检查，而非整体
  autoUpdate: true,  // 覆盖率提升时自动把阈值更新到新水位（锁基线、只能涨不能跌）
  100: true,         // 快捷写法：四项全部要求 100%
}
```

也可用 glob 给不同目录设不同标准：

```ts
thresholds: {
  lines: 30,                          // 全局基线低
  'src/core/**.ts': { 100: true },    // 但核心模块要求 100%
}
```

### 旧项目引入落地步骤

1. **装 provider 包**（或首次 `--coverage` 时按提示自动装）。
2. **先裸跑一次**摸清家底：`npx vitest run --coverage`，目的不是达标，是看清现状与红文件。
3. **用 `include`/`exclude` 收窄范围**到真正关心的源码，避免第三方/构建产物/类型声明撑大分母。
4. **配 package.json 脚本**：`"coverage": "vitest run --coverage"`。
5. **按价值补测试**：看 HTML 报告，优先补核心业务逻辑与分支红得多的地方（对应 TODO.md 阶段 6）。
6. **上「防倒退」门禁**：旧项目不要一上来设 80%，用负数门槛（限制未覆盖行数）或 `autoUpdate` 锁基线，让覆盖率只能涨不能跌。

## 常见误区

- 以为覆盖率是「测试代码行数 ÷ 源码行数」；实际是「源码被执行到的比例」，与测试体积无关。
- 把行覆盖（Lines）100% 当成测充分；其实没有 `else` 的 `if` 跳过分支也能让行覆盖满，要看 Branches 才知道漏没漏。
- 把高覆盖率等同于「没 bug / 测试质量好」；覆盖率只证明代码被执行过，不证明你写了有意义的断言（极端情况：一个 `expect` 都不写也能 100%）。
- 把覆盖率当 KPI 硬凑 100%，写出一堆没断言的假测试。应当作「找漏洞的工具」，而非达标目标。
- 旧项目一上来就设高阈值（如 80%），导致流水线全红；应从「防倒退」起步。
- 忘记装 provider 包，以为 Vitest 自带覆盖率引擎。

## 证据状态

- 已验证（2026-06-03）：覆盖率定义、四类指标、v8/istanbul provider 区别与包名、`--coverage` 启用、reporter 与各配置默认值、`thresholds`（含 `perFile`/`autoUpdate`/`100`/glob）均对照官方覆盖率指南与配置页核对。
- 已验证（2026-06-06）：底层原理——Istanbul 插桩（AST 注入计数器 + `__coverage__`，由 `babel-plugin-istanbul` 完成）vs V8 原生（复用 invocation counter，best-effort/precise 两模式）、V8「精确计数需关优化」限制约 2019 年（`crrev.com/c/1613996`）解除、Istanbul ~2012 起源与 istanbuljs（`nyc`）生态现状、Vitest v3.2.0 起 V8 AST 重映射使报告与 Istanbul 一致，均对照 V8 官方博客 / V8 Block Coverage 设计文档 / Vitest 官方指南 / istanbuljs 仓库核对（见 `docs/017`）。
- 经验总结（未在官方逐条列出）：四指标的通俗类比、Branches 最能暴露漏测的判断、「旧项目引入落地步骤」与「防倒退优先于达标」的门禁打法，属通用测试工程经验。
- 冲突中：无。

## 最近更新

- 2026-06-06 ingest：并入新建发布文档 `docs/017`（覆盖率底层原理：V8 原生 vs Istanbul 插桩）。在核心概念新增「底层原理：插桩 vs 原生（机制速览）」小节——Istanbul 插桩路线（AST 注入 + `__coverage__`）vs V8 原生路线（复用 invocation counter，best-effort/precise 两模式），并补历史与精度三点（2019 年解除「精确计数需关优化」限制、Istanbul ~2012 起源与 istanbuljs 生态、Vitest v3.2.0 起 AST 重映射使精度与 Istanbul 一致），深化细节指向 `docs/017`。frontmatter `updated`→2026-06-06、sources 加 docs/017；关联文档新增 docs/017；证据状态加 2026-06-06 已验证行。`internal-docs-map.md` 新增 Coverage primary→017。
- 2026-06-03 query-update：新建 coverage 主题页。回答用户「什么是覆盖率 / 有什么用 / 旧项目怎么引入」三轮问答，沉淀覆盖率概念、四类指标、v8 vs istanbul provider、`--coverage` 启用、reporter 与默认值、`thresholds` 阈值门禁，以及旧项目分步落地与「防倒退优先」的门禁策略。来源为官方覆盖率指南与配置页。

## 关联文档

- [017-coverage-internals-v8-vs-istanbul.md](../../docs/017-coverage-internals-v8-vs-istanbul.md)（覆盖率底层原理：V8 原生覆盖 vs Istanbul 插桩的机制、历史与选型）

## 来源

- https://cn.vitest.dev/guide/coverage（覆盖率指南：provider、安装、启用、reporter）
- https://cn.vitest.dev/config/coverage（覆盖率配置：thresholds、include/exclude、默认值）
- [017-coverage-internals-v8-vs-istanbul.md](../../docs/017-coverage-internals-v8-vs-istanbul.md)（项目发布文档：底层机制原理、best-effort/precise、Istanbul 插桩、历史与选型，已对照 V8 官方博客/设计文档/Vitest 指南核对）
