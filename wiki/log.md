---
title: Wiki Log
created: 2026-04-14
updated: 2026-06-07
type: summary
tags: []
sources:
  - ./SCHEMA.md
  - ./sources/internal-docs-map.md
---

# Wiki Log

> 维护规则见 [[SCHEMA]]；主题导航见 [[index]]；文档映射以 [[sources/internal-docs-map]] 为准。

## 2026-06-09

- `query-update`
  - trigger: 问答「`@stryker-mutator/vitest-runner` 是什么、解决什么问题」，产出 wiki 仅一句提及、尚未展开的可复用结论
  - changed:
    - `wiki/topics/testing-methodology.md`：把覆盖率小节里对「变异测试」的一句提及扩成独立小节「变异测试与 `@stryker-mutator/vitest-runner`」——变异测试解决什么（植入变异体/杀死/存活/变异分数）、runner 作为 Stryker↔Vitest 桥的角色（不自带 Vitest、7.0 起支持）、配置项（`vitest.configFile`/`vitest.dir` v7.1+/`vitest.related` 默认 true）、限制（仅 `threads:true`、不支持 Browser Mode、`coverageAnalysis` 强制 `perTest`，并点明本项目 Browser Mode 组件测试当前无法直接用该 runner）；证据状态 +「2026-06-09 已验证」段；最近更新 +1 条；frontmatter `updated`→2026-06-09
    - `wiki/index.md`：Testing Methodology 条目摘要补变异测试与 runner（桥/配置/限制），`updated`→2026-06-09（`sources: 6` 不变，stryker-mutator.io 已在该页来源中）；index frontmatter `updated`→2026-06-09
    - `wiki/log.md`
  - source:
    - https://stryker-mutator.io/docs/stryker-js/vitest-runner/（一级 StrykerJS 官方）
    - https://stryker-mutator.io/blog/announcing-stryker-js-7/（7.0 起支持 Vitest）
    - https://www.npmjs.com/package/@stryker-mutator/vitest-runner
  - evidence: runner=Stryker↔Vitest 桥、需自带 Vitest、配置项 `configFile`/`dir`(v7.1+)/`related`(默认 true)、限制仅 `threads:true`+不支持 Browser Mode+强制 `perTest`，均经官方文档（WebFetch 两次）核实；杀死/存活/变异分数标注为变异测试通用术语（runner 文档未逐字定义），属经验/标准知识层
  - map: 无新增 `docs/NNN`，文档关系未变，`internal-docs-map.md` 不动（来源为官方，且 stryker 来源原已随 docs/018 列入本 topic）
  - quality-gate: 已写 log；map 与 topic 关联文档一致（未变）；index 条目带摘要/更新时间/来源数量；链接有效；来源官方优先（stryker-mutator.io 一级）

## 2026-06-07

- `ingest`
  - changed:
    - `docs/018-engineering-testing-methodology-and-ai.md`（新建，由 conversation-summary 生成）
    - `wiki/SCHEMA.md`（tag taxonomy 新增 `methodology`、`ai`）
    - `wiki/topics/testing-methodology.md`（新建 topic 页）
    - `wiki/sources/internal-docs-map.md`（frontmatter 加 018；相关页面加 [[topics/testing-methodology]]；新增「Testing Methodology」节 primary→018；`updated`→2026-06-07）
    - `wiki/index.md`（主题导航新增 Testing Methodology 条目；`updated`→2026-06-07）
    - `wiki/log.md`
  - source:
    - ../../docs/018-engineering-testing-methodology-and-ai.md
    - https://cn.vitest.dev/guide/learn/writing-tests-with-ai.html
    - https://cn.vitest.dev/guide/coverage.html
    - https://vitest.dev/config/coverage
    - https://cn.vitest.dev/guide/cli.html
    - https://vitest.dev/config/pool
    - https://stryker-mutator.io/docs/stryker-js/vitest-runner/
  - note: 并入新建发布文档 `docs/018`（工程化测试方法论：从「为什么测」到「怎么落地」含 AI 辅助），源自 `/grill-me` 连续多轮拷问——确立 L0 价值层（主轴=变更信心/防回归、北极星=漏到线上的 bug 数、护栏=flaky≈0、ROI=边际收益递减+阶段感知）、L1 策略层（被测单元=对外公共 API、形状=前端奖杯·后端金字塔、风险驱动+不测清单）、L2 战术层（mock 只在 IO 边界、用例=等价类+边界值+错误路径、覆盖率不卡绝对值改卡不下降`autoUpdate`+变更行+变异测试）、L3 运营层（分层反馈、`--changed`/`--related`/`--shard`/`pool`默认`forks`），及 AI 横切层（事实源角色分离：实现=上下文/规格=断言源；验证门禁自动化为主、人只审意图；载体=`AGENTS.md`）。无现成 topic 可干净吸收（现有均按功能切分），按避免碎片化原则新建单一 topic [[testing-methodology]]，AI 层作为其中一节而非另拆页；交叉链 [[coverage]]/[[mocking]]/[[execution-model]]。Vitest 具体机制 16/16 经官方文档/源码核实（reviewer 子代理复核）；分层框架与金字塔/奖杯/DORA 等通用测试理论标注为经验总结层。SCHEMA tag taxonomy 先补 `methodology`、`ai` 再使用，符合「新标签先登记」规则。
  - quality-gate: 已写 log；map「Testing Methodology」primary→018 与 topic 页关联文档一致；index 条目带摘要/更新时间/来源数量（`sources: 6`）；新建页含 8 个必备小节（含证据状态/最近更新）+ ≥2 条 wikilinks；链接有效；来源官方优先（cn.vitest.dev/vitest.dev/stryker-mutator.io）。

