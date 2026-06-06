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

### Provider 与 Reporter 是两件事

覆盖率配置有两层，容易混淆：

- **provider（采集引擎）**：决定**怎么收集**「哪些代码被执行」的原始数据——`v8` 让引擎自己数，`istanbul` 靠插桩数。
- **reporter（渲染器）**：决定把采集到的数据**输出成什么格式的报表**——终端表格 / 网页 / XML / JSON 等。`coverage.reporter` 接收数组，可同时配多个，一次跑生成多份产物。

关键事实：**无论 provider 是 `v8` 还是 `istanbul`，Vitest 最终都调用同一个 npm 包 `istanbul-reports` 来渲染报表**（本地源码 `packages/coverage-v8/src/provider.ts:11-12` 与 `packages/coverage-istanbul/src/provider.ts:12/14` 都 `import istanbul-lib-report / istanbul-reports`，并各自调用 `reports.create(...)`）。流程是：V8 采集原始数据 → 自 v3.2.0 AST 重映射成 istanbul 标准格式 → 交给 `istanbul-reports` 渲染成 html/lcov 等。

> 由此解释一个常见困惑：用 `v8` provider 跑出来的 HTML 报告，底部仍链接 `istanbul.js.org`、资源文件是 `base.css` / `prettify.js` / `block-navigation.js` / `sorter.js` / `sort-arrow-sprite.png`（这些都是 `istanbul-reports` 的 html 模板自带）。它表示「**渲染报表的库**是 istanbul」，**不代表**「采集 provider 是 istanbul」。数据仍由 V8 采集，只有渲染这一步借用了 istanbul 的库。这是预期行为，不是配置错误。验证 provider 是否生效，看装的是 `@vitest/coverage-v8` 还是 `@vitest/coverage-istanbul`。

### Reporter 类型与适用场景

按「产物文件 / 谁来消费」选择（reporter 名单来源：本地源码 `cli/completions.ts`、`config/resolveConfig.ts`）：

| reporter       | 产物                     | 典型场景                                                                         |
| -------------- | ------------------------ | -------------------------------------------------------------------------------- |
| `text`         | 终端表格                 | 本地跑完瞄一眼整体覆盖率                                                         |
| `text-summary` | 终端一行汇总             | 只看总数、不看逐文件                                                             |
| `html`         | `index.html` + 资源      | 人工审查：浏览器点进每个文件看未覆盖红行                                         |
| `json`         | `coverage-final.json`    | 逐文件原始数据，喂给自定义脚本/工具二次处理                                      |
| `json-summary` | `coverage-summary.json`  | 只含总数，做覆盖率徽章(badge)、CI 脚本读阈值                                     |
| `lcov`         | `lcov.info` + html       | **CI 事实标准**：Codecov / Coveralls / SonarQube / VS Code Coverage Gutters 消费 |
| `clover`       | `clover.xml`             | Jenkins / Atlassian 生态                                                         |
| `cobertura`    | `cobertura-coverage.xml` | GitLab CI、Jenkins Cobertura 插件                                                |

选型口诀：**本地看 → `text` + `html`；上 CI / 接第三方平台 → 加 `lcov`（或平台指定的 `clover` / `cobertura`）。**

### Reporter 与默认值

- `coverage.provider` 默认 `'v8'`
- `coverage.reporter` 默认 `['text', 'html', 'clover', 'json']`（源码 `packages/vitest/src/defaults.ts:41`）；`html` 报告可点进每个文件看红行
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

#### 判定基准：整体 vs 逐文件

阈值「按什么对象判」取决于 `perFile`（源码 `node/coverage.ts:509-516`），这是最容易混淆的一点：

- **`perFile: false`（默认）→ 按「整体汇总」判**：把所有文件合成**一个全局 summary**（`coverageMap.getCoverageSummary()`）去比阈值。个别文件覆盖率很低也没关系，只要**全项目加总**达标就过。
- **`perFile: true` → 按「每个文件分别」判**：遍历每个文件单独算 summary，**任何一个文件**不达标就失败，报错带文件名（`... threshold (85%) for src/math.ts`）。
- **glob key → 再分目录组**：用路径 glob 作 key 的那组，单独成一个判定组，按该组自己的 `perFile` 行为判。

阈值数值语义（源码注释明确）：**正数 = 最低百分比**（`lines: 85` 即至少 85%）；**负数 = 最多允许的未覆盖数量**（`lines: -10` 即最多 10 行未覆盖，旧项目防倒退常用）。不达标时设 `process.exitCode = 1`，测试失败。

