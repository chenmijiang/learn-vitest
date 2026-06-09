---
title: Testing Methodology
created: 2026-06-07
updated: 2026-06-09
type: topic
tags: ["methodology", "ai", "advanced"]
sources:
  - ../../docs/018-engineering-testing-methodology-and-ai.md
  - https://cn.vitest.dev/guide/learn/writing-tests-with-ai.html
  - https://cn.vitest.dev/guide/cli.html
  - https://vitest.dev/config/coverage
  - https://vitest.dev/config/pool
  - https://stryker-mutator.io/docs/stryker-js/vitest-runner/
  - https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/
  - https://stryker-mutator.io/docs/stryker-js/configuration/
---

# Testing Methodology（工程化测试方法论）

## 一句话总结

把 Vitest 用进真实项目是一套**分层决策**：先定「为什么测/看什么指标」（价值层），再定「测什么/怎么分布」（策略层），最后才是「怎么写/怎么跑得快」（战术与运营层）；AI 能写测试后，方法论不缩水，而是换成「人定规则 + 自动护栏」的形态，且价值层与验证门禁的权重反而上升。

## 适用场景

- 给真实项目从 0 引入测试、或制定团队测试规范时，需要可复用的判断框架而非零散技巧。
- 纠结「写了一堆测试却没信心 / 覆盖率高但还是出 bug / 测试一改就崩 / 套件越跑越慢」。
- 想用 AI 生成测试，但担心质量、抗重构性与维护成本。

## 核心概念

### 决策有层级，上层决定下层

| 层      | 回答                               | 谁主导            | 默认结论                                                                         |
| ------- | ---------------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| L0 价值 | 为什么测？看哪个指标？投到哪收手？ | 人                | 主轴=变更信心/防回归；北极星=漏到线上的 bug 数；护栏=flaky≈0；投入按边际收益递减 |
| L1 策略 | 测什么？怎么分布？                 | 人                | 边界=对外公共 API；形状=前端奖杯·后端金字塔；选择=风险驱动+不测清单              |
| L2 战术 | 每个用例怎么写？                   | AI 主力+人审      | mock 只在 IO 边界；用例=等价类+边界值+错误路径；覆盖率只找漏不当 KPI             |
| L3 运营 | 怎么不越跑越慢？                   | 工具+CI           | 分层反馈：内循环只跑快 unit，慢测进 CI                                           |
| AI 层   | AI 写测试怎么变？                  | 人定规则+自动护栏 | 实现=上下文、规格=断言源；自动护栏为主、人只审意图                               |

### 抗重构的总开关：mock 线

只 mock「无法控制/不确定/慢」的进程/IO 边界（网络、时间、随机、第三方 SaaS）；**自己写的代码（含 DB 访问层、内部 service）一律走真实**。mock 了自己的代码 = 重构内部协作时测试照崩，抗重构失效。

### 覆盖率：只找漏、不当 KPI，用机制兜底

- CI 不卡绝对值，改卡「不下降 + 变更行覆盖」：Vitest `coverage.thresholds.autoUpdate`（棘轮，只升不降）+ glob 键按路径设阈值 + `perFile`。
- 看 `branches` 优先于 `lines`；四指标 `lines/functions/branches/statements`。
- 覆盖率能 100% 而测试啥都没抓到——真正的有效性裁判是**变异测试**（StrykerJS `@stryker-mutator/vitest-runner`）。

### 变异测试与 `@stryker-mutator/vitest-runner`

- **变异测试解决什么**：覆盖率只回答「代码有没有被执行」，不回答「测试有没有效」。变异测试由 StrykerJS 往源码植入微小 bug（变异体，如 `+`→`-`、`>`→`>=`、删行），每植入一个就跑一遍测试套件——有测试因此失败=变异体被「杀死」（说明该处断言有效），测试仍全绿=变异体「存活」（暴露断言缺失）。最终的**变异分数**（killed / total）才是测试有效性的客观量化（杀死/存活/分数为变异测试通用术语，非 runner 文档定义）。
- **runner 的角色**：`@stryker-mutator/vitest-runner` 是 StrykerJS 与 Vitest 之间的「桥」——Stryker 负责生成变异体与统计，Vitest 负责真正跑你已有的测试。它**不自带 Vitest**，需项目自行安装；StrykerJS 7.0 起官方支持。已用 Vitest 的项目可直接复用现有测试做有效性评估。
- **配置（写在 `stryker.config.json`）**：`vitest.configFile`（指定 Vitest 配置文件）、`vitest.dir`（对应 `--dir`，v7.1+）、`vitest.related`（默认 `true`，只跑与被变异文件相关的测试以提速）。
- **限制与强制项**：仅支持 `threads: true`（不支持关线程的单进程模式）；**不支持 Browser Mode**；`coverageAnalysis` 被忽略，runner 始终用 `perTest`（性能最优）。→ 故本项目这类 Browser Mode 组件测试当前**无法**直接用该 runner 做变异测试。