## 2026-06-06

- `query-update`
  - trigger: 问答「coverage 配置：watermarks 作用 / thresholds 按文件还是整体判 / processingConcurrency 是什么」，产出 wiki 未覆盖的可复用结论
  - changed:
    - `wiki/topics/coverage.md`：Thresholds 小节加「判定基准：整体 vs 逐文件」子段；新增「Watermarks 与 processingConcurrency」小节 + 三阶段心智模型；常见误区 +3；证据状态 +1 行（2026-06-06，对照本地源码）；最近更新 +1 条
    - `wiki/index.md`：Coverage 条目摘要补 thresholds 整体/逐文件判定、watermarks、processingConcurrency（`updated` 保持 2026-06-06，`sources: 3` 不变）
  - evidence:
    - `thresholds` 判定基准源码 `packages/vitest/src/node/coverage.ts:497-575`（perFile 决定 `getCoverageSummary()` 整体 vs `files().map()` 逐文件；正负数语义；`process.exitCode = 1`）
    - `watermarks` 默认 `[50,80]`（`defaults.ts:52`）、传给 istanbul-reports（`coverage-v8/src/provider.ts:141`）
    - `processingConcurrency` 默认 `Math.min(20, availableParallelism ?? cpus.length)`（`defaults.ts:46`）、报告处理切 chunk 并发（`coverage-v8/src/provider.ts:181/445`）
  - map: 无新增 `docs/NNN`，`internal-docs-map.md` Coverage primary→017 不变
  - quality-gate: 已写 log；map 与 topic 关联文档一致（未变）；index 条目带摘要/更新时间/来源数量；链接有效；来源本地源码 + 官方配置页

- `query-update`
  - trigger: 问答「coverage 的 reporter 是什么 / 不同类型 reporter 的场景 / 为何 provider=v8 但报表显示 istanbul」，产出 wiki 未覆盖的可复用结论
  - changed:
    - `wiki/topics/coverage.md`：核心概念新增「Provider 与 Reporter 是两件事」「Reporter 类型与适用场景」两小节；常见误区 +1；证据状态 +1 行（2026-06-06，对照本地源码）；最近更新 +1 条
    - `wiki/index.md`：Coverage 条目摘要补 provider/reporter 分层与 reporter 场景对照（`updated` 保持 2026-06-06，`sources: 3` 不变）
  - evidence:
    - 本地源码 `packages/coverage-v8/src/provider.ts:11-12,153` 与 `packages/coverage-istanbul/src/provider.ts:12/14/201` 均 import 并调用 `istanbul-lib-report`/`istanbul-reports`
    - reporter 名单 `cli/completions.ts`、`config/resolveConfig.ts`；默认值 `defaults.ts:41`
    - 实测某 v8 项目 `coverage/index.html` 底部链接 `istanbul.js.org`，html 资源为 istanbul-reports 模板自带
  - map: 无新增 `docs/NNN`，`internal-docs-map.md` Coverage primary→017 已存在，无需改动
  - quality-gate: 已写 log；map 与 topic 关联文档一致（未变）；index 条目带摘要/更新时间/来源数量；链接有效；来源官方+源码

- `ingest`
  - changed:
    - `docs/017-coverage-internals-v8-vs-istanbul.md`（新建，由 conversation-summary 生成）
    - `wiki/topics/coverage.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - ../../docs/017-coverage-internals-v8-vs-istanbul.md
    - https://v8.dev/blog/javascript-code-coverage
    - https://docs.google.com/document/d/1wCydi2HEZRF0skDeLb6CH0abZnTyVo5Vz5u-jhwi7es/mobilebasic
    - https://vitest.dev/guide/coverage
    - https://github.com/istanbuljs/nyc
    - https://github.com/istanbuljs/babel-plugin-istanbul
    - https://ariya.io/2012/12/javascript-code-coverage-with-istanbul
  - note: 并入新建发布文档 `docs/017`（覆盖率底层原理：V8 原生覆盖 vs Istanbul 插桩——机制/历史/选型），源自用户「分段分析 V8 code coverage 博客 + best-effort/precise 差异 + V8 现状 + Istanbul 是什么/历史/原理/选型」连续四轮问答。primary topic [[coverage]]（现有页偏配置用法，本次补原理深化，不另建页）：核心概念新增「底层原理：插桩 vs 原生（机制速览）」小节——Istanbul=运行前 AST 注入计数器 + 全局 `__coverage__`（`babel-plugin-istanbul`，跨任意运行时但慢/占内存），V8=复用 Ignition 的 invocation counter、源码原样执行，分 best-effort（零开销/仅二进制/GC 丢数据）与 precise（钉 feedback vector 防丢/可报执行次数/计数全准需关优化）两模式；并补历史与精度三点：V8「精确计数需关优化」限制约 2019 年（`crrev.com/c/1613996`）解除（函数可在所有块覆盖模式下优化内联）、Istanbul ~2012 由 Yahoo Krishnan Anantheswaran 创建且现以 istanbuljs（`nyc`+`babel-plugin-istanbul`）生态存续/原始 `istanbul` 包停更、Vitest 自 v3.2.0 起 V8 用 AST 重映射使报告与 Istanbul 一致。topic frontmatter `updated`→2026-06-06、sources 加 docs/017；关联文档由「暂无」改为 docs/017；证据状态新增 2026-06-06 已验证行；最近更新加 ingest 记录。`internal-docs-map.md` 新增 Coverage primary→017 并入 frontmatter sources。index 条目摘要补底层原理、`updated`→2026-06-06、`sources` 2→3。全部事实对照 V8 官方博客（一级）、V8 Block Coverage 设计文档、Vitest 官方覆盖率指南（一级）、istanbuljs 官方仓库核对为已验证。`coverage`/`config`/`beginner` 标签均在 SCHEMA taxonomy 中。

- `query-update`
  - changed:
    - `wiki/topics/browser-mode.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/guide/browser/playwright-traces.html
  - note: 由 Q&A（用户询问 Playwright trace）触发。把 browser-mode topic 里 `trace` 的一行配置说明扩展为「Playwright Trace（调试录制）」小节：trace 是什么（浏览器模式录制 `.trace.zip` 回放，仅 Playwright provider）、记录内容（DOM 快照/截图/`expect.element` 断言/操作步骤，自动链接回测试源码行）、五种 mode（off/on/on-first-retry/on-all-retries/retain-on-failure，CI 推荐 retain-on-failure 或 on-first-retry）、对象形式 `{mode,tracesDir,screenshots,snapshots}`、`__traces__/` 默认存储与命名、`npx playwright show-trace` / trace.playwright.dev 查看、`page.mark` 自定义标记。topic frontmatter `updated`→2026-06-06、sources 加 playwright-traces 页；证据状态加 2026-06-06 已验证行；index 条目摘要补 Playwright Trace、`updated`→2026-06-06、`sources` 4→5。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更（纯官方来源回写）。

