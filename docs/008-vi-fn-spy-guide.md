# vi.fn 与 vi.spyOn 详解

## 一句话概括

- **vi.fn**：创建一个独立的假函数，用于模拟依赖或回调
- **vi.spyOn**：监听并替换对象的方法，保留调用记录能力

---

## vi.fn —— 创建假函数

### 基本用法

```ts
import { vi, expect } from "vitest";

const getApples = vi.fn(() => 0);

getApples();

expect(getApples).toHaveBeenCalled();
expect(getApples).toHaveReturnedWith(0);
```

### 临时改变返回值

```ts
import { vi } from "vitest";

const getApples = vi.fn(() => 0);

getApples.mockReturnValueOnce(5); // 下次调用返回 5
const res = getApples(); // res === 5
```

### 支持 Class

```ts
import { vi, expect } from "vitest";

const Cart = vi.fn(
  class {
    get = () => 0;
  },
);

const cart = new Cart();
expect(Cart).toHaveBeenCalled(); // 验证构造函数被调用
```

### 使用场景

| 场景          | 示例                                    |
| ------------- | --------------------------------------- |
| 模拟回调函数  | `const onClick = vi.fn()`               |
| 模拟 API 请求 | `fetch.mockResolvedValue({ data: [] })` |
| 注入可控依赖  | `{ getTime: vi.fn(() => 1000) }`        |

---

## vi.spyOn —— 监听对象方法

### 核心区别

`spyOn` 会**真正替换**对象上的方法，而不仅仅是"旁观"。

```ts
import { vi } from "vitest";

const cart = {
  getApples: () => 42, // 原始实现
};

// spyOn 会替换 cart.getApples！
const spy = vi.spyOn(cart, "getApples").mockImplementation(() => 100);

cart.getApples(); // 返回 100（不是 42）
```

### 为什么设计成这样？

测试的精髓是**控制依赖**。如果不替换实现，就无法控制外部依赖的行为，测试会变得不确定。

```ts
// 控制当前时间
import { vi } from "vitest";

vi.spyOn(Date, "now").mockReturnValue(1704067200000);
expect(isExpired(timestamp)).toBe(false);
```

### 监听类的特殊注意

替换类定义时必须用 `function` 或 `class` 关键字，**不能用箭头函数**。

```ts
import { vi } from "vitest";

// 定义包含类的对象
const cart = {
  Apples: class {
    getApples() { return 42; }
  }
};

// ❌ 错误 - 使用箭头函数
vi.spyOn(cart, 'Apples').mockImplementation(() => ({...}))
// 报错：<anonymous> is not a constructor

// ✅ 正确 - 使用 function 关键字
vi.spyOn(cart, 'Apples').mockImplementation(function () {
  this.getApples = () => 0
})

// ✅ 正确 - 使用 class 关键字
vi.spyOn(cart, 'Apples').mockImplementation(
  class MockApples {
    getApples() { return 0 }
  }
)
```

---

## spyOn 与 fn 的关系

两者都调用 `createMockInstance` 创建 mock，但层级不同：

| 特性     | `vi.fn`            | `vi.spyOn`         |
| -------- | ------------------ | ------------------ |
| 操作目标 | 创建独立函数       | 替换对象的现有方法 |
| 恢复能力 | 无                 | 有 `mockRestore()` |
| 典型场景 | 模拟回调、注入依赖 | 监听和替换已有方法 |

**源码依据**：`spyOn` 会在创建 mock 后执行 `reassign(mock)` 将对象方法替换，并提供 `restore` 回调用于恢复。

---

## using 语法：自动资源管理

当使用 `using` 声明 spy 时，代码块结束会自动调用 `mockRestore()`。

```ts
import { vi } from "vitest";

// 使用 const - 不会自动恢复
it("test", () => {
  const spy = vi.spyOn(console, "log");
  // 测试结束，console.log 仍是 mock 状态！
});

// 使用 using - 自动恢复
it("test", () => {
  using spy = vi.spyOn(console, "log");
  // 代码块结束 → 自动调用 spy[Symbol.dispose]() → mockRestore()
});
```

**实现原理**：Vitest 在 mock 对象上实现了 `[Symbol.dispose]` 方法，内部调用 `mockRestore()`。

**环境要求**：

| 环境        | 要求                                                             |
| ----------- | ---------------------------------------------------------------- |
| Node.js     | >= 20 (原生支持) 或 >= 18.18.0 (实验性支持)                      |
| TypeScript  | `tsconfig.json` 中设置 `"lib": ["ES2022"]`, `"target": "ES2022"` |
| tsx/ts-node | 需要 `--experimental-strip-types` 或相应配置                     |

---

## 浏览器模式下的模块监听

浏览器环境中**无法直接用 spyOn 监听 ESM 导出**，因为模块命名空间是只读的。

```ts
// ❌ 浏览器模式下报错
vi.spyOn(calculatorModule, "calculator");
```

**解决方案**：使用 `{ spy: true }`

```ts
vi.mock("./calculator.ts", { spy: true });

import { calculator } from "./calculator.ts";

calculator(1, 2);
expect(calculator).toHaveBeenCalledWith(1, 2);
expect(calculator).toHaveReturnedWith(3);
```

`spy: true` 会模拟模块但保留完整实现，让你可以断言调用情况。

---

## 来源

- [Vitest 官方文档 - vi API](https://cn.vitest.dev/api/vi.html)
- [Vitest 源码 - packages/spy/src/index.ts](https://github.com/vitest-dev/vitest/blob/main/packages/spy/src/index.ts)
- [Vitest 浏览器模式限制](https://vitest.dev/guide/browser/#limitations)
