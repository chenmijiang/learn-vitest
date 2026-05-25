---
title: Component Testing
created: 2026-05-26
updated: 2026-05-26
type: topic
tags: ["browser", "environment", "beginner"]
sources:
  - https://testing-library.com/docs/queries/about/#priority
  - https://testing-library.com/docs/dom-testing-library/api-events
  - https://github.com/vitest-community/vitest-browser-react
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
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

### 查询优先级

testing-library 官方把查询分成三档，强烈建议从无障碍角度优先使用前面的查询，越往后越远离真实用户体验：

1. **Accessible to Everyone**（直接对应用户可感知的内容）
   1. `getByRole`：基于无障碍树的角色 + accessible name，覆盖面最广，推荐作为默认首选
   2. `getByLabelText`：表单字段首选，模拟用户根据标签定位输入框
   3. `getByPlaceholderText`：只有 placeholder 可用时退而求其次，不能替代 label
   4. `getByText`：用于非交互文本元素
   5. `getByDisplayValue`：表单已有值的场景（例如编辑页）
2. **Semantic Queries** 6. `getByAltText`：`img` / `area` / 部分 `input` 等支持 `alt` 的元素7. `getByTitle`：屏幕阅读器读取不一致、视觉用户默认看不到，谨慎使用
3. **Test IDs** 8. `getByTestId`：只在确实无法用 role/text 等定位时使用，因为用户既看不到也听不到测试 id

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

### 断言风格差异

- `vitest-browser-react`：**异步、可重试**的 `await expect.element(locator).toBeVisible()`，查询会在断言期间持续重试
- 传统 RTL + `@testing-library/jest-dom`：**同步**的 `expect(el).toBeInTheDocument()`，需要先用 `await findBy*` 拿到元素再断言

这部分的环境层结论（包括"为什么本项目不要在 `vitest-browser-react` 之上再叠 RTL"）沉淀在 [[environment]]，本页不再展开。

## 常见误区

- **把 `fireEvent` 当真实用户行为模拟**：它只是属性赋值 + 单个事件派发，不会触发完整的用户级事件序列，容易掩盖 `onFocus` / `onBlur` / `onKeyDown` 等真实场景下才会发生的副作用
- **`<input type="date">` 用非 ISO 格式赋值**：例如 `'24/05/2020'` 会被静默重置为空字符串。该控件的 `value` 永远是 `YYYY-MM-DD`，只有**显示**格式才随浏览器 locale 变化
- **在 `vitest-browser-react` 之上再叠 `@testing-library/react`**：两套渲染基建并存、断言风格割裂（异步 `expect.element` vs 同步 `toBeInTheDocument`），详见 [[environment]]
- **默认就用 `getByTestId`**：跳过 role/label 等可访问性优先的查询，会让测试既不反映用户路径，也不能反向驱动可访问性设计

## 证据状态

- 已验证：查询优先级顺序与三档分类、`fireEvent` 的 `target` 赋值语义与 file input 的 `Object.defineProperty` 兜底、官方对 `user-event` 的偏向推荐，均已对照 testing-library 官方页面核对。`<input type="date">` 的 `YYYY-MM-DD` 规范化与 locale 仅影响显示，已对照 MDN 核对。`vitest-browser-react` 沿用 testing-library 原则、断言异步可重试，已对照仓库 README 核对。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-05-26 query-update：新建 component-testing 主题页，沉淀 Browser Mode 下 RTL 方法论（查询优先级、`fireEvent` 语义、`fireEvent` vs `user-event`、断言风格差异）和 `<input type="date">` 的格式坑，并把 [[environment]] 里关于 RTL 方法论的描述收拢成一行交叉链接。

## 关联文档

- 无（当前 `docs/` 下尚无 RTL / 组件测试专题发布文档）

## 来源

- https://testing-library.com/docs/queries/about/#priority（查询优先级与三档分类）
- https://testing-library.com/docs/dom-testing-library/api-events（`fireEvent` 工作原理、`target` 赋值、file input 的 `Object.defineProperty`、`fireEvent` vs `user-event` 的官方建议）
- https://github.com/vitest-community/vitest-browser-react（沿用 testing-library 原则、异步 `expect.element` 断言、CDP 驱动用户事件）
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date（`value` 永远是 `YYYY-MM-DD`，显示格式随 locale 变化）
- [[environment]]（Browser Mode 与组件测试库选型的环境层结论）
