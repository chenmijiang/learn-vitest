# 覆盖率底层原理：V8 原生覆盖 vs Istanbul 插桩（机制 / 历史 / 选型）

> 本文聚焦覆盖率的**底层实现原理与选型**，是 `wiki/topics/coverage.md`（偏配置用法）的原理补充。
> 想了解四类指标、`thresholds` 门禁、旧项目落地步骤，请看覆盖率主题页与官方覆盖率指南。

## 先看结论

- 覆盖率工具都在回答同一个问题——「源码哪些部分被执行过」——但实现路线根本不同：**Istanbul 改你的代码来数（插桩），V8 让引擎自己数（原生）**。
- **V8 原生**：源码原样执行、无需预处理，快、省内存，但只在 V8 环境（Chrome / Node）可用。
- **Istanbul 插桩**：运行前把计数器写进代码，跨任意 JS 运行时通用，但更慢、更占内存、会撑大文件。
- 历史上 V8 的最大短板是「精度」和「开优化就不准」，如今**两点都已解决**：Vitest 自 v3.2.0 用 AST 重映射让 V8 报告与 Istanbul **一致**；V8 引擎侧约 2019 年也解除了「精确计数必须关优化」的限制。
- **选型口诀**：跑在 V8 上（Chrome / Node）→ 默认 `v8`；要跨运行时（Firefox / Bun）或沿用老牌生态 → `istanbul`。

## 1. V8 原生覆盖：引擎自带的计数

V8 的覆盖能力是引擎内置的，并经历了两次粒度演进：

- **v5.9**：函数粒度（function-granular）——只知道「哪个函数被调用过」。
- **v6.2**：块粒度（block-granular）——精确到单个表达式 / 分支级别，能发现「`else` 分支从没走过」这种函数粒度看不出的漏测。

底层都依赖同一个东西：**每个函数 feedback vector 上的 invocation counter（调用计数器）**。这个计数器本来是给优化编译器（TurboFan）做内联决策用的，无论开不开覆盖率都一直在涨——这正是 V8 覆盖「低成本」的根源。

块粒度则额外做两件事：解析时由扩展过的 parser 记录 `if-else`、循环等结构各分支的源码范围；运行时在字节码里插入 `IncBlockCounter` 指令（放在 then 分支前、else 分支前、以及 if-else 之后以处理 `return`/`throw` 这类非局部控制流）来累加各块计数。

### 1.1 两种模式：best-effort vs precise

很多人以为两者只差在 GC，实际差异体现在**四个维度**：

| 维度            | **best-effort（尽力而为）**                                                | **precise（精确）**                                                                      |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 数据是否丢失    | 报告时遍历堆找**当时还活着**的函数；出作用域被 GC 回收的函数会**彻底消失** | 开启时把所有 feedback vector 钉进 V8 根引用集，GC 不能回收 → 内存被人为撑高              |
| 报告粒度        | 只能给**二进制覆盖**（跑过 / 没跑过）                                      | 通过 `startPreciseCoverage(callCount, detailed)` 的 `callCount` 参数可拿**真实执行次数** |
| 计数准确性      | ——                                                                         | 被 TurboFan 优化后的函数不再递增计数器；要计数**完全准确**需禁用优化                     |
| 是否常驻 / 开销 | 计数器反正一直在跑，**零运行时开销**，无需显式开关                         | 必须显式 `start`/`stop`，期间承担内存（+可选性能）开销                                   |

**对最终覆盖结果的影响**：best-effort 下，一个确实执行过但已被回收的函数可能在报告里**凭空消失**（既非 covered 也非 uncovered），结果不稳定、不可复现；而「优化导致计数停增」只影响**执行次数的准确性**，不影响「是否覆盖」的判断。所以本质是**「准确完整」与「快而轻」的取舍**——best-effort 适合随手看大概，precise 适合正经的覆盖率报告与热点分析。

> 引用自 V8 官方博客原文：best-effort 下 "we completely forget that these functions ever existed"；precise 下 "we add all feedback vectors to V8's root set of references once precise coverage is enabled, preventing their collection by the GC"。

### 1.2 现状：2017 的限制大多已被解除

那篇 2017 博客原文至今未更新（GitHub 源文件确认无修订），但实现已演进：

- **约 2019 年（`crrev.com/c/1613996`）解除了「精确计数必须关优化」的硬限制**。V8 Block Code Coverage 设计文档原话：_"functions may be optimized and inlined in **all** block coverage modes."_ 同一改动还把计数从 runtime function 挪进 builtin，进一步降低开销。
- 块计数模式仍有开销：在 `web-tooling-benchmark`（特别依赖优化代码）上约 40% 回退，但设计文档明确这是**最坏情况**，真实浏览 / Speedometer 场景小得多。
- 生态层面，覆盖率从「Chrome 专属」变为「Node 原生基建」：Node 提供 `NODE_V8_COVERAGE` 环境变量直接落盘覆盖 JSON，Benjamin Coe 的 `c8` 成了 Node 原生覆盖的事实标准工具。

`best-effort` / `precise` 这套 API（`Profiler.startPreciseCoverage` 等）本身仍是 CDP 标准接口，未变。

## 2. Istanbul：源码插桩

### 2.1 它是什么

Istanbul 是 JS 世界最老牌的覆盖率工具，2012 年左右由 Yahoo YUI 团队的 Krishnan Anantheswaran（GitHub `gotwarlost`）创建，统计 **statements / branches / functions / lines** 四个维度。

### 2.2 实现原理：运行前改写代码

核心是**在代码真正运行前，先把它改写一遍、塞进计数器**：

