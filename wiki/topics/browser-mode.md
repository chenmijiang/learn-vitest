---
title: Browser Mode 配置
created: 2026-06-04
updated: 2026-06-06
type: topic
tags: ["browser", "config", "environment"]
sources:
  - https://cn.vitest.dev/guide/browser/
  - https://cn.vitest.dev/config/
  - https://cn.vitest.dev/guide/browser/playwright-traces.html
  - https://github.com/vitest-dev/vitest/tree/main/docs/config/browser
  - ../../docs/015-browser-mode-config-options.md
---

# Browser Mode 配置

## 一句话总结

`test.browser` 是开启并定制 Vitest 浏览器模式的配置块：上手只需 `enabled` + `provider` + `instances` 三件套，其余选项按"运行行为 / 服务连接 / 截图追踪 / 定位器与 UI / 脚本命令"五类按需叠加。

### 相关主题

- [[environment]]
- [[component-testing]]
- [[visual-regression]]

## 适用场景

- 需要在真实浏览器里跑组件 / 交互测试，正在写或读 `vitest.config.ts` 的 `browser` 块
- 想知道某个 `browser.*` 选项叫什么、默认值是什么、归哪类用途
- 调试浏览器测试（无头切换、视口、失败截图、trace）或做进阶定制（端口、命令、注入脚本）

环境层"什么时候该选 Browser Mode 而不是 jsdom/happy-dom"的取舍见 [[environment]]；选定后怎么写查询与交互见 [[component-testing]]；截图断言的稳定性实践见 [[visual-regression]]。

## 核心概念

### 三件套（启用的最小配置）

- `enabled`（`boolean`，默认 `false`）：浏览器模式总开关。
- `provider`（`BrowserProviderOption`）：选择驱动，由独立驱动包的工厂函数调用——`@vitest/browser-playwright` / `-webdriverio` / `-preview`；驱动自身的启动参数（如 playwright 的 `launchOptions`）传进工厂。
- `instances`（`BrowserConfig[]`，默认 `[]`）：至少一个实例，每项必须有 `browser`（浏览器名）。实例从根 `browser` 配置继承部分选项，并可覆盖大部分项目级选项（如 `setupFile`）。

驱动 ↔ 浏览器：`playwright` 支持 `chromium`/`firefox`/`webkit`；`webdriverio` 支持 `chrome`/`firefox`/`edge`/`safari`；`preview` 在当前页面预览。

### 运行行为

- `headless`（`boolean`，默认 `process.env.CI`）：无头模式，CI 下默认开。
- `viewport`（`{ width, height }`，默认 `414×896`）：默认 iframe 视口。
- `testerHtmlPath`（`string`）：自定义测试 HTML 入口（经 Vite `transformIndexHtml` 处理）。
- `isolate`（`boolean`，**已废弃**）：改用顶层 `test.isolate`。

### 服务与连接

- `api`（`number | object`，默认端口 `63315`）：给浏览器提供代码的 Vite server 配置。子项 `api.allowWrite` / `api.allowExec`（4.1.0 起）控制经 WebSocket / UI / CDP 的写文件与执行能力，host 为 `localhost` 时默认允许，暴露到网络则默认关闭。
- `connectTimeout`（`number`，默认 `60_000` ms）：浏览器与 Vitest 建立 WebSocket 连接的超时。

### 截图与追踪

