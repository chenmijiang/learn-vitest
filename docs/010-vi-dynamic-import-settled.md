# vi.dynamicImportSettled：等待“拿不到 Promise 的动态导入”

## 一句话概括

`vi.dynamicImportSettled()` 的作用不是“导入模块”，而是：

- 当你的代码内部触发了 `import()`，但外部拿不到那个 Promise 时
- 让测试继续等待，直到这批动态导入及其连锁导入都稳定下来

## 它解决了什么问题？

先看官方文档里的典型场景：

```ts
import { expect, test, vi } from "vitest";

function renderComponent() {
  import("./component.js").then(({ render }) => {
    render();
  });
}

test("operations are resolved", async () => {
  renderComponent();
  await vi.dynamicImportSettled();
  expect(document.querySelector(".component")).not.toBeNull();
});
```

这里的问题在于：

- `renderComponent()` 是一个同步函数
- 它内部确实触发了 `import("./component.js")`
- 但它没有把这个 Promise 返回出来

所以测试代码没法写成这样：

```ts
await renderComponent();
```

因为根本等不到真正的导入过程。这时就可以调用 `await vi.dynamicImportSettled()`，让 Vitest 帮你等这次动态导入完成。

## 怎么理解文档里的那句说明？

官方原文大意是：

> 如果有一个同步调用启动了模块导入，而你又无法直接等待这个导入过程，那么这个方法会有用。

可以直接翻译成更好理解的话：

**某个普通函数里偷偷触发了 `import()`，但没有把 Promise 暴露给你，这时用 `vi.dynamicImportSettled()` 来补等。**

## 它到底会等到什么时候？

根据官方文档，`vi.dynamicImportSettled()` 不只是等“当前这一层 import 完成”，还会继续等下面两类情况。

### 1. 等当前动态导入完成

最基础的情况就是等待当前触发的 `import()` 完成解析。

### 2. 等动态导入链全部完成

如果在导入 A 的过程中，又触发了新的动态导入 B，这个方法也会继续等下去，直到整条动态导入链都完成。

这也是文档里 `settled` 的重点：不是只等一个模块，而是等这一轮相关的动态导入都稳定下来。

### 3. 再多等一个事件循环 tick

官方文档还特别提到：在导入解析后，它还会等待下一个 `setTimeout` tick。

可以把这句话理解成：

- 模块加载完还不够
- Vitest 还会再给后续紧跟着的同步逻辑一点执行机会
- 所以像 `then(() => render())` 这种导入后的同步更新，通常也会在它 resolve 前完成

这也是为什么上面的 DOM 断言可以写在 `await vi.dynamicImportSettled()` 后面。

## 什么时候该用，什么时候不该用？

### 适合用

- 懒加载组件、按需加载模块
- 触发导入的是同步函数，外部拿不到 Promise
- 测试需要等导入完成后再断言 DOM 或状态

### 不一定要用

如果你本来就能直接拿到 Promise，更推荐直接 `await`：

```ts
async function renderComponent() {
  const { render } = await import("./component.js");
  render();
}

await renderComponent();
```

这种写法更直接，测试代码也更容易理解，一般就不需要 `vi.dynamicImportSettled()`。

## 常见误解

### 误解 1：它会替你执行动态导入

不会。  
它只负责“等待已经开始的动态导入稳定下来”，不会主动帮你发起 `import()`。

### 误解 2：它是等待所有异步任务的万能方法

不是。  
它主要针对的是动态导入链。

如果后续逻辑还涉及这些异步行为：

- `fetch`
- 较长时间的 `setTimeout`
- 轮询更新
- UI 库内部的异步渲染

通常还需要配合 `vi.waitFor()`、Testing Library 的 `findBy...` 等等待方式一起使用。

## 实际开发中怎么记？

可以把它记成一句话：

**当测试触发了懒加载，但你拿不到 `import()` 的 Promise 时，就在断言前加一个 `await vi.dynamicImportSettled()`。**

## 验证状态

- API 行为说明：已根据 Vitest 官方文档交叉核对
- 本文示例：基于官方示例整理与改写
- 仓库内自动化验证：本文档未新增测试文件对示例进行单独运行验证

## 来源

- [Vitest 官方文档（中文）- vi.dynamicImportSettled](https://cn.vitest.dev/api/vi.html#vi-dynamicimportsettled)
- [Vitest 官方文档（英文）- vi.dynamicImportSettled](https://vitest.dev/api/vi.html#vi-dynamicimportsettled)
