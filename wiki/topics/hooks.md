---
title: Hooks
created: 2026-04-14
updated: 2026-06-09
type: topic
tags: ["lifecycle", "config", "beginner"]
sources:
  - https://cn.vitest.dev/api/hooks
  - https://cn.vitest.dev/guide/lifecycle
  - https://cn.vitest.dev/config/setupfiles
  - https://cn.vitest.dev/config/globalsetup
  - ../../docs/003-beforeeach-aftereach-order.md
  - ../../docs/004-aroundEach.md
---

# Hooks

## 一句话总结

Hooks 负责测试前后的准备与清理；理解执行顺序和包裹式 hook，才能写出可复用且不互相污染的测试。

### 相关主题

- [[execution-model]]
- [[environment]]
- [[component-testing]]（区分：本页是 Vitest 生命周期 hooks；测试 **React 自定义 Hook** 用 `renderHook` / `act`，见该页"经典 RTL 的 act / renderHook"一节）

## 适用场景

- 需要在每个测试前创建固定上下文
- 需要在测试后清理状态、资源或副作用
- 需要把 setup 和 cleanup 写成一个闭环

## 核心概念

### `beforeEach` / `afterEach`

它们适合做常规初始化和资源清理，重点是弄清嵌套和异步场景下的执行顺序。

在当前项目的结论里，可以先记成一条稳定规则：`beforeEach -> 测试体 -> afterEach -> cleanup`。如果 `beforeEach` 返回的是 cleanup 函数，这个 cleanup 会在对应测试结束后执行，而不是在 setup 刚完成时执行。

### `aroundEach`

`aroundEach` 适合把一次测试包裹进统一的事务、上下文或性能测量逻辑里。

它的关键契约是“在 hook 内显式调用 `runTest()` 来执行被包裹的测试逻辑”。如果存在嵌套，外层和内层会形成包裹关系，而不是简单追加到 `beforeEach/afterEach` 队列里。

### `setupFiles` 与 `globalSetup`（配置层 setup）

Vitest 的 setup 实际分三层，作用域和执行频率完全不同：

- `test.globalSetup`：在创建任何测试 worker 之前，在**主进程内仅执行一次**，且**仅当至少有一个测试入队（at least one test queued）时**才执行 setup；返回的函数作为 teardown，会在所有测试文件结束后执行。多个 `globalSetup` 的 `setup` 按声明顺序执行，`teardown` 以相反顺序执行。它不在测试 worker 里，所以不能直接注册 vitest 的 hooks；跨进程传值要通过参数里的 `project.provide()` + 测试侧从 `vitest` 导入的 `inject()`。适合一次性资源：启动测试数据库、拉起容器、生成共享 token。
- `test.setupFiles`：在**每个测试文件之前、与测试同一个 worker 进程**中执行；它的所有 `export` 都会被 Vitest 忽略，只有副作用有效（注入 matcher、修改全局对象、注册顶层 `afterEach` 等）。默认测试文件并行执行，可通过 `sequence.setupFiles` 调整。适合跨文件复用的注入：`@testing-library/jest-dom` matcher、`cleanup()`、全局 mock。可用 `process.env.VITEST_POOL_ID`（整数样字符串）区分并发 worker，把后台重负载分摊到不同 worker。
- 文件内 hooks（`beforeAll` / `beforeEach` / `aroundEach` 等）：只影响当前文件 / 当前 suite。一次性、单文件的初始化优先放这里，而不是升级到 `setupFiles`。

选择顺序：能放文件内 hook 的不要放 `setupFiles`；能放 `setupFiles` 的不要放 `globalSetup`。

#### watch 模式下的时机差异

- 修改 `setupFiles` 会**自动触发全部测试重跑**。
- watch 模式下 `globalSetup` 的 teardown 改为**进程退出前才调用**（而非每次重跑后）；如需在每次重跑前重置资源，用 `project.onTestsRerun(async () => { ... })`（注意不能解构出 `onTestsRerun`，它依赖 `project` 上下文）。