### 读懂 StrykerJS 的命令行（clear-text）输出

适用任意 runner（jest/vitest 等）；下面术语与符号均按官方文档与 Stryker 源码核实。

- **八种变异体状态与分类**：
  - `Killed`（至少一个测试失败）、`Timeout`（超时/死循环）→ 合为 **Detected（已检测，好）**。
  - `Survived`（所有测试都通过）、`No coverage`（无测试覆盖）→ 合为 **Undetected（漏网）**——这才是要补的测试缺口。
  - `Runtime error` / `Compile error` → **Invalid（无效，不计分）**；`Ignored`（被配置忽略）；`Pending`（尚未运行，临时态）。
- **指标与分数公式**：`Detected=killed+timeout`；`Undetected=survived+no coverage`；`Covered=detected+survived`；`Valid=detected+undetected`。**变异分数 = detected / valid × 100%**；另有「基于覆盖代码的分数 = detected / covered × 100%」（排除根本没覆盖到的部分）。
- **测试列表的符号**（clear-text reporter，每个测试一行）：`✓`(绿) `(killed N)` = 该测试杀死 N 个变异体；`~`(蓝) `(covered N)` = 覆盖到变异体所在代码却一个没杀（**断言偏弱的信号**）；`✘`(红) = 没覆盖任何变异体。
- **`[Survived]` 块怎么读**：结构 = 变异类型(mutator，如 `StringLiteral`/`ArrayDeclaration`/`ArithmeticOperator`) + `文件:行:列` + diff（`-`原始 / `+`改坏后）+ `Tests ran:` 列表。每个存活块都是一处「该补的断言」。
- **`Tests ran:` 的含义**（最易误解）：在 `coverageAnalysis: "perTest"` 下，Stryker 只执行「覆盖被改那一行」的测试（性能优化），所以这里只列出**部分**测试名——含义是「这些已存在的真实测试被跑了却全部通过 → 变异体存活」，直接指向「去哪个已有测试补断言」。列表为空/无测试则属 `No coverage`，缺的是新用例而非断言。
- **测试名找不到的坑**：报告里的测试名 = `describe` 名 + 空格 + `it` 名 拼接（Jest 约定）。若 `describe` 用动态变量（如 `describe(Foo.name, ...)`），源码里并不存在该字面量，按整句 grep 会搜不到——应只搜 `it` 那半句来定位。
- **实战落地**：弱断言（如只写 `expect(navigateStub).toHaveBeenCalled()`）会让 `StringLiteral`/`ArrayDeclaration` 等大量变异体存活；补强为断言「调用参数 / 渲染结果」即可把它们从 survived 变成 killed。`html` reporter 生成的可视化报告（默认 `reports/mutation/mutation.html`）逐行高亮存活变异体，比读控制台直观。

### StrykerJS 关键配置项（`mutate` / `testFiles` / `coverageAnalysis`）

三者作用在变异测试的不同环节，常被混淆；以下按 `@stryker-mutator/core` 的 JSON Schema 逐字核实（runner 无关）。

- **`mutate` —— 选「被变异的源文件」**（被考核对象）。指定哪些**生产代码**文件会被植入变异体；Schema 明确「绝不要包含测试文件」。默认智能猜测 `{src,lib}/**` 下源码并自动排除 `*.spec`/`*.test`/`__tests__`。支持 glob 与 `!` 取反，另支持**行/列范围**只变异某段：`"src/app.js:1-11"`、`"src/app.js:5:4-6:4"`（范围语法不能与 glob 写在同一条）。
- **`testFiles` —— 选「执行哪些测试」**（用来杀变异体的武器）。默认 `[]`（不限制，交给 runner 跑全部相关测试）。设定后只跑这些测试文件，支持 glob。官方典型用途：把测试锁定到某模块自己的 spec，**验证该模块的专属单测能否独立杀光它的变异体**，避免变异体被不相关的集成测试顺手杀掉而误判单测质量。常与 `mutate` 成对用做模块级自检：`mutate:["src/utils.ts"] + testFiles:["test/utils.spec.ts"]`。
- **`coverageAnalysis` —— 选「每个变异体跑哪些测试」的策略**（性能旋钮）。当前 Schema 默认 `perTest`（旧描述文案写的「`off`(default)」已过时，以 Schema `default` 字段为准）：
  - `off`：每个变异体都跑**整套**测试，最慢，无前提。
  - `all`：干跑时统计「整套测试**整体**覆盖了哪些代码」→ 无任何测试覆盖的变异体直接判 `No coverage`（免跑）；但被覆盖的仍跑整套。
  - `perTest`（默认/最快）：干跑时**逐条测试**记录「该测试碰过哪些行」，建一张「行 ↔ 覆盖它的测试」表；变异某行时**反查表、只跑碰过该行的那几个测试**，跳过不相关的。这也是 `[Survived]` 块 `Tests ran:` 能精确列名的原因。
