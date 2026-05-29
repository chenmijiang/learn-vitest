---
title: Component Testing
created: 2026-05-26
updated: 2026-05-29
type: topic
tags: ["browser", "environment", "beginner"]
sources:
  - https://testing-library.com/docs/queries/about/#priority
  - https://testing-library.com/docs/dom-testing-library/api-events
  - https://github.com/vitest-community/vitest-browser-react
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
  - https://testing-library.com/docs/user-event/setup
  - https://vitest.dev/guide/browser/interactivity-api
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
---

# Component Testing

## 一句话总结

在 Browser Mode 下做组件测试时，`@testing-library/*` 的方法论决定你的 query 与交互怎么写：查询要按用户视角排优先级，交互要分清 `fireEvent` 的"赋值 + dispatch"和 `user-event` 的"接近真实用户行为"。

### 相关主题

- [[environment]]
- [[hooks]]

## 适用场景

- 已经按 [[environment]] 的结论选定 Browser Mode + `vitest-browser-react`
- 开始写组件的交互或查询逻辑，需要决定用哪种 query、用哪种事件 API
- 想理解为什么官方建议从 `getByRole` 起步、为什么 `fireEvent` 不等于真实用户行为

## 核心概念

### ARIA：role 与 accessible name（查询的语义地基）

testing-library 的查询优先级不是凭空排的，它直接建立在 **ARIA（Accessible Rich Internet Applications）** 这套 W3C 无障碍语义之上。理解两个概念就够用：

- **role（角色）**：元素"是什么控件"。绝大多数来自原生标签的**隐含角色**——`<button>` 隐含 `button`、`<nav>` 隐含 `navigation`、`<input type="checkbox">` 隐含 `checkbox`，**无需手写 `role=`**。只有原生标签表达不了语义时才用 `role="..."` 兜底。
- **accessible name（无障碍名称）**：辅助技术念出来的"这个控件叫什么"。来源按优先级大致是 `aria-labelledby` > `aria-label` > 关联的 `<label>` / 原生文本内容 > `title`。

这正是查询 API 的工作原理：

```tsx
// role='button'（来自 <button> 隐含角色） + name='提交'（来自按钮文本/aria-label）
page.getByRole("button", { name: "提交" });
// 对应 <label>、aria-label、aria-labelledby 提供的无障碍名称
page.getByLabelText("用户名");
```

> 第一条 ARIA 法则：**能用语义化原生 HTML 就别加 ARIA 属性**。写好原生标签，`getByRole` 自然就能定位——可访问性与可测试性是同一件事的两面。

### 查询优先级

testing-library 官方把查询分成三档，强烈建议从无障碍角度优先使用前面的查询，越往后越远离真实用户体验。整体顺序为：`getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId`。

**第 1 档：Accessible to Everyone**（直接对应用户可感知的内容）

- `getByRole`：基于无障碍树的角色 + accessible name，覆盖面最广，推荐作为默认首选
- `getByLabelText`：表单字段首选，模拟用户根据标签定位输入框
- `getByPlaceholderText`：只有 placeholder 可用时退而求其次，不能替代 label
- `getByText`：用于非交互文本元素
- `getByDisplayValue`：表单已有值的场景（例如编辑页）

**第 2 档：Semantic Queries**

- `getByAltText`：`img` / `area` / 部分 `input` 等支持 `alt` 的元素
- `getByTitle`：屏幕阅读器读取不一致、视觉用户默认看不到，谨慎使用

**第 3 档：Test IDs**

- `getByTestId`：只在确实无法用 role/text 等定位时使用，因为用户既看不到也听不到测试 id

只有 `getByRole` 找不到、且语义查询也不合适时，再考虑 `data-testid`。

### `fireEvent` 工作原理

`fireEvent[eventName](node, eventProperties)` 做的事情很底层：它把 `eventProperties` 里的属性（特别是 `target` 下的字段）**直接赋值到 DOM 节点上**，然后 `dispatchEvent` 派发对应的合成事件。

等价伪代码：

```js
input.value = "a";
input.dispatchEvent(new Event("change", { bubbles: true }));
```

文件输入是个特例。`HTMLInputElement.files` 是只读属性，无法直接赋值，testing-library 在内部用 `Object.defineProperty` 绕开这一限制；`dataTransfer` 等只读字段同理。

### `fireEvent` vs `userEvent`

官方文档原话："Most projects have a few use cases for `fireEvent`, but the majority of the time you should probably use `@testing-library/user-event`."

简单结论：

- `fireEvent` 偏底层，本质是赋值 + 派发单个事件，不会触发真实键盘下完整的事件序列（focus、keydown、input、change、blur 等）
- `user-event` 更贴近真实用户：按键有节奏、焦点会迁移、事件冒泡顺序符合浏览器行为
- 只有在确实需要直接造一个低层级事件（比如手动模拟某个不易触发的 DOM 事件）时再用 `fireEvent`

在 Vitest Browser Mode 下，`vitest-browser-react` 提供的 `page.getByRole(...).click()` 等交互走的是 CDP（Chrome DevTools Protocol），是比 `fireEvent` 更接近真实用户的路径。

