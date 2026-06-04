---
title: Environment
created: 2026-04-14
updated: 2026-06-04
type: topic
tags: ["environment", "config", "browser", "beginner"]
sources:
  - https://cn.vitest.dev/guide/environment
  - https://testing-library.com/docs/guiding-principles/
  - https://github.com/enzymejs/enzyme/issues/2556
  - https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl
  - https://vitest.dev/config/environmentoptions
  - https://cn.vitest.dev/guide/browser/
  - https://vitest.dev/guide/features
  - https://vitest.dev/config/#env
  - https://vite.dev/config/shared-options#define
  - https://cn.vitest.dev/guide/test-context
  - https://github.com/facebook/react/blob/main/CHANGELOG.md
  - https://github.com/testing-library/react-testing-library
  - https://github.com/vitest-community/vitest-browser-react
  - ../../docs/006-vitest-environment-extension.md
---

# Environment

## 一句话总结

测试环境决定你的代码运行在什么宿主之下；先选对 `node`、DOM 模拟环境或自定义环境，再写测试，成本最低。

### 相关主题

- [[hooks]]
- [[execution-model]]

## 适用场景

- 测 Node 逻辑、浏览器 API 或框架组件
- 需要扩展全局对象或 environment options
- 需要按文件切换测试环境

## 核心概念

### 预设环境

默认环境是 `node`，涉及 DOM 时才切到 `jsdom` 或 `happy-dom`；`browser` 不属于这里的 `environment` 取值，它对应的是另一套 Browser Mode 运行方式。

### 自定义环境扩展

当预设环境不够用时，可以扩展 global 和 environment options，或实现自定义环境。

### 浏览器环境 vs Browser Mode

“浏览器环境但不是 Browser Mode” 在 Vitest 里通常就是指 DOM 模拟环境，也就是 `jsdom` 或 `happy-dom`。它们仍然在 Node 进程里执行测试，只是补了一层浏览器 API；如果你改成 Browser Mode，才会进入 `@vitest/browser-*` provider 那套真实浏览器执行链路。

### 依赖选择

- `jsdom`：兼容性更高，接近浏览器行为，但通常更重一些；使用时需要额外安装 `jsdom`
- `happy-dom`：更轻更快，但浏览器行为覆盖面和细节兼容性通常不如 `jsdom`；使用时需要额外安装 `happy-dom`
- Browser Mode 相关包如 `@vitest/browser-playwright` 只在真实浏览器模式下需要，不能替代 `jsdom` / `happy-dom`

选定 DOM 模拟环境后，`@testing-library/jest-dom` matcher 注入、全局 `cleanup()` 等副作用归属于 setup 文件层级，配置入口与三层 setup 边界归 [[hooks]] 主题。

### `environmentOptions`

如果你已经选择 `jsdom` 或 `happy-dom`，进一步的 URL、视口等环境细节应放到 `test.environmentOptions` 下，并按环境名分组配置。

### `test.env` 和 `define`

`test.env` 是给测试运行时注入环境变量，测试里按环境变量方式读取；`define` 是把代码里的常量标识符在转换阶段直接替换，更像构建期常量，而不是真正往 `process.env` 里塞值。

### `populateGlobal`

在自定义环境里，把运行时对象安全地挂到全局环境时，这个工具很关键。

### Browser Mode 下的 React 组件测试库选型

选定 Browser Mode 之后，组件测试库的归属也随之收敛：

- **React 官方已经不再维护自己的测试库**。React 19（2024-12）起：`react-dom/test-utils` 整包移除（仅 `act` 迁到 `react` 主包，`import { act } from 'react'`）；`react-test-renderer` 打弃用警告并切到 Concurrent 模式；`react-test-renderer/shallow` 移除。官方 CHANGELOG 在弃用条目里直接点名 `@testing-library/react` 作为迁移目标。
- **本项目选 Browser Mode 后，用 `vitest-browser-react` 即可，不要再叠加 `@testing-library/react`**：两者底层都依赖 `react-dom`，叠加会重复一份渲染基建，且断言风格割裂（vitest-browser-react 是异步 `await expect.element(...).toBeVisible()`，RTL + `jest-dom` 是同步 `expect(el).toBeInTheDocument()`）。
- **`vitest-browser-react` 沿用 `@testing-library/*` 的"按用户视角查询"方法论**（查询优先级、`fireEvent` vs `user-event` 等如何具体写测试，归在 [[component-testing]]，本页不再展开）。
- **为什么生态（含 Vitest）方法论选 testing-library，而不是 Enzyme / react-test-renderer**：testing-library 的准则是"测试越像软件被真实使用的方式，越有信心"，并**刻意不提供测实现细节的工具** → 抗重构、顺带驱动可访问性；Enzyme 走 shallow render / `.instance()` / `.state()` 测实现细节，且**无官方 React 18 适配器、已停止维护、React 19 必须替换**；`react-test-renderer` / `react-dom/test-utils` 在 React 19 被弃用 / 移除。testing-library 的查询建立在 **ARIA 无障碍语义（浏览器无关）**，这也是整条保真度光谱里唯一能在 jsdom 与 Browser Mode 两端通用的方法论层（查询写法详见 [[component-testing]]）。