#### isolation 关闭时的 setupFiles 陷阱

关闭 [`isolation`](https://cn.vitest.dev/config/isolate) 后，被 `import` 的模块会被缓存，但 **`setupFiles` 本身仍在每个测试文件前再次执行**，且访问的是同一个全局对象。需要用全局标志位避免重复初始化（官方示例用 `globalThis.setupInitialized` 守卫一次性的重负载初始化，而 `afterEach(cleanup)` 等需要每文件生效的 hook 照常注册）。

#### setup 文件组织建议

没有官方强制约定，常见拆分按“作用域 + 环境”两维：

- `tests/global-setup.ts`：跨进程一次性资源
- `tests/setup.common.ts`：所有测试都要的副作用（polyfill、全局 mock）
- `tests/setup.dom.ts` / `tests/setup.browser.ts`：分环境注入 matcher、cleanup

`vitest.config.ts` 里按需组合：`globalSetup` 单独配置，`setupFiles` 按环境合并 common + env 专用条目。

## 常见误区

- 误以为返回任意 Promise 都会变成 cleanup
- 把过多业务逻辑塞进 hooks，导致测试本身难读
- 把 `@testing-library/jest-dom` 这类 matcher 注入放进 `globalSetup`：不会生效，matcher 必须在 worker 进程内注入，应放 `setupFiles`
- 在 `setupFiles` 里启动数据库或容器：会被每个测试文件触发一次，应放 `globalSetup`
- 期待 `setupFiles` 的 `export` 在测试里被 import：官方明确忽略 setupFiles 的导出，它只跑副作用

## 证据状态

- 已验证：`beforeEach/afterEach` 与 `aroundEach` 的基本契约来自官方 hooks/lifecycle 文档与项目实证文档；`setupFiles` 在每个测试文件前于同一 worker 进程执行、导出被忽略、可调 `sequence.setupFiles`、可用 `VITEST_POOL_ID` 区分 worker、isolation 关闭时仍每文件重跑（需全局标志位守卫），以及 `globalSetup` 在主进程仅执行一次（且仅在至少一个测试入队时）、`setup/teardown` 按顺序/反序、watch 下 teardown 改在进程退出前调用、`onTestsRerun` 处理重跑、通过 `project.provide()` + `inject()` 传值，均对照官方 `config/setupfiles` 与 `config/globalsetup` 段（经本地 `~/github/vitest` 源码核对）。
- 待验证：跨版本在细节时序上的实现变化需以当前版本官方文档为准。
- 冲突中：无。

## 最近更新

- 2026-06-09 query-update：补充 `globalSetup` 仅在「至少一个测试入队」时执行、watch 模式下 teardown 改在进程退出前调用与 `onTestsRerun` 重跑钩子；`setupFiles` 的 `VITEST_POOL_ID` worker 区分与 isolation 关闭时的重复初始化陷阱（`globalThis` 标志位守卫）；新增「watch 模式时机差异」「isolation 关闭陷阱」两小节。
- 2026-05-26 query-update：新增配置层 `setupFiles` 与 `globalSetup` 与文件内 hooks 的三层划分、setup 文件组织建议，以及对应的典型误区；来源补入官方 `config/setupfiles` 与 `config/globalsetup`。
- 2026-04-14 backfill：补充 `runTest()` 必须调用这一 aroundEach 核心契约，并将其与 execution-model 页面互链。

## 关联文档

- [003-beforeeach-aftereach-order.md](../../docs/003-beforeeach-aftereach-order.md)
- [004-aroundEach.md](../../docs/004-aroundEach.md)

## 来源

- https://cn.vitest.dev/api/hooks
- https://cn.vitest.dev/guide/lifecycle
- https://cn.vitest.dev/config/setupfiles
- https://cn.vitest.dev/config/globalsetup
- [003-beforeeach-aftereach-order.md](../../docs/003-beforeeach-aftereach-order.md)
- [004-aroundEach.md](../../docs/004-aroundEach.md)