### Locator：惰性、可重试的元素句柄

上面那些 `page.getByRole(...)` 返回的并不是 DOM 元素，而是一个 **locator**。官方定义："A locator is a representation of an element or a number of elements."——它是**由选择器定义的、对元素的惰性句柄**，不是元素本身。

这与传统 testing-library 有一个根本差别：

- **testing-library**：`getByRole(...)` **立即查 DOM 并返回元素**（查不到即抛错）。
- **Vitest Browser Mode**：`page.getByRole(...)` **返回 locator 对象**，此刻**还没真正查 DOM**。

由此带来三个核心特性：

- **惰性求值**：创建 locator 不触发查询，只有在交互 / 断言 / 取元素时才查。
- **自动重试**：交互和断言会在需要时反复重试至条件满足或超时，省掉手写 `waitFor`——这正是 `await expect.element(locator).toBeVisible()` 能"持续重试"的根因（见下一节）。
- **可组合**：locator 可链式收窄（`nth/first/last/filter/and/or`）。

API 速览：

```ts
// 定位（返回 locator，名字对齐 testing-library 语义，但实现非其包装）
page.getByRole("button", { name: "提交" });
// 交互（触发查询 + 自动重试）
await locator.click(); // fill / clear / hover / selectOptions ...
// 物化成真实元素（需要时）
locator.element(); // 严格模式：多个/零个元素会抛错
locator.query(); // 单个或 null
locator.elements(); // 数组
// 可重试断言（最常用）
await expect.element(locator).toBeVisible();
```

**关于"它封装了什么"的准确说法**：locator 的 `getBy*` 方法**在命名与无障碍语义上对齐 testing-library**，但其实现**fork 自 Playwright 的 locators（基于 `Ivya` 库）**，并不是对 `@testing-library/dom` 查询的包装。真正被封装的是 **provider 层**：同一套 Locator API 暴露给所有 provider——`playwright` 原生支持，`webdriverio` / `preview` 则转换成 CSS 选择器实现等价行为，从而让测试代码与具体浏览器驱动解耦。

### 断言风格差异

- `vitest-browser-react`：**异步、可重试**的 `await expect.element(locator).toBeVisible()`，查询会在断言期间持续重试
- 传统 RTL + `@testing-library/jest-dom`：**同步**的 `expect(el).toBeInTheDocument()`，需要先用 `await findBy*` 拿到元素再断言

这部分的环境层结论（包括"为什么本项目不要在 `vitest-browser-react` 之上再叠 RTL"）沉淀在 [[environment]]，本页不再展开。

### `user-event`：setup 实例 vs 直接调用

`userEvent.setup()` 返回一个**带状态**的实例，目的不是 API 入口，而是承载三类只能跨多次调用才有意义的能力：

- **共享输入设备状态**：方法之间共享键盘修饰键、指针位置等设备状态。`{Shift>}` 按下后再 `click`，必须是同一个实例上的两次调用，Shift 才真的"还按着"。
- **可传配置**：`setup({ delay, advanceTimers, pointerEventsCheck, skipHover, ... })`。最典型的是配合 `vi.useFakeTimers()` 时传 `advanceTimers: vi.advanceTimersByTime`，否则带 `delay` 的 `type/keyboard` 会卡在假时钟下。
- **替换 clipboard stub**：`setup()` 会替换默认的 `navigator.clipboard` stub，让 `copy/paste/cut` 测得了。

直接在默认导出上调用 `userEvent.click(...)` 这种写法，在 testing-library 文档里被定位为 v13 → v14 的过渡兼容写法，官方建议改用 `setup()` 实例。

**Vitest Browser Mode 下有一个额外差别**：从 `vitest/browser` 引入的 `userEvent` 是**单例**——官方原话："Unlike `@testing-library/user-event`, the default `userEvent` instance from `vitest/browser` is created once, not every time its methods are called!" 也就是说，在 Vitest 下直接调用 `userEvent.*` 也会跨调用保留设备状态。但 setup 仍然必要，理由是**测试间的隔离**（每个 test 拿干净实例，避免修饰键状态泄漏到下一个用例）和**传配置**（fake timer 推进、delay、pointer 检查策略等）。

实战写法：

```ts
import { userEvent } from "vitest/browser";
import { beforeEach, test } from "vitest";

let user: ReturnType<typeof userEvent.setup>;
beforeEach(() => {
  user = userEvent.setup();
});

test("shift + click", async () => {
  await user.keyboard("{Shift>}");
  await user.click(button);
  await user.keyboard("{/Shift}");
});
```

## 常见误区