### Watermarks 与 processingConcurrency：另两个常被问的配置

这两个配置和 `thresholds` 分属覆盖率的不同阶段，别和门禁混淆：

- **`watermarks`（报告着色，纯视觉，不影响成败）**：每个指标一对 `[低水位, 高水位]`，默认 `[50, 80]`（源码 `defaults.ts:52`）。唯一作用是给 HTML/终端报告做颜色分级——Vitest 把它原样传给 `istanbul-reports` 渲染器（`coverage-v8/src/provider.ts:141`）：覆盖率 `< 低水位` 红色（low）、`[低, 高)` 之间黄色（medium）、`≥ 高水位` 绿色（high）。它**不参与任何通过/失败判断**，想卡 CI 用 `thresholds`。
- **`processingConcurrency`（报告处理阶段并发，与跑测试无关）**：控制的是**测试跑完后、生成报告前的「结果处理」阶段**的并发——V8 provider 把原始覆盖数据转换/重映射成 istanbul 格式、处理未覆盖文件时，按此数把文件切 chunk 并发处理（`coverage-v8/src/provider.ts:181`、`:445`）。**不是**控制测试并行度（那是 `maxWorkers`/`poolOptions`）。默认 `Math.min(20, os.availableParallelism?.() ?? os.cpus().length)`（`defaults.ts:46`），CPU 核数与 20 取小、封顶 20。一般无需动；仅当文件巨多/巨大、报告处理吃内存太狠甚至 OOM 时调小（如 `4`）用时间换内存。

> **三阶段心智模型**：`watermarks` 管报告**着色**（视觉）→ `processingConcurrency` 管报告**生成并发**（性能）→ `thresholds` 管要不要因不达标而 **fail**（门禁，默认看整体、`perFile` 看逐文件）。三者各管一摊，别互相套用。

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
- 看到 v8 provider 跑出的 HTML 报告底部写「generated by istanbul」就以为 provider 没生效；其实 provider（采集）和 reporter（渲染）是两件事，所有 provider 的报表都由 `istanbul-reports` 渲染。
- 把 `watermarks` 当门禁，以为调高它能卡 CI；它只管报告颜色分级，决定成败的是 `thresholds`。
- 把 `processingConcurrency` 当成「测试并行度」去调；它只影响报告处理阶段的并发，测试并行度是 `maxWorkers`/`poolOptions`。
- 以为 `thresholds` 一定按文件判；默认 `perFile: false` 是按全项目整体汇总判，开 `perFile: true` 才逐文件判。

## 证据状态

- 已验证（2026-06-03）：覆盖率定义、四类指标、v8/istanbul provider 区别与包名、`--coverage` 启用、reporter 与各配置默认值、`thresholds`（含 `perFile`/`autoUpdate`/`100`/glob）均对照官方覆盖率指南与配置页核对。
- 已验证（2026-06-06）：底层原理——Istanbul 插桩（AST 注入计数器 + `__coverage__`，由 `babel-plugin-istanbul` 完成）vs V8 原生（复用 invocation counter，best-effort/precise 两模式）、V8「精确计数需关优化」限制约 2019 年（`crrev.com/c/1613996`）解除、Istanbul ~2012 起源与 istanbuljs（`nyc`）生态现状、Vitest v3.2.0 起 V8 AST 重映射使报告与 Istanbul 一致，均对照 V8 官方博客 / V8 Block Coverage 设计文档 / Vitest 官方指南 / istanbuljs 仓库核对（见 `docs/017`）。
- 已验证（2026-06-06）：provider（采集）与 reporter（渲染）分层、所有 provider 都经 `istanbul-reports` 渲染报表（本地源码 `packages/coverage-v8/src/provider.ts:11-12,153` 与 `packages/coverage-istanbul/src/provider.ts:12/14/201` 均 import 并调用 `istanbul-lib-report`/`istanbul-reports`）、reporter 类型清单（`text`/`text-summary`/`html`/`json`/`json-summary`/`lcov`/`clover`/`cobertura`，来源 `cli/completions.ts`、`config/resolveConfig.ts`）、默认 `['text','html','clover','json']`（`defaults.ts:41`），对照本地 Vitest 源码核对；并实测某 v8 项目的 `coverage/index.html` 底部链接 `istanbul.js.org`、html 资源为 `base.css`/`prettify.js`/`block-navigation.js`/`sorter.js`/`sort-arrow-sprite.png`。
- 已验证（2026-06-06）：`thresholds` 判定基准——`perFile: false`（默认）按整体汇总 `coverageMap.getCoverageSummary()`、`perFile: true` 按每文件单独 summary、glob key 各成独立判定组，正数=最低百分比/负数=最多未覆盖数，不达标置 `process.exitCode = 1`（`node/coverage.ts:497-575`）；`watermarks` 默认 `[50,80]`、仅用于报告颜色分级并原样传给 istanbul-reports（`defaults.ts:52`、`coverage-v8/src/provider.ts:141`）；`processingConcurrency` 是报告处理阶段并发、默认 `Math.min(20, availableParallelism ?? cpus.length)`（`defaults.ts:46`、`coverage-v8/src/provider.ts:181/445`），均对照本地 Vitest 源码核对。
- 经验总结（未在官方逐条列出）：四指标的通俗类比、Branches 最能暴露漏测的判断、「旧项目引入落地步骤」与「防倒退优先于达标」的门禁打法、各 reporter 的消费方场景对照、`watermarks`/`processingConcurrency`/`thresholds` 三阶段心智模型，属通用测试工程经验。
- 冲突中：无。

