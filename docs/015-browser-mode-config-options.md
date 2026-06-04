# Vitest 浏览器模式 `test.browser` 配置项全览

## 先看结论

- 浏览器模式由 `test.browser` 一组配置驱动，上手只需 `enabled` + `provider` + `instances` 三项。
- `provider` 来自独立的驱动包（`@vitest/browser-playwright` / `-webdriverio` / `-preview`），用工厂函数调用，驱动自身的启动参数传进工厂里。
- `instances` 至少要有一个实例，每个实例必须带 `browser` 字段，实例还能覆盖大部分项目级选项。
- 其余选项按职责分四类：浏览器/运行行为、服务与连接、截图与追踪、定位器与 UI、脚本/命令/错误处理。
- 截至本文整理，`test.browser` 共 20 个配置项。

## 1. 三件套：开启浏览器模式的最小配置

```ts [vitest.config.ts]
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      // 至少一个实例
      instances: [{ browser: "chromium" }],
    },
  },
});
```

| 配置        | 类型 / 默认值            | 用途                                                                           |
| ----------- | ------------------------ | ------------------------------------------------------------------------------ |
| `enabled`   | `boolean` / `false`      | 总开关，开启后默认在浏览器里跑测试                                             |
| `provider`  | `BrowserProviderOption`  | 选择驱动，由驱动包的工厂函数返回；驱动启动参数（如 `launchOptions`）传给该工厂 |
| `instances` | `BrowserConfig[]` / `[]` | 定义一个或多个浏览器实例，**至少一个**，每项必须有 `browser`（浏览器名）       |

驱动与浏览器对应关系：

- `playwright`：`chromium` / `firefox` / `webkit`
- `webdriverio`：`chrome` / `firefox` / `edge` / `safari`
- `preview`：在当前页面预览（无独立浏览器进程）

`instances` 的每一项会从根 `browser` 配置继承部分选项（如 `testerHtmlPath`），同时可以覆盖大部分项目级选项（如 `setupFile`）。

## 2. 浏览器 / 运行行为

| 配置             | 类型 / 默认值                   | 用途                                                      |
| ---------------- | ------------------------------- | --------------------------------------------------------- |
| `headless`       | `boolean` / `process.env.CI`    | 无头模式运行；CI 下默认开启                               |
| `viewport`       | `{ width, height }` / `414×896` | 默认 iframe 视口尺寸                                      |
| `testerHtmlPath` | `string`                        | 自定义测试 HTML 入口（经 Vite `transformIndexHtml` 处理） |
| `isolate`        | `boolean`（**已废弃**）         | 每个测试单独 iframe；请改用顶层 `test.isolate`            |

## 3. 服务与连接

| 配置             | 类型 / 默认值                | 用途                                                                                       |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `api`            | `number \| object` / `63315` | 给浏览器提供代码的 Vite server 配置（端口 / host）。默认端口 `63315`，避免和开发服务器冲突 |
| `connectTimeout` | `number` / `60_000` ms       | 浏览器与 Vitest 建立 WebSocket 连接的超时，超时则整个测试套件失败                          |

`api` 的两个安全子项（4.1.0 起）：

- `api.allowWrite`：是否允许通过 WebSocket 往项目里写文件（快照、附件、产物等）。host 为 `localhost` 时默认 `true`；一旦暴露到网络则默认 `false`。
- `api.allowExec`：是否允许通过 UI 执行测试文件，以及经 CDP 间接执行代码。暴露到网络时默认 `false`。

## 4. 截图与追踪

| 配置                  | 类型 / 默认值                             | 用途                                              |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| `screenshotFailures`  | `boolean` / `!browser.ui`                 | 测试失败时是否截图                                |
| `screenshotDirectory` | `string` / 测试文件旁的 `__screenshots__` | 截图存放目录（相对 `root`）                       |
| `trace`               | 见下 / `'off'`                            | 录制 Playwright trace，可用 Trace Viewer 回放     |
| `expect`              | `ExpectOptions`                           | 截图断言默认项，主要是 `expect.toMatchScreenshot` |

`trace` 取值：`'on'`、`'off'`、`'on-first-retry'`、`'on-all-retries'`、`'retain-on-failure'`，或对象形式（可设 `mode`、`tracesDir`、`screenshots`、`snapshots` 等）。`'on'` 性能开销大，不推荐常开。

## 5. 定位器（locators）

| 配置                       | 类型 / 默认值                                  | 用途                                                 |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `locators.testIdAttribute` | `string` / `data-testid`                       | `getByTestId` 查找元素所用属性                       |
| `locators.exact`           | `boolean` / `true`                             | 文本匹配默认是否精确（区分大小写、完整匹配）         |
| `locators.errorFormat`     | `'html' \| 'aria' \| 'all'` / `'all'`（5.0.0） | 定位失败时打印 DOM 的格式（HTML / ARIA 快照 / 两者） |

## 6. UI 相关

| 配置                   | 类型 / 默认值                     | 用途                                           |
| ---------------------- | --------------------------------- | ---------------------------------------------- |
| `ui`                   | `boolean` / `!isCI`               | 是否注入 Vitest UI iframe（开发时默认注入）    |
| `detailsPanelPosition` | `'right' \| 'bottom'` / `'right'` | UI 详情面板位置（右侧水平分栏 / 底部垂直分栏） |

## 7. 脚本、命令与错误处理

| 配置                   | 类型 / 默认值                                                          | 用途                                                                                     |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `orchestratorScripts`  | `BrowserScript[]` / `[]`                                               | 在测试 iframe 初始化前注入编排器 HTML 的脚本（支持 `id`/`content`/`src`/`async`/`type`） |
| `commands`             | `Record<string, BrowserCommand>` / 内置 `{ readFile, writeFile, ... }` | 自定义命令，可在浏览器测试中从 `vitest/browser` 导入                                     |
| `trackUnhandledErrors` | `boolean` / `true`                                                     | 跟踪未捕获错误 / 异常以便上报                                                            |

注意：`commands` 实际运行在 Vitest 的 Node 进程，若命令暴露了文件系统、网络、shell 等能力，需自行校验来自浏览器的输入。若只想隐藏部分未捕获错误，建议用 `onUnhandledError` 而不是关闭 `trackUnhandledErrors`。

## 8. 选择配置项的实践顺序

1. 先把三件套配齐：`enabled` + `provider` + `instances`。
2. 调试时按需开 `headless: false`、调 `viewport`。
3. 排查失败用 `screenshotFailures` / `trace`；组件视觉回归用 `expect.toMatchScreenshot`。
4. 组件测试用 `locators.testIdAttribute` 对齐项目的测试 id 约定。
5. `api` / `commands` / `orchestratorScripts` 属于进阶定制，按需再加。

## 验证状态

- 已验证：本文所有 `test.browser` 配置项的名称、类型、默认值与用途，均依据 Vitest 官方仓库 `docs/config/browser/*.md`（main 分支）逐项核对，对应官网 `cn.vitest.dev/config/` 的 browser 章节。
- 未在本仓库执行：文中配置片段用于说明语义，未在当前仓库逐项跑通；带版本标注的选项（`api.allowWrite`/`api.allowExec` 4.1.0、`locators.errorFormat` 5.0.0）以官方文档标注为准。

## 参考资料

- Vitest 官方文档，浏览器模式配置（中文）：https://cn.vitest.dev/guide/browser/
- Vitest 官方文档，配置参考 `browser.*`（中文）：https://cn.vitest.dev/config/
- Vitest 源码，配置参考 `docs/config/browser/*.md`（main 分支）：https://github.com/vitest-dev/vitest/tree/main/docs/config/browser