- `screenshotFailures`（`boolean`，默认 `!browser.ui`）：失败时截图。
- `screenshotDirectory`（`string`，默认测试文件旁 `__screenshots__`）：截图目录。
- `trace`（默认 `'off'`）：录制 Playwright trace，取值 `'on'`/`'off'`/`'on-first-retry'`/`'on-all-retries'`/`'retain-on-failure'` 或对象（`mode`/`tracesDir`/`screenshots`/`snapshots`）。详见下文 [Playwright Trace](#playwright-trace-调试录制)。
- `expect`（`ExpectOptions`）：截图断言默认项，主要是 `expect.toMatchScreenshot`，详见 [[visual-regression]]。

### Playwright Trace（调试录制）

把测试运行时浏览器里发生的一切录制成 `.trace.zip`，事后可视化回放——相当于测试的「行车记录仪」，专治 CI 偶发失败、本地难复现。仅 `provider` 为 Playwright 时可用。

- **记录内容**：操作步骤（click/fill/hover…）前后的 DOM 快照、截图、`expect.element(...)` 断言；每个时间线条目自动链接回对应测试源码行，可直接跳转。
- **开启**：配置 `browser.trace`（默认 `'off'`），或 CLI `vitest --browser.trace=on`。五种 mode：
  - `'off'`：默认，不录。
  - `'on'`：每个测试都录。
  - `'on-first-retry'`：仅首次重试录。
  - `'on-all-retries'`：所有重试录。
  - `'retain-on-failure'`：仅失败时保留。
  - CI 推荐 `'retain-on-failure'` 或 `'on-first-retry'`，抓失败现场又不给每个用例都生成 zip。
- **对象形式**：`trace: { mode, tracesDir, screenshots, snapshots }`，进一步控制录制行为与输出目录。
- **文件存储**：默认输出到测试文件旁的 `__traces__/`，命名 `项目名-测试名-repeat-retry.trace.zip`（如 `chromium-my-test-0-0.trace.zip`）；用 `tracesDir` 改目录。
- **查看**：命令行 `npx playwright show-trace "路径/xxx.trace.zip"`，或把文件拖到 https://trace.playwright.dev 。
- **自定义标记 mark**：给时间线打分组标记让长流程更易读——`await page.getByRole('button').mark('...')` 标记单个元素就绪；`await page.mark('sign in flow', async () => { ... })` 把多步操作分组成命名区块。

### 定位器（locators）

- `locators.testIdAttribute`（`string`，默认 `data-testid`）：`getByTestId` 所用属性。
- `locators.exact`（`boolean`，默认 `true`）：文本匹配是否精确。
- `locators.errorFormat`（`'html'|'aria'|'all'`，默认 `'all'`，5.0.0）：定位失败时打印 DOM 的格式。

### UI

- `ui`（`boolean`，默认 `!isCI`）：是否注入 Vitest UI iframe。
- `detailsPanelPosition`（`'right'|'bottom'`，默认 `'right'`）：UI 详情面板位置。

### 脚本、命令与错误处理

- `orchestratorScripts`（`BrowserScript[]`，默认 `[]`）：注入编排器 HTML 的脚本（`id`/`content`/`src`/`async`/`type`）。
- `commands`（`Record<string, BrowserCommand>`，内置 `readFile`/`writeFile` 等）：自定义命令，从 `vitest/browser` 导入；运行在 Node 进程，需自行校验来自浏览器的输入。
- `trackUnhandledErrors`（`boolean`，默认 `true`）：跟踪未捕获错误以便上报。

## 常见误区

- **以为 `provider: 'playwright'` 是字符串**：新 API 里 `provider` 是工厂调用 `playwright()`，从 `@vitest/browser-*` 独立包导入，不是字符串枚举。
- **只写 `enabled: true` 就期望能跑**：还必须配 `provider` 和至少一个 `instances`，否则启动失败。
- **把驱动启动参数塞进 `browser` 顶层**：`launchOptions`/`actionTimeout` 等属于驱动配置，要传给工厂函数（`playwright({ launchOptions })`），不是放在 `browser.*` 上。
- **关掉 `trackUnhandledErrors` 来隐藏个别报错**：那会移除全部错误处理器；只想过滤部分错误应用 `onUnhandledError`。
- **忽略 `api.allowWrite`/`allowExec` 的网络默认值**：一旦把 host 改成对外暴露，这两项默认变 `false`，快照写入 / UI 执行会失效，需显式开启并评估安全风险。

## 证据状态

- 已验证（2026-06-04）：全部 20 个 `test.browser` 选项的名称、类型、默认值与用途，依据 Vitest 官方仓库 `docs/config/browser/*.md`（main 分支）逐项核对，对应官网 `cn.vitest.dev/config/` browser 章节。带版本标注项（`api.allowWrite`/`api.allowExec` 4.1.0、`locators.errorFormat` 5.0.0）以官方文档为准。
- 已验证（2026-06-06）：Playwright Trace 小节（mode 取值、`__traces__/` 默认目录与命名、`npx playwright show-trace` / trace.playwright.dev 查看、`page.mark` 标记）依据官方 `cn.vitest.dev/guide/browser/playwright-traces.html`。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-06-06 query-update：把 `trace` 从一行配置说明扩展为「Playwright Trace（调试录制）」小节——记录内容、五种 mode 与 CI 取舍、对象形式、`__traces__/` 存储与命名、`show-trace`/trace.playwright.dev 查看、`page.mark` 自定义标记；来源补官方 playwright-traces 页。
- 2026-06-04 ingest：新建 browser-mode 主题页，沉淀 `docs/015-browser-mode-config-options.md` 的结论——`test.browser` 全部 20 个配置项按"三件套 / 运行行为 / 服务连接 / 截图追踪 / 定位器与 UI / 脚本命令"分类的名称、类型、默认值与用途，并补 provider 工厂、`api` 安全子项等常见误区。

## 关联文档

- [015-browser-mode-config-options.md](../../docs/015-browser-mode-config-options.md)

## 来源

- https://cn.vitest.dev/guide/browser/（浏览器模式配置总览与启用示例）
- https://cn.vitest.dev/config/（配置参考 `browser.*` 章节）
- https://cn.vitest.dev/guide/browser/playwright-traces.html（Playwright Trace 的录制、查看与 `page.mark` 标记）
- https://github.com/vitest-dev/vitest/tree/main/docs/config/browser（各 `browser.*` 选项的类型 / 默认值 / 说明，逐项核对来源）
- [[environment]]（Browser Mode 与 jsdom/happy-dom 的环境层取舍）
- [[component-testing]]（Browser Mode 下的查询与交互写法）
- [[visual-regression]]（`toMatchScreenshot` 截图断言与稳定性实践）