- **`perTest` 的前提与边界**：测试须**相互独立**——若依赖执行顺序/共享可变状态，单独挑测试跑会失真，应退回 `all`/`off`。能否用还取决于 runner：`jest`/`vitest` 支持；`command` runner 实际只能 `off`；`@stryker-mutator/vitest-runner` 会**忽略**该配置、强制 `perTest`。
- **辨析**：`mutate`（变异哪些已入沙箱的源文件）≠ `ignorePatterns`（哪些文件根本不复制进沙箱，更早一步）；`testFiles`（再筛一层测试范围）≠ `testRunner`（用哪个框架跑测试）。

### 分层反馈（L3 落地钩子）

- 内循环：`vitest --changed [commit]`、`vitest related <files> --run`（lint-staged）。
- CI：`vitest run --shard=<i>/<n>`（仅 run 模式）；`pool` 取 `threads/forks/vmThreads/vmForks`，默认 `forks`；CI 必用 `vitest run`/`--run` 关 watch。

### AI 辅助：事实源角色分离 + 自动护栏

- **实现=写法上下文，规格/意图=断言事实源**。官方建议给 AI 看实现（否则 API 用错/不合约定），但断言必须基于行为，不得断言内部结构，否则同源污染、重构必崩。
- **验证门禁自动化**（人工逐条审会成瓶颈）：lint 禁 `jest.*`/弱断言/快照，配 `restoreMocks: true` 防泄漏；变异测试当客观裁判；人只审「断言是否对齐业务意图」。
- 载体：把规则写进 `AGENTS.md`（AI 自动遵循）；生成后立即 `vitest run`；用自然语言迭代（"这些 mock 太多，改成测真实集成"）。

## 常见误区

- 把覆盖率/测试数量当北极星——它们是产出不是结果，会被刷出虚高而逃逸 bug 不减。
- 测自己的代码时把内部协作者也 mock 了——头号脆测试来源，毁掉抗重构。
- 从 L2「怎么写」切入做方法论——不先定 L0 价值主轴，无法回答「看哪些指标/投到哪收手」。
- 以为 AI 能写测试 = 方法论可省——恰恰相反，判断该测什么与验证测得对的权重上升。
- 让 AI「看着代码写测试」且不约束断言依据——产生实现耦合+弱断言的同源测试。
- AI 测试只靠人审——量产后人是瓶颈，必须自动护栏（lint+配置+变异测试）兜底。

## 证据状态

`已验证`（2026-06-07）：

- Vitest 具体机制（`coverage.thresholds.autoUpdate`/glob/`perFile`/四指标、`--changed`/`--related`/`--shard`/`vitest run`、`pool` 默认 `forks`、官方《Writing Tests with AI》各反模式与 `restoreMocks`/`AGENTS.md`、StrykerJS 支持 vitest）均经官方文档/源码核实，16/16 正确。

`已验证`（2026-06-09，对照 StrykerJS 官方 Vitest runner 文档）：

- `@stryker-mutator/vitest-runner` 为 StrykerJS↔Vitest 桥接、需自带 Vitest、7.0 起支持；配置项 `vitest.configFile`/`vitest.dir`（v7.1+）/`vitest.related`（默认 `true`）；限制：仅 `threads:true`、不支持 Browser Mode、`coverageAnalysis` 强制 `perTest`——均经官方文档核实。
- 变异体「杀死/存活/变异分数」为变异测试**通用术语**（runner 文档未逐字定义），属经验/标准知识层。
- 分层决策框架（L0–L3 + AI 层）及测试金字塔/奖杯、DORA、风险驱动等为**经验性归纳**（基于业界通用测试理论），属经验总结层，已在 `docs/018` 显式标注。

`已验证`（2026-06-09，新增「读懂 StrykerJS 输出」小节）：

