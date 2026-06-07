---
title: Testing Methodology
created: 2026-06-07
updated: 2026-06-07
type: topic
tags: ["methodology", "ai", "advanced"]
sources:
  - ../../docs/018-engineering-testing-methodology-and-ai.md
  - https://cn.vitest.dev/guide/learn/writing-tests-with-ai.html
  - https://cn.vitest.dev/guide/cli.html
  - https://vitest.dev/config/coverage
  - https://vitest.dev/config/pool
  - https://stryker-mutator.io/docs/stryker-js/vitest-runner/
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
- 分层决策框架（L0–L3 + AI 层）及测试金字塔/奖杯、DORA、风险驱动等为**经验性归纳**（基于业界通用测试理论），属经验总结层，已在 `docs/018` 显式标注。

## 最近更新

- 2026-06-07 `ingest` docs/018：新建本主题页，沉淀五层方法论（价值/策略/战术/运营/AI）、mock 线与抗重构、覆盖率防倒退+变异测试、分层反馈钩子、AI 事实源角色分离与自动护栏。

## 关联文档

- [018-engineering-testing-methodology-and-ai.md](../../docs/018-engineering-testing-methodology-and-ai.md)

## 来源

- [Vitest 官方《Writing Tests with AI》](https://cn.vitest.dev/guide/learn/writing-tests-with-ai.html)（一级，AI 层各结论）
- [Vitest CLI](https://cn.vitest.dev/guide/cli.html)（一级，`--changed`/`--related`/`--shard`/`run`）
- [Vitest config/coverage](https://vitest.dev/config/coverage)（一级，`thresholds.autoUpdate`/glob/`perFile`/四指标）
- [Vitest config/pool](https://vitest.dev/config/pool)（一级，`pool` 取值与默认 `forks`）
- [StrykerJS Vitest runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)（二级，变异测试支持）
- [018-engineering-testing-methodology-and-ai.md](../../docs/018-engineering-testing-methodology-and-ai.md)（三级，本主题发布文档）
- 测试金字塔（Mike Cohn）/ 奖杯（Kent C. Dodds）/ 黑白盒分层（Martin Fowler）/ DORA 四指标（《Accelerate》）——通用测试理论，经验总结层

## 相关主题

- [[coverage]] - 覆盖率四指标、provider、`thresholds` 门禁的配置细节
- [[mocking]] - `vi.fn/vi.spyOn/vi.mock` 与清理策略（mock 线的具体 API）
- [[execution-model]] - 顺序/并发执行模型（L3 性能的底层）