- **把 `fireEvent` 当真实用户行为模拟**：它只是属性赋值 + 单个事件派发，不会触发完整的用户级事件序列，容易掩盖 `onFocus` / `onBlur` / `onKeyDown` 等真实场景下才会发生的副作用
- **`<input type="date">` 用非 ISO 格式赋值**：例如 `'24/05/2020'` 会被静默重置为空字符串。该控件的 `value` 永远是 `YYYY-MM-DD`，只有**显示**格式才随浏览器 locale 变化
- **在 `vitest-browser-react` 之上再叠 `@testing-library/react`**：两套渲染基建并存、断言风格割裂（异步 `expect.element` vs 同步 `toBeInTheDocument`），详见 [[environment]]
- **默认就用 `getByTestId`**：跳过 role/label 等可访问性优先的查询，会让测试既不反映用户路径，也不能反向驱动可访问性设计

## 证据状态

- 已验证：查询优先级顺序与三档分类、`fireEvent` 的 `target` 赋值语义与 file input 的 `Object.defineProperty` 兜底、官方对 `user-event` 的偏向推荐，均已对照 testing-library 官方页面核对。`<input type="date">` 的 `YYYY-MM-DD` 规范化与 locale 仅影响显示，已对照 MDN 核对。`vitest-browser-react` 沿用 testing-library 原则、断言异步可重试，已对照仓库 README 核对。user-event `setup()` 的三个动机（共享设备状态 / 选项 / clipboard stub）与直接调用的 v14 过渡定位已对照 testing-library 官方 `user-event/setup` 页面核对；Vitest Browser Mode 下 `userEvent` 从 `vitest/browser` 引入、默认实例为单例已对照官方 `guide/browser/interactivity-api` 页面核对。
- 已验证（2026-05-29）：ARIA 的 role（多数来自原生标签隐含角色）与 accessible name（`aria-labelledby` / `aria-label` / `<label>` / 文本 / `title`）构成 `getByRole` / `getByLabelText` 的定位依据，"优先语义化原生 HTML"为 ARIA 第一法则，已对照 MDN ARIA 文档核对。
- 已验证（2026-05-29）：locator 是惰性、可自动重试的元素句柄（`page.getBy*` 返回 locator 而非元素，与 testing-library 立即返回元素不同）；其 `getBy*` 在语义/命名上对齐 testing-library，但实现 fork 自 Playwright locators（`Ivya`），并作为统一 API 屏蔽 provider 差异（playwright 原生、webdriverio/preview 转 CSS 选择器）。已对照官方 `guide/browser/locators` 页面核对。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-05-29 query-update：新增 "Locator：惰性、可重试的元素句柄" 一节，澄清 `page.getBy*` 返回的是 locator 而非元素、惰性求值 / 自动重试 / 可组合三特性、`element()/query()/elements()` 与 `expect.element` 的关系，以及"封装"的准确性质——`getBy*` 对齐 testing-library 语义但实现 fork 自 Playwright（`Ivya`），真正被封装的是 provider 层。
- 2026-05-29 query-update：在"核心概念"前置新增 "ARIA：role 与 accessible name（查询的语义地基）" 一节，解释 role（原生标签隐含角色）与 accessible name 的来源及其与 `getByRole` / `getByLabelText` 的对应关系，并点明"优先语义化原生 HTML"的 ARIA 第一法则，作为查询优先级的语义背景。
- 2026-05-27 query-update：新增 "user-event：setup 实例 vs 直接调用" 一节，明确 `setup()` 的三个动机（共享设备状态、传选项、替换 clipboard stub）、直接调用的 v14 过渡定位，以及 Vitest Browser Mode 下从 `vitest/browser` 引入的 `userEvent` 是单例（与 testing-library 不同），但 setup 仍需用于测试间隔离与传配置。
- 2026-05-26 query-update：新建 component-testing 主题页，沉淀 Browser Mode 下 RTL 方法论（查询优先级、`fireEvent` 语义、`fireEvent` vs `user-event`、断言风格差异）和 `<input type="date">` 的格式坑，并把 [[environment]] 里关于 RTL 方法论的描述收拢成一行交叉链接。

## 关联文档

- 无（当前 `docs/` 下尚无 RTL / 组件测试专题发布文档）

## 来源

- https://testing-library.com/docs/queries/about/#priority（查询优先级与三档分类）
- https://testing-library.com/docs/dom-testing-library/api-events（`fireEvent` 工作原理、`target` 赋值、file input 的 `Object.defineProperty`、`fireEvent` vs `user-event` 的官方建议）
- https://github.com/vitest-community/vitest-browser-react（沿用 testing-library 原则、异步 `expect.element` 断言、CDP 驱动用户事件）
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date（`value` 永远是 `YYYY-MM-DD`，显示格式随 locale 变化）
- https://testing-library.com/docs/user-event/setup（`setup()` 的设计意图、共享设备状态、clipboard stub、v14 过渡说明）
- https://vitest.dev/guide/browser/interactivity-api（Vitest Browser Mode 下 `userEvent` 从 `vitest/browser` 引入、默认实例为单例）
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA（ARIA role / accessible name 语义，作为 `getByRole` / `getByLabelText` 查询的背景）
- https://vitest.dev/guide/browser/locators（Locator 概念：惰性可重试句柄、`getBy*` 方法、`element()/query()/elements()`、fork 自 Playwright locators 并统一 provider）
- [[environment]]（Browser Mode 与组件测试库选型的环境层结论）