### 决策清单：什么走 jsdom，什么走 Browser Mode

jsdom/happy-dom 与 Browser Mode 不是对错关系，而是一条**保真度光谱**：jsdom 在 Node 进程里模拟 DOM，快且省，但没有真实布局 / 可见性 / 命中检测 / 焦点 / 时序；Browser Mode 是真浏览器，保真但更重。按**被测行为依赖哪一层**来选，而不是非此即彼。

**默认 jsdom（两边等价、jsdom 更优）**：纯函数 / 工具逻辑 / 自定义 Hook 的状态逻辑；组件的渲染输出、`getByRole`/`getByText`/`getByLabelText` 查询、state 驱动的条件渲染、受控输入 value、回调是否被调用；目标**明确可见、无遮挡、无几何依赖**的简单点击 / 输入。

**升级到 Browser Mode（被测行为依赖真浏览器）**：

| 触发信号            | 例子                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| 布局 / 几何         | 遮挡命中检测、`scrollIntoView`、元素尺寸、`getBoundingClientRect`、虚拟列表    |
| 浏览器观察者 / 媒体 | `IntersectionObserver`、`ResizeObserver`、`matchMedia`（懒加载 / 响应式）      |
| 视觉可见性          | 被盖住、`pointer-events:none`、离屏                                            |
| 真实焦点            | Tab 顺序、焦点陷阱、`:focus-visible`                                           |
| 真实时序            | 动画、过渡、`requestAnimationFrame` 节奏                                       |
| 原生控件 / Web API  | `<dialog>.showModal()`、原生 `<select>` 下拉、`canvas`/WebGL、剪贴板、文件选择 |
| 视觉回归            | 截图断言（见 [[visual-regression]]）                                           |

**三条速判启发式**：

- **"要先 mock 一个浏览器 API（如 `matchMedia` / `IntersectionObserver`）才能让 jsdom 跑通" → 该行为本就依赖那个 API → 直接上 Browser Mode**；mock 掉等于不在测真实行为。
- 测的是**逻辑 / 契约** → jsdom；测的是**用户在真实浏览器里的体验** → Browser Mode。
- 二者不是二选一，可用 [[projects]] 让逻辑 / 组件单测走 jsdom 项目、关键交互 / 视觉路径走 browser 项目，既拿速度又拿保真。

为什么同一行交互在两个环境会不同（`userEvent` 走 CDP vs jsdom 合成事件、可操作性检查 vs 无命中检测），机制见 [[component-testing]]。

## 常见误区

- 遇到浏览器 API 就立即上完整浏览器模式，而不是先判断 DOM 模拟是否够用
- 以为把 `environment` 设成 `browser` 就能进入“浏览器环境”；实际上 DOM 模拟环境要用 `jsdom` 或 `happy-dom`
- 已经装了 `@vitest/browser-playwright`，就误以为不再需要 `jsdom` 或 `happy-dom`
- 扩展全局对象后忘记资源清理
- 把 `define` 当成运行时环境变量配置，导致以为它会同步出现在 `process.env` 的动态读取结果里
- 在 Browser Mode 项目里仍然按 React 旧文档去用 `react-dom/test-utils` 或 `react-test-renderer`；这两者在 React 19 已经被移除/弃用，应该直接用 `vitest-browser-react`
- 在 `vitest-browser-react` 之上再装一份 `@testing-library/react`，期待"双保险"；实际只会让查询/断言风格混乱并多一层 `react-dom` 渲染基建
- 把"jsdom vs Browser Mode"当二选一 / 对错题，而不是按被测行为依赖层在一条保真度光谱上取舍（纯逻辑 → jsdom，依赖真实布局 / 焦点 / 时序 / 浏览器 API → Browser Mode，二者可经 [[projects]] 共存）

## 证据状态