## 最近更新

- 2026-06-06 query-update：回答「watermarks 作用 / thresholds 按文件还是整体判 / processingConcurrency 是什么」。Thresholds 小节新增「判定基准：整体 vs 逐文件」子段（`perFile:false` 整体汇总、`perFile:true` 逐文件、glob 分组、正负数语义）；新增「Watermarks 与 processingConcurrency」小节（watermarks 纯报告着色不影响成败、processingConcurrency 是报告处理阶段并发而非测试并行度）并给出三阶段心智模型；常见误区 +3；证据状态加 2026-06-06 已验证行（对照本地源码 `coverage.ts`/`defaults.ts`/`provider.ts`）。无新增 `docs/NNN`，映射不变。
- 2026-06-06 query-update：回答「reporter 是什么 / 不同类型 reporter 场景 / 为何 v8 provider 报表显示 istanbul」。在「核心概念」新增「Provider 与 Reporter 是两件事」与「Reporter 类型与适用场景」两小节——澄清 provider（采集）与 reporter（渲染）分层、所有 provider 都经 `istanbul-reports` 渲染（故 v8 报表底部仍标 istanbul 属预期）、八种 reporter 的产物与消费场景对照表及选型口诀；常见误区加「把 istanbul 报表署名误读为 provider 没生效」一条；证据状态加 2026-06-06 已验证行（对照本地 Vitest 源码）。无新增 `docs/NNN`，映射不变。
- 2026-06-06 ingest：并入新建发布文档 `docs/017`（覆盖率底层原理：V8 原生 vs Istanbul 插桩）。在核心概念新增「底层原理：插桩 vs 原生（机制速览）」小节——Istanbul 插桩路线（AST 注入 + `__coverage__`）vs V8 原生路线（复用 invocation counter，best-effort/precise 两模式），并补历史与精度三点（2019 年解除「精确计数需关优化」限制、Istanbul ~2012 起源与 istanbuljs 生态、Vitest v3.2.0 起 AST 重映射使精度与 Istanbul 一致），深化细节指向 `docs/017`。frontmatter `updated`→2026-06-06、sources 加 docs/017；关联文档新增 docs/017；证据状态加 2026-06-06 已验证行。`internal-docs-map.md` 新增 Coverage primary→017。
- 2026-06-03 query-update：新建 coverage 主题页。回答用户「什么是覆盖率 / 有什么用 / 旧项目怎么引入」三轮问答，沉淀覆盖率概念、四类指标、v8 vs istanbul provider、`--coverage` 启用、reporter 与默认值、`thresholds` 阈值门禁，以及旧项目分步落地与「防倒退优先」的门禁策略。来源为官方覆盖率指南与配置页。

## 关联文档

- [017-coverage-internals-v8-vs-istanbul.md](../../docs/017-coverage-internals-v8-vs-istanbul.md)（覆盖率底层原理：V8 原生覆盖 vs Istanbul 插桩的机制、历史与选型）

## 来源

- https://cn.vitest.dev/guide/coverage（覆盖率指南：provider、安装、启用、reporter）
- https://cn.vitest.dev/config/coverage（覆盖率配置：thresholds、include/exclude、默认值）
- [017-coverage-internals-v8-vs-istanbul.md](../../docs/017-coverage-internals-v8-vs-istanbul.md)（项目发布文档：底层机制原理、best-effort/precise、Istanbul 插桩、历史与选型，已对照 V8 官方博客/设计文档/Vitest 指南核对）