- 八种变异体状态、Detected/Undetected/Covered/Valid 分组、两种变异分数公式（`detected/valid`、`detected/covered`）——经 StrykerJS 官方《Mutant states and metrics》核实。
- clear-text 测试列表符号 `✓`(killed) / `~`(covered) / `✘`——经 Stryker 源码 `packages/core/src/reporters/clear-text-reporter.ts` 核实。
- `coverageAnalysis: "perTest"` 下仅跑覆盖被变异行的测试——经官方配置文档核实；测试名 = `describe`+`it` 拼接、动态 `describe` 名 grep 不到——属 Jest 通用约定/实证（robo-coasters-example）。

`已验证`（2026-06-09，新增「StrykerJS 关键配置项」小节）：

- `mutate`（选被变异源文件、默认排除 spec/test/`__tests__`、支持行列范围）、`testFiles`（限定执行的测试文件、默认 `[]`）、`coverageAnalysis`（`off`/`all`/`perTest` 三策略，Schema `default` 字段为 `perTest`）——均经项目内 `@stryker-mutator/core/schema/stryker-schema.json` 字段描述与默认值逐字核实。
- 注：Schema 中 `coverageAnalysis` 的描述文案仍写「`off`(default)」，与机器可读的 `default: "perTest"` 不一致，以后者为准。

## 最近更新

- 2026-06-07 `ingest` docs/018：新建本主题页，沉淀五层方法论（价值/策略/战术/运营/AI）、mock 线与抗重构、覆盖率防倒退+变异测试、分层反馈钩子、AI 事实源角色分离与自动护栏。
- 2026-06-09 `query-update`：把「变异测试」从一句提及扩成独立小节——解释变异测试解决什么（杀死/存活/变异分数）、`@stryker-mutator/vitest-runner` 作为 Stryker↔Vitest 桥的角色、配置项与限制（仅 `threads:true`、不支持 Browser Mode、强制 `perTest`）。
- 2026-06-09 `query-update`：新增「读懂 StrykerJS 的命令行输出」小节——八种变异体状态与 Detected/Undetected 分组、两种变异分数公式、clear-text 测试列表 `✓`/`~`/`✘` 符号、`[Survived]` 块结构与 `Tests ran:` 在 `perTest` 下的含义、测试名拼接（`describe`+`it`）导致整句 grep 不到的坑。
- 2026-06-09 `query-update`：新增「StrykerJS 关键配置项」小节——`mutate`（被变异源文件/行列范围）、`testFiles`（限定执行的测试/模块级自检）、`coverageAnalysis`（`off`/`all`/`perTest` 三策略与 `perTest` 工作原理、前提与 runner 边界），并辨析 vs `ignorePatterns` / `testRunner`。

## 关联文档

- [018-engineering-testing-methodology-and-ai.md](../../docs/018-engineering-testing-methodology-and-ai.md)

## 来源

- [Vitest 官方《Writing Tests with AI》](https://cn.vitest.dev/guide/learn/writing-tests-with-ai.html)（一级，AI 层各结论）
- [Vitest CLI](https://cn.vitest.dev/guide/cli.html)（一级，`--changed`/`--related`/`--shard`/`run`）
- [Vitest config/coverage](https://vitest.dev/config/coverage)（一级，`thresholds.autoUpdate`/glob/`perFile`/四指标）
- [Vitest config/pool](https://vitest.dev/config/pool)（一级，`pool` 取值与默认 `forks`）
- [StrykerJS Vitest runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)（二级，变异测试支持）
- [StrykerJS Mutant states and metrics](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)（二级，八种状态/指标分组/两种变异分数公式）
- [StrykerJS Configuration · coverageAnalysis](https://stryker-mutator.io/docs/stryker-js/configuration/#coverageanalysis-string)（二级，`perTest` 仅跑覆盖被变异行的测试）
- StrykerJS 源码 `packages/core/src/reporters/clear-text-reporter.ts`（二级，`✓`/`~`/`✘` 符号语义）
- StrykerJS Schema `@stryker-mutator/core/schema/stryker-schema.json`（二级，`mutate`/`testFiles`/`coverageAnalysis` 字段描述与默认值的权威来源）
- [018-engineering-testing-methodology-and-ai.md](../../docs/018-engineering-testing-methodology-and-ai.md)（三级，本主题发布文档）
- 测试金字塔（Mike Cohn）/ 奖杯（Kent C. Dodds）/ 黑白盒分层（Martin Fowler）/ DORA 四指标（《Accelerate》）——通用测试理论，经验总结层

## 相关主题

- [[coverage]] - 覆盖率四指标、provider、`thresholds` 门禁的配置细节
- [[mocking]] - `vi.fn/vi.spyOn/vi.mock` 与清理策略（mock 线的具体 API）
- [[execution-model]] - 顺序/并发执行模型（L3 性能的底层）