- 已验证：预设环境选择、DOM 模拟环境与 Browser Mode 的边界、`environmentOptions` 配置入口、自定义环境、`test.env` 的运行时注入、`.env` 自动加载边界、`define` 的常量替换语义，以及 React 19 测试库弃用与 `vitest-browser-react` 沿用 testing-library 查询方法论的结论，均已对照官方 CHANGELOG / 仓库 README 核对。
- 已验证（2026-05-29）：Browser Mode 通过 `test.browser.enabled: true` 启用，独立于 `environment` 字段，需配置 `provider`（playwright / webdriverio / preview）与 `instances` 数组；且官方 `guide/browser/` 当前已**移除 "experimental" 标记**——本页历来未声称其为实验性，此处仅作正向记录，便于后续补写时不要回退到"实验性"措辞。
- 已验证（2026-06-04）：testing-library 准则"tests resemble how software is used"且刻意不提供测实现细节的工具，已对照官方 guiding-principles 核对；Enzyme 无官方 React 18 适配器、已停止维护、React 19 须替换，已对照社区记录（enzyme #2556 / "Enzyme is dead"）核对；"按保真度光谱 / 被测行为依赖层选 jsdom 或 Browser Mode、可经 projects 共存"为据官方环境与 projects 文档推出的选型结论，机制层（CDP vs 合成事件、可操作性检查）见 [[component-testing]] 已验证条目。
- 待验证：不同 Vitest/Vite 大版本下 `import.meta.env` 暴露细节和周边兼容行为，仍应以当前版本文档为准。
- 冲突中：无。

## 最近更新

- 2026-06-04 query-update：新增 "决策清单：什么走 jsdom，什么走 Browser Mode" 一节（保真度光谱、触发信号表、三条速判启发式、经 projects 共存），并在"组件测试库选型"补一条"为什么方法论选 testing-library 而非 Enzyme / react-test-renderer"（测实现细节 vs 用户视角、Enzyme 停维护、ARIA 浏览器无关为唯一两端通用的方法论层）；同步补一条常见误区。机制层交叉链接到 [[component-testing]]。新增 guiding-principles 与 Enzyme 两条来源。
- 2026-05-29 query-update：在证据状态补记一条已验证事实——Browser Mode 经 `test.browser.enabled` 启用（独立于 `environment`，需 `provider` + `instances`），且官方文档已移除 "experimental" 标记。来自一次 wiki lint 的官方文档抽检，未改动正文措辞。
- 2026-05-26 query-update：在"依赖选择"末尾增补一行跨主题指引，把 jest-dom matcher 注入、`cleanup()` 等环境相关的 setup 文件细节明确指向 [[hooks]]，避免读者在环境页找 setup 配置。
- 2026-05-26 query-update：把"Browser Mode 下的 React 组件测试库选型"小节里关于 RTL 查询方法论的描述压缩成一行并指向新建的 [[component-testing]]，环境页只保留选型结论。
- 2026-05-22 query-update：新增 Browser Mode 下的 React 组件测试库选型，明确 React 19 起官方测试库已基本废弃并点名推荐 RTL，本项目使用 `vitest-browser-react` 时不应再叠加 `@testing-library/react`。
- 2026-04-22 query-update：补充“浏览器环境但不是 Browser Mode”的判断方式，明确应使用 `jsdom` 或 `happy-dom`，并区分它们与 `@vitest/browser-*` provider 的依赖关系。
- 2026-04-16 query-update：补充 `test.env` 与 `define` 的边界，明确前者是运行时环境变量注入，后者是转换期常量替换，并说明测试中的读取方式。
- 2026-04-14 ingest：把“先选宿主，再写测试”明确为环境页的主判断原则，避免把环境问题误当断言问题。

## 关联文档

- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)

## 来源

- https://cn.vitest.dev/guide/environment
- https://vitest.dev/config/environmentoptions
- https://cn.vitest.dev/guide/browser/
- https://vitest.dev/guide/features
- https://vitest.dev/config/#env
- https://vite.dev/config/shared-options#define
- https://cn.vitest.dev/guide/test-context
- https://github.com/facebook/react/blob/main/CHANGELOG.md（React 19.0.0 章节，`react-dom/test-utils` 移除与 `react-test-renderer` 弃用）
- https://github.com/testing-library/react-testing-library（RTL 官方仓库与查询优先级原则）
- https://github.com/vitest-community/vitest-browser-react（"adopts testing-library principles" 表述与 v2.2.0 API）
- https://testing-library.com/docs/guiding-principles/（"tests resemble how software is used"、不提供测实现细节工具）
- https://github.com/enzymejs/enzyme/issues/2556（Enzyme 无官方 React 18 适配器、停止维护）
- https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl（经验总结：Enzyme 已死与迁移取向）
- [006-vitest-environment-extension.md](../../docs/006-vitest-environment-extension.md)