1. 把源码解析成 **AST**；
2. 在每条语句、每个分支、每个函数入口注入计数代码；
3. 维护全局对象 `__coverage__`，记录每处的位置元信息与执行次数；
4. 代码运行时每经过一处就给对应计数器 `+1`；
5. 跑完读取 `__coverage__` 生成报告。

原代码：

```js
function f(x) {
  if (x) return 1;
  return 2;
}
```

插桩后大致变成（简化示意）：

```js
function f(x) {
  cov.f[0]++; // 函数被调用
  cov.s[0]++; // 语句执行
  if (x) {
    cov.b[0][0]++;
    cov.s[1]++;
    return 1;
  } // then 分支
  cov.b[0][1]++; // else（隐式）分支
  cov.s[2]++;
  return 2;
}
```

具体插桩通常由 **`babel-plugin-istanbul`** 在 Babel 编译阶段完成。注意：插桩本身**不生成报告**，只负责往代码里加计数逻辑，报告由上层工具读 `__coverage__` 产出。

### 2.3 历史与现状

- **~2012**：Krishnan 发布原始 `istanbul` 包，迅速成为事实标准。
- **中期**：命令行入口被重写为 **`nyc`**（由 istanbuljs 组织维护），原始 `istanbul` 包不再维护。今天说的 "Istanbul" 其实是 **istanbuljs 整套生态**（`nyc`、`babel-plugin-istanbul`、`istanbul-lib-*` 等）。
- **现状**：依旧广泛使用（Vitest 官方称 "battle-tested for over 13 years"），是**跨运行时、跨框架**覆盖率的可靠选择；但在 Vite / Vitest 生态里，默认地位已让给 V8。

## 3. V8 vs Istanbul：根本区别

| 维度       | **Istanbul（插桩）**                                | **V8（原生）**                                       |
| ---------- | --------------------------------------------------- | ---------------------------------------------------- |
| 原理       | 运行**前**改写源码注入计数器                        | 引擎运行**时**自带计数（Ignition + feedback vector） |
| 是否动源码 | ✅ 要预处理 / 转译                                  | ❌ 源码原样执行，无预处理                            |
| 运行环境   | **任何 JS 运行时**（浏览器 / Node / Bun / Firefox） | **只在 V8 上**（Chrome / Node；Firefox、Bun 不支持） |
| 速度       | 慢（插桩有运行时开销、文件变大）                    | 快                                                   |
| 内存       | 较高                                                | 较低                                                 |
| 准确性     | 一直很准（直接基于 AST）                            | 早期较粗，现靠 AST 重映射已追平                      |

一句话：**Istanbul 是「改你的代码来数」，V8 是「让引擎帮你数」。**

## 4. 在 Vitest 里怎么选

Vitest 通过 `coverage.provider` 配置（默认 `'v8'`）：

**默认选 `v8`**——官方原话 "✅ Recommended option to use"。理由：免插桩、源码原样跑、更快更省内存；且自 **v3.2.0 起 V8 provider 使用 AST-based remapping**，产出报告与 Istanbul **一致**（官方："the speed of V8 coverage with accuracy of Istanbul coverage"）。

**这些情况才切到 `istanbul`**：

- 目标运行时**不是 V8**（如在 **Firefox、Bun** 下跑测试）——V8 provider 直接不可用；
- 项目已深度依赖 Istanbul 生态 / 历史报告格式，想保持一致；
- 个别工作负载下实测 Istanbul 反而更快（官方承认 "in some cases faster than V8"）。

安装（首次运行 `--coverage` 时 Vitest 会提示自动安装）：

```bash
npm i -D @vitest/coverage-v8        # 默认，推荐
npm i -D @vitest/coverage-istanbul  # 跨运行时 / 特定场景
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // 或 "istanbul"
    },
  },
});
```

## 5. 常见误区

- 以为 best-effort 与 precise 只差在 GC：还差在「二进制 vs 执行次数」「计数是否受优化影响」「是否零开销常驻」三处。
- 以为「V8 优化会导致函数不被计入覆盖」：优化只影响**执行次数的准确性**，不影响「是否覆盖」的判定；且该限制约 2019 年已在引擎侧解除。
- 以为 V8 provider 精度不如 Istanbul：自 Vitest v3.2.0 起 AST 重映射后两者报告一致。
- 以为 Istanbul 已经死了：原始 `istanbul` 包停更，但 `nyc` + `babel-plugin-istanbul` 生态仍活跃，是跨运行时的首选。
- 在 Firefox / Bun 等非 V8 环境仍用默认 `v8` provider：会直接不可用，需切 `istanbul`。

## 来源

- https://v8.dev/blog/javascript-code-coverage （V8 官方博客：覆盖率用途、function/block 粒度、best-effort vs precise 机制、invocation counter、`IncBlockCounter`；逐字引用自原文，原文 2017 发布且至今未更新）
- https://docs.google.com/document/d/1wCydi2HEZRF0skDeLb6CH0abZnTyVo5Vz5u-jhwi7es/mobilebasic （V8 Block Code Coverage 设计文档：`crrev.com/c/1613996` 解除「块覆盖需关优化」限制、计数移入 builtin、`web-tooling-benchmark` ~40% 最坏开销）
- https://vitest.dev/guide/coverage （Vitest 覆盖率指南：v8 默认且推荐、v8/istanbul 优缺点对比、AST-based remapping 自 v3.2.0、安装命令）
- https://github.com/istanbuljs/nyc 与 https://github.com/istanbuljs/babel-plugin-istanbul （Istanbul 生态：`nyc` CLI、`babel-plugin-istanbul` 插桩原理与 `__coverage__`）
- https://ariya.io/2012/12/javascript-code-coverage-with-istanbul 与 https://github.com/gotwarlost （Istanbul 起源、作者 Krishnan Anantheswaran）