- `ingest`
  - changed:
    - `docs/016-snapshot-types-and-update-workflow.md`（新建，由 conversation-summary 生成）
    - `wiki/topics/snapshots.md`
    - `wiki/topics/visual-regression.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - ../../docs/016-snapshot-types-and-update-workflow.md
    - https://cn.vitest.dev/guide/snapshot
    - https://cn.vitest.dev/guide/browser/visual-regression-testing.html
  - note: 并入新建发布文档 `docs/016`（Vitest 快照类型全谱与生成/更新/清除工作流）。primary topic [[snapshots]]：核心概念新增 "快照类型全谱（文本 vs 图像）"（产物形态取决于 API 而非环境——Browser Mode 里 `toMatchSnapshot` 仍出 `.snap` 文本，`toMatchScreenshot` 才出 `.png`；文本侧 5 个 API 的存储位置/形态对照表：`toMatchSnapshot`→`__snapshots__/*.snap`、`toMatchInlineSnapshot`→写回测试文件、`toMatchFileSnapshot`→任意指定文件、`toThrowErrorMatching[Inline]Snapshot`→错误消息序列化 `[Error: ...]`）与 "生成 / 更新 / 清除 / 重建工作流"（首次自动生成、`-u`/`--update`、watch 按 `u`、obsolete 随 `-u` 删除、CI `process.env.CI` 为真默认不写快照），补三条常见误区、frontmatter 加两条来源（visual-regression 页 + docs/016）。secondary topic [[visual-regression]]：关联文档加 docs/016、补 frontmatter 来源与最近更新。`internal-docs-map.md` 新增 Snapshots primary→016 与 Visual Regression secondary→016，并入 frontmatter sources。index 两条目同步 `updated`/摘要/`sources`（snapshots 4→6、visual-regression 1→2）。全部 9 条事实经 `vitest-doc-verifier` 对照官方核对为 VERIFIED。`snapshot`/`browser` 标签均在 SCHEMA taxonomy 中。

- `query-update`
  - changed:
    - `wiki/topics/component-testing.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - https://vitest.dev/api/browser/locators
    - https://vitest.dev/guide/browser/
    - https://playwright.dev/docs/codegen
    - https://github.com/vitest-dev/vitest/issues/9530
  - note: 回答用户"Browser Mode + playwright provider 下能否把 `playwright codegen` 录制产物写进 Vitest"。在 [[component-testing]] 的 Locator 系列后新增 "复用 Playwright codegen 的录制产物" 一节：因 locator API fork 自 Playwright（`Ivya`），codegen 的 `getByRole/getByText/getByTestId` 查询与 `.click()/.fill()/.hover()/.selectOptions()` 交互行可适配复用；但不可整段照搬——`import` 换 `vitest/browser` 的 `page` + Vitest `test/expect`、`page.goto` 整页导航 Vitest 无此 API 须改 `render` 挂载、断言改异步 `expect.element`；实操用 `npx playwright codegen <dev server>` 主要为拿稳定 locator 再抠行适配。标注 Vitest 暂无内置录制器（"Test Recorder/Codegen tab" 仅功能提案 issue #9530，未实现，置 `待验证`）。补一条常见误区、两条来源（Playwright codegen、issue #9530），证据状态新增一条已验证 + 一条待验证。index 条目同步 `updated`/摘要、`sources` 11→14。未新增 `docs/NNN-xxx.md`，文档关系未变，`internal-docs-map.md` 不动。

## 2026-06-04

- `query-update`
  - changed:
    - `wiki/topics/component-testing.md`
    - `wiki/topics/environment.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - https://vitest.dev/api/browser/interactivity
    - https://playwright.dev/docs/actionability
    - https://testing-library.com/docs/guiding-principles/
    - https://github.com/enzymejs/enzyme/issues/2556
    - https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl
  - note: 回写一次 grill-me 问答（"browser mode 与 jsdom/happy-dom 模拟环境割裂"）产生的三条可复用结论。[[component-testing]] 新增 "`userEvent` 的保真度：为什么统一 API 名也消不掉与 jsdom 的割裂" 一节——Vitest 的 `userEvent` 是 `@testing-library/user-event` 子集但走 CDP/WebDriver 而非 faking events（对照官方 `api/browser/interactivity`），jsdom 无布局 / 无命中检测靠 JS 合成事件，以"遮罩盖住按钮"为例说明同一行 `click` 两边可相反（Browser Mode 经 Playwright 可操作性检查失败、jsdom 假绿，对照 Playwright `docs/actionability`），并补一条常见误区、两条来源。[[environment]] 新增 "决策清单：什么走 jsdom，什么走 Browser Mode"（保真度光谱 + 触发信号表 + 三条速判启发式 + 经 [[projects]] 共存），并在"组件测试库选型"补"为什么方法论选 testing-library 而非 Enzyme/react-test-renderer"（testing-library 准则"tests resemble how software is used"且不测实现细节、Enzyme 停维护无 React18 适配器、ARIA 浏览器无关为唯一两端通用方法论层），补一条常见误区、三条来源（含一条经验总结）。index 两条目同步 `updated`/`sources`（environment 11→14、component-testing 9→11）与摘要。本次未新增 `docs/NNN-xxx.md`，无文档映射变更，`internal-docs-map.md` 不动。
- `ingest`
  - changed:
    - `wiki/topics/browser-mode.md`（新建）
    - `wiki/sources/internal-docs-map.md`
    - `wiki/index.md`
    - `wiki/log.md`
  - source:
    - ../../docs/015-browser-mode-config-options.md
    - https://cn.vitest.dev/config/
    - https://github.com/vitest-dev/vitest/tree/main/docs/config/browser
  - note: 将新建发布文档 `docs/015-browser-mode-config-options.md`（`test.browser` 配置项全览）并入 wiki。现有 topic 中 component-testing（RTL 方法论）、environment（环境选型）、visual-regression（截图断言）均不适合承载完整的浏览器配置参考，故新建独立 topic [[browser-mode]]：沉淀全部 20 个 `browser.*` 选项按"三件套（enabled/provider/instances）/ 运行行为（headless/viewport/testerHtmlPath/isolate 废弃）/ 服务连接（api 及 allowWrite/allowExec、connectTimeout）/ 截图追踪（screenshotFailures/screenshotDirectory/trace/expect）/ 定位器与 UI（locators._、ui、detailsPanelPosition）/ 脚本命令（orchestratorScripts/commands/trackUnhandledErrors）"分类的名称、类型、默认值与用途，并补 provider 工厂调用、api 网络安全默认值等常见误区。选项清单逐项对照官方仓库 `docs/config/browser/_.md`（main）核对。`internal-docs-map.md` 新增 Browser Mode 小节（primary → 015）并加入 frontmatter sources，index 主题导航新增一条（sources: 4），与 [[environment]]/[[component-testing]]/[[visual-regression]] 交叉链接。`browser`/`config`/`environment` 标签均在 SCHEMA taxonomy 中。

## 2026-06-03

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/coverage.md`（新建）
  - source:
    - https://cn.vitest.dev/guide/coverage
    - https://cn.vitest.dev/config/coverage
  - note: 回答用户连续三轮覆盖率问答（「什么是覆盖率」「有什么用」「旧项目怎么引入」）。wiki 此前无覆盖率主题，新建 [[coverage]] 独立 topic：覆盖率定义（源码被执行比例，与测试体积无关）、四类指标（lines/statements/branches/functions，Branches 最能暴露漏测）、provider（v8 默认 vs istanbul，含包名 `@vitest/coverage-v8` / `@vitest/coverage-istanbul` 与首次运行自动安装提示）、`--coverage` 启用与 `vitest.config.ts` 写法、reporter 与各配置默认值（reporter 默认 `['text','html','clover','json']`、reportsDirectory 默认 `./coverage`、clean 默认 true）、`thresholds` 阈值门禁（正数=最低百分比/负数=最大未覆盖项数/`perFile`/`autoUpdate`/`100`/glob 分目录）、旧项目六步引入与「防倒退优先于达标」门禁策略。provider/包名/配置字段/默认值/thresholds 均对照官方核对，类比与门禁打法标注为经验总结。`coverage` 标签已在 SCHEMA taxonomy 中。暂无对应 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更，index 主题导航新增一条（sources: 2）。

## 2026-06-01

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://vitest.dev/guide/browser/locators
    - https://github.com/vitest-dev/vitest-browser-react
  - note: 回答用户"`vitest-browser-react` 与 `vitest/browser` 都能拿定位器方法,两者区别及实战用法"。在 [[component-testing]] 的 "Locator" 一节后新增 "`page` vs `render()` 返回的 `screen`:作用域差别" 一节:两者返回同一种 locator 对象、API 一致,区别只在 scope —— `page`(`vitest/browser`)默认查整个 document(`document.body`),`screen`(`render()` 返回值)收窄到渲染组件容器子树(约等于 `page.elementLocator(container)`),`render()` 默认自动 cleanup、`/pure` 可关闭;实战默认用 `screen`,元素在组件子树之外(典型 React Portal: Modal/Dialog/Toast 挂到 body)才用 `page`,可 `page.elementLocator(el)` 手动框定、同测试可混用,口诀"优先 screen,够不着再上 page"。补一条 Portal 常见误区。两个来源(locators 页 + vitest-browser-react README)均已在 sources 中,source 数不变(9)。未新增 `docs/NNN-xxx.md`,`internal-docs-map.md` 无需变更。

## 2026-05-31

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
    - `wiki/topics/hooks.md`
  - source:
    - https://testing-library.com/docs/react-testing-library/api/
  - note: 回答用户"`@testing-library/react` 的 `act` / `renderHook` 用途"。在 [[component-testing]] 新增 "经典 RTL 的 `act` / `renderHook`（与 Browser Mode 的边界）" 一节：`act` 是 React 官方 `act()` 轻包装，`render`/`fireEvent`/`user-event` 内部已包 act、日常不必手写，仅在绕过交互直接改 state 或出现 `not wrapped in act` 警告时手写，官方建议从 `@testing-library/react` 导入；`renderHook` 是 `render` + 内部空组件封装，返回 `result`/`rerender`/`unmount`，官方更推荐真实组件 + `render`，不是默认选择。明确二者属经典 RTL（jsdom/node），与本项目 Browser Mode 异步可重试断言为不同基建。同步补两条常见误区、新增官方 React API 来源（sources 8→9），并在 [[hooks]] 相关主题加一行消歧交叉链接（Vitest 生命周期 hooks ≠ React 自定义 Hook 测试）。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-29

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://vitest.dev/guide/browser/locators
  - note: 在 [[component-testing]] 新增 "Locator：惰性、可重试的元素句柄" 一节，澄清用户对"locator 是 testing-library 封装"的误解——`page.getBy*` 返回 locator（非元素，与 testing-library 立即返回元素不同），三特性（惰性求值 / 自动重试 / 可组合），`element()/query()/elements()` 与 `expect.element` 的关系；并明确"封装"的准确性质：`getBy*` 对齐 testing-library 语义/命名，但实现 fork 自 Playwright locators（`Ivya`），真正被封装的是 provider 层（playwright 原生、webdriverio/preview 转 CSS 选择器）。新增官方 locators 来源（sources 7→8）。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
  - note: 在 [[component-testing]] "核心概念"前置新增 "ARIA：role 与 accessible name（查询的语义地基）" 一节，解释 role（多数来自原生标签隐含角色）与 accessible name（`aria-labelledby`/`aria-label`/`<label>`/文本/`title`）的来源及其与 `getByRole` / `getByLabelText` 的对应关系，点明"优先语义化原生 HTML"的 ARIA 第一法则，作为查询优先级的语义背景。新增 MDN ARIA 来源（sources 6→7）。未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/guide/browser/
  - note: 在 [[environment]] 证据状态补记一条已验证事实——Browser Mode 经 `test.browser.enabled: true` 启用（独立于 `environment` 字段，需 `provider` + `instances`），官方 `guide/browser/` 已移除 "experimental" 标记。源自本日 lint 的官方文档抽检；本页历来未声称其实验性，故仅作正向记录、未改动正文措辞。未新增 `docs/NNN-xxx.md`，来源已在页内 sources 列表中，`internal-docs-map.md` 无需变更。

- `lint`（整体巡检）
  - mechanical：`bun run .claude/skills/wiki-maintainer/scripts/lint.ts` → clean（无孤儿文档、map↔关联文档一致、无失效链接、必含章节齐全）
  - 结构：11 个 topic 全部含完整 8 段（一句话总结 / 适用场景 / 核心概念 / 常见误区 / 证据状态 / 最近更新 / 关联文档 / 来源）；frontmatter 完整，tags 全部在 SCHEMA 分类内
  - 体量：最大页 component-testing 150 行，均未超 ~200 行拆分阈值；`log.md` 414 行（< 500 条轮转阈值）
  - 时效：最旧 `updated` 为 typing/modules 2026-04-14（距今约 45 天），未触发 90 天 stale 阈值
  - 内容校验（vitest-doc-verifier，对照官方文档）：
    - [[visual-regression]]：`toMatchScreenshot`、`__screenshots__` 基准、`test.browser.expect.toMatchScreenshot` 下 `comparatorName: 'pixelmatch'` + `comparatorOptions.allowedMismatchedPixelRatio`、`name-browser-platform.png` 文件名、stable screenshot detection 全部 VERIFIED
    - [[component-testing]]：`userEvent` 从 `vitest/browser` 引入、默认实例为单例、`setup()` 仍推荐 全部 VERIFIED
    - [[environment]]：`test.browser`（需 `provider` + `instances`）、`browser.enabled` 独立于 `environment` 字段 VERIFIED；另确认官方已移除 Browser Mode 的 "experimental" 标记——经核查本项目 topic 页并未声称其为实验性，故无需修正
  - 结论：本轮无需内容改动；wiki 与官方文档一致。

## 2026-05-29

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/visual-regression.md`（新建）
  - source:
    - https://cn.vitest.dev/guide/browser/visual-regression-testing.html
  - note: 新建 [[visual-regression]] 主题页，沉淀 Browser Mode 下的视觉回归测试：概念上拆"可视化外观 + 回归对比"、与功能测试和文本 [[snapshots]] 的区别、`toMatchScreenshot` 用法、`__screenshots__` 基准目录（需提交 git）、稳定截图检测机制、`comparatorName: 'pixelmatch'` 与 `allowedMismatchedPixelRatio` 配置、稳定性最佳实践（只截元素 / `mask` 遮盖动态内容 / 禁用动画 / 固定视口 / 统一 CI 环境）、跨平台文件名差异（`name-chromium-darwin.png`）、基准更新走手动工作流。组件测试方法论已在 [[component-testing]]，故另起独立 topic 避免该页膨胀。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-27

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
  - source:
    - https://testing-library.com/docs/user-event/setup
    - https://vitest.dev/guide/browser/interactivity-api
  - note: 在 [[component-testing]] 新增 "user-event：setup 实例 vs 直接调用"，沉淀 `setup()` 的三个动机（共享输入设备状态、可传选项如 `advanceTimers`/`delay`/`pointerEventsCheck`、替换 clipboard stub）、直接调用在 testing-library 的 v13→v14 过渡定位，以及 Vitest Browser Mode 下从 `vitest/browser` 引入的 `userEvent` 是单例（与 `@testing-library/user-event` 不同），但 setup 仍然必要用于测试间隔离与传配置。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-26

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/config/setupfiles
    - https://cn.vitest.dev/config/globalsetup
    - https://cn.vitest.dev/guide/lifecycle
  - note: 在 [[hooks]] 新增配置层 `setupFiles` 与 `globalSetup` 与文件内 hooks 的三层 setup 边界（执行频率、进程归属、teardown 顺序、`project.provide` + `inject` 传值、`sequence.setupFiles`、`setupFiles` 导出被忽略），补充 setup 文件按"作用域 + 环境"两维拆分的组织建议，以及 matcher 注入误放 `globalSetup`、容器/数据库误放 `setupFiles` 等典型误区；并在 [[environment]] 的"依赖选择"末尾加一行跨主题指引，指向 [[hooks]] 处理 setup 文件层级。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/component-testing.md`
    - `wiki/topics/environment.md`
  - source:
    - https://testing-library.com/docs/queries/about/#priority
    - https://testing-library.com/docs/dom-testing-library/api-events
    - https://github.com/vitest-community/vitest-browser-react
    - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
  - note: 新建 [[component-testing]] 主题页，沉淀 Browser Mode 下 RTL 方法论：查询优先级三档分类（accessible > semantic > test ids）、`fireEvent` 的 target 赋值 + dispatch 语义和 file input 的 `Object.defineProperty` 兜底、`fireEvent` vs `user-event` 的官方偏向、断言风格差异、`<input type="date">` 的 `YYYY-MM-DD` 规范化坑；同时把 [[environment]] 里的 RTL 方法论描述收拢成一行交叉链接，环境页只保留选型结论。本次未新增 `docs/NNN-xxx.md`，`internal-docs-map.md` 无需变更。

## 2026-05-22

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://github.com/facebook/react/blob/main/CHANGELOG.md
    - https://github.com/testing-library/react-testing-library
    - https://github.com/vitest-community/vitest-browser-react
  - note: 在 Environment 主题下新增 Browser Mode 下的 React 组件测试库选型，明确 React 19 起 `react-dom/test-utils` 移除、`react-test-renderer` 弃用并被官方点名替换为 RTL；本项目用 `vitest-browser-react` 即可，不应再叠加 `@testing-library/react`。

## 2026-04-22

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/environment.md`
  - source:
    - https://cn.vitest.dev/guide/environment
    - https://vitest.dev/config/environmentoptions
    - https://cn.vitest.dev/guide/browser/
  - note: 补充“浏览器环境但不是 Browser Mode”应优先使用 `jsdom` 或 `happy-dom` 的判断，并明确它们与 `@vitest/browser-*` provider 依赖不是一回事。

## 2026-04-20

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/snapshots.md`
  - source:
    - https://cn.vitest.dev/guide/snapshot
    - https://cn.vitest.dev/config/snapshotformat
    - https://cn.vitest.dev/config/snapshotserializers
    - ../../docs/005-snapshot-testing.md
  - note: 补充快照自定义序列化器的直白解释，明确 `test` / `serialize` / `printer` 的分工，并区分 `expect.addSnapshotSerializer`、`snapshotFormat`、`snapshotSerializers` 的职责边界。

## 2026-04-16

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/topics/environment.md`
  - source:
    - https://vitest.dev/guide/features
    - https://vitest.dev/config/#env
    - https://vite.dev/config/shared-options#define
  - note: 补充 `test.env` 与 `define` 的差异，明确前者是测试运行时环境变量注入，后者是转换期常量替换，并记录测试侧通过 `process.env`、`import.meta.env` 或定义的常量标识符读取的边界。

## 2026-04-15

- `ingest`
  - changed:
    - `docs/014-vitest-projects-config-and-extends.md`
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/projects.md`
  - source:
    - https://cn.vitest.dev/guide/projects
    - https://vitest.dev/guide/projects
    - https://vitest.dev/config/include
    - https://vitest.dev/api/advanced/vitest
    - https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/types/config.ts
    - https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/public/config.ts
  - note: 新增一篇围绕 `test.projects`、配置继承边界、`extends` 适用范围和 `defineProject` 类型约束的发布型文档，并将其映射到 `Projects` topic。

- `query-update`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/paths/environment-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/projects.md`
  - source:
    - https://cn.vitest.dev/guide/projects
    - https://vitest.dev/guide/projects
    - https://vitest.dev/api/advanced/vitest
    - https://vitest.dev/config/include
  - note: 新增 `Projects` 主题页，明确 `test.projects` 负责项目发现、`test.include` 负责项目内测试文件匹配，并补充“根配置默认不是项目”和“项目配置默认不继承根配置”的排查结论。

- `lint`
  - changed:
    - `wiki/index.md`
    - `wiki/log.md`
  - checks:
    - 必需文件、frontmatter、topic 必备章节、tag taxonomy
    - `internal-docs-map.md` 与 topic 页 `关联文档` 同步情况
    - `index.md` 条目的 `updated` / `sources` 元数据完整性
    - 相对链接、孤儿 docs、page size
  - findings:
    - 所有必需文件均存在，且 frontmatter、topic 必备章节、tags、相对链接检查通过
    - `internal-docs-map.md` 与各 topic 页 `关联文档` 保持同步，无孤儿 `docs/NNN-*.md`
    - `wiki/index.md` 中 `Execution Model` 与 `Mocking` 的 `updated` / `sources` 元数据落后于实际 topic 页面，现已修正
    - 当前所有 wiki 页面均低于 SCHEMA 建议的 ~200 行分拆阈值；`wiki/log.md` 为 260 行，尚未触发 500 条轮转规则
  - follow-up:
    - 后续每次 `query-update` 或 `ingest` 修改 topic 时，同步更新 `wiki/index.md` 的 `updated` 与 `sources`
    - 若继续频繁写入 `wiki/log.md`，接近 500 条时按 SCHEMA 执行 rotation
    - `Execution Model` 与 `Mocking` 近期更新较快，后续改动后优先复查索引元数据

- `ingest`
  - changed:
    - `docs/013-expect-foundation-chain-and-assert.md`
    - `wiki/index.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/assertions.md`
    - `wiki/log.md`
  - source:
    - https://vitest.dev/api/expect.html
    - https://vitest.dev/api/assert
    - https://vitest.dev/config/expect
    - https://vitest.dev/guide/features
    - https://vitest.dev/guide/extending-matchers
    - https://main.vitest.dev/guide/migration.html
    - https://github.com/vitest-dev/vitest/tree/main/packages/expect
    - https://www.chaijs.com/guide/styles/
    - https://www.chaijs.com/api/bdd/
    - https://www.chaijs.com/api/assert/
  - note: 新增一篇关于 `expect` 底座、链式断言、Jest 兼容层以及 `expect` 与 `assert` 关系的发布型文档，并同步写回 Assertions topic 与文档映射。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
  - note: 补充类 mock 的构造返回值语义，明确 `mockReturnValue` 等简写不适合类构造 mock；需要模拟类实例时优先使用 `mockImplementation(class { ... })`。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
  - note: 补充 `mockClear()` 的作用，明确它只清空调用历史，不重置 mock 实现，也不恢复原始方法。

- `query-update`
  - changed:
    - `wiki/topics/execution-model.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/vi.html
    - https://cn.vitest.dev/api/expect
    - https://cn.vitest.dev/api/test
  - note: 补充 Vitest 中等待异步完成的常见 API 分类，区分直接 `await`、`vi.waitFor()`、`vi.waitUntil()`、`expect.poll()`、`vi.dynamicImportSettled()` 与 fake timers 的异步推进方法。

- `query-update`
  - changed:
    - `wiki/topics/mocking.md`
    - `wiki/log.md`
  - source:
    - https://cn.vitest.dev/api/mock
    - ../../docs/012-mock-cleanup-methods.md
  - note: 补充 `mockClear()`、`mockReset()`、`mockRestore()` 的边界，明确清历史、重置实现、恢复 `spyOn` 原始方法三者的区别。

## 2026-04-14

- `schema-update`
  - changed:
    - `AGENTS.md`
    - `wiki/SCHEMA.md`
    - `.claude/skills/wiki-maintainer/SKILL.md`
  - source:
    - https://gist.githubusercontent.com/karpathy/442a6bf555914893e9891c11519de94f/raw/ac46de1ad27f92b28ac95459c782c07f6b8c964a/llm-wiki.md
  - note: 对齐 LLM Wiki 的“持续复利”目标，新增 index 元数据要求、topic 证据状态/最近更新、结构化 primary/secondary 映射，以及 query-update 默认写回策略

- `ingest`
  - changed:
    - `wiki/index.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/topics/typing.md`
  - source:
    - `docs/001-expect-custom-message.md`
    - `docs/002-concurrent-sequential.md`
    - `docs/003-beforeeach-aftereach-order.md`
    - `docs/004-aroundEach.md`
    - `docs/005-snapshot-testing.md`
    - `docs/006-vitest-environment-extension.md`
    - `docs/007-vi-mock-guide.md`
    - `docs/008-vi-fn-spy-guide.md`
    - `docs/009-vi-mocked-type-helper.md`
    - `docs/010-vi-dynamic-import-settled.md`
    - `docs/011-mockobject-vs-other-mocking-apis.md`
    - `docs/012-mock-cleanup-methods.md`
  - note: 生成新版 wiki 内容，补齐 topic 证据状态与最近更新，并将 internal-docs-map 转为结构化 primary/secondary

- `lint`
  - changed:
    - `wiki/SCHEMA.md`
    - `wiki/index.md`
    - `wiki/log.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
  - checks:
    - 必需文件是否存在，且是否包含 frontmatter
    - 非 topic/path 页面是否满足最少 wikilink 约束
    - topic 页面是否包含“证据状态”和“最近更新”
    - `internal-docs-map.md` 是否使用结构化 primary/secondary
    - `index.md` 条目是否包含摘要、updated、sources
  - findings:
    - `SCHEMA.md`、`index.md`、`log.md` 缺少 frontmatter，现已补齐
    - `official-docs.md` 与 `internal-docs-map.md` 缺少最少 2 个出站 wikilink，现已补齐
    - 三个 path 页面原先将 `TODO.md` 写成相对 `docs/` 的错误路径，现已修正到仓库根目录
    - 所有 topic 页面均已补齐新增段落
    - mapping 已移除自然语言 secondary 后缀，改为结构化分组
    - index 学习入口与主题导航条目均已补齐元数据
  - follow-up:
    - 后续新增 source/summary 页面时，也按 SCHEMA 检查 frontmatter 与 wikilinks
    - 后续新增 topic/path 时继续维护 index 元数据一致性

---

## 2026-04-14

- `schema-create`
  - changed:
    - `wiki/SCHEMA.md`
    - `.claude/skills/wiki-maintainer/references/schema-template.md`
  - note: 建立项目级 wiki 宪法与通用 SCHEMA 模板，定义 domain、命名规范、frontmatter、tag taxonomy、页面阈值、更新策略、stale content 与 query-update 标准

- `frontmatter-update`
  - changed:
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/typing.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/sources/official-docs.md`
    - `wiki/sources/internal-docs-map.md`
  - note: 为所有 wiki 层页面统一添加 YAML frontmatter（title, created, updated, type, tags, sources）

- `wikilinks-update`
  - changed:
    - `wiki/index.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/typing.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/paths/environment-path.md`
  - note: 在 wiki 层引入 [[wikilinks]] 互链；index.md 与 topic/path 页均增加至少 2 个出站 wikilink

- `skill-update`
  - changed:
    - `.claude/skills/wiki-maintainer/SKILL.md`
  - note: 扩展 lint 检查清单（增加 SCHEMA、frontmatter、wikilinks、stale content、page size、log rotation、contradictions 等 12 项检查），并在 Required Files 中增加 SCHEMA.md

- `lint`
  - changed:
    - `wiki/log.md`
  - checks:
    - `internal-docs-map.md` 与 topic 页关联文档是否一致
    - 所有 wiki 页面 frontmatter 是否完整
    - wikilink 出站链接是否满足最低数量
  - findings:
    - 所有 topic/path 页 frontmatter 已补齐
    - 所有 topic 页关联文档与 `internal-docs-map.md` 一致
    - wikilink 覆盖率已达标
  - follow-up:
    - 后续新增 wiki 页时同步维护 frontmatter 与 wikilinks
    - 建议 90 天后执行 stale content 复审

---

## 2026-04-14 (earlier)

- `backfill`
  - changed:
    - `wiki/index.md`
    - `wiki/paths/beginner-path.md`
    - `wiki/paths/environment-path.md`
    - `wiki/paths/mocking-path.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/sources/official-docs.md`
    - `wiki/topics/assertions.md`
    - `wiki/topics/environment.md`
    - `wiki/topics/execution-model.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
    - `wiki/topics/snapshots.md`
    - `wiki/topics/typing.md`
  - source: `docs/001-expect-custom-message.md` 到 `docs/012-mock-cleanup-methods.md`
  - note: 建立首批 topic 和 path 页面，并完成现有文档到 wiki 的映射

- `ingest`
  - changed:
    - `wiki/sources/internal-docs-map.md`
  - source:
    - `docs/001-expect-custom-message.md`
    - `docs/002-concurrent-sequential.md`
    - `docs/003-beforeeach-aftereach-order.md`
    - `docs/004-aroundEach.md`
    - `docs/005-snapshot-testing.md`
    - `docs/006-vitest-environment-extension.md`
    - `docs/007-vi-mock-guide.md`
    - `docs/008-vi-fn-spy-guide.md`
    - `docs/009-vi-mocked-type-helper.md`
    - `docs/010-vi-dynamic-import-settled.md`
    - `docs/011-mockobject-vs-other-mocking-apis.md`
    - `docs/012-mock-cleanup-methods.md`
  - note: 明确每篇发布型文档的 primary topic 与需要保留的 secondary topic，后续新增文档沿用同一规则

- `lint`
  - changed:
    - `wiki/log.md`
    - `wiki/sources/internal-docs-map.md`
    - `wiki/topics/hooks.md`
    - `wiki/topics/mocking.md`
    - `wiki/topics/modules.md`
  - checks:
    - `internal-docs-map.md` 与 topic 页关联文档是否一致
    - 是否存在 secondary 映射缺失
    - hooks 主题页是否提炼出可复用结论
  - findings:
    - 为 `009-vi-mocked-type-helper.md` 补齐 Mocking secondary 映射
    - 为 `011-mockobject-vs-other-mocking-apis.md` 补齐 Modules secondary 映射
    - 为 `hooks.md` 补齐执行顺序与 `runTest()` 契约摘要
  - follow-up:
    - 后续新增文档时同步维护 `internal-docs-map.md` 与 topic 页
