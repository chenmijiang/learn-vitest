# Mock 清理方法详解：clearAllMocks vs resetAllMocks vs restoreAllMocks

## 概述

Vitest 提供了三个 mock 清理方法，它们都能清除 mock 的调用历史，但作用范围和效果不同。本文详细对比这三个方法，帮助你理解何时使用哪个。

| 方法                       | 清除历史 | 重置实现 | 恢复原始 | 适用场景           |
| -------------------------- | -------- | -------- | -------- | ------------------ |
| **`vi.clearAllMocks()`**   | ✓        | ✗        | ✗        | 测试间隔清理       |
| **`vi.resetAllMocks()`**   | ✓        | ✓        | ✗        | 恢复 mock 默认状态 |
| **`vi.restoreAllMocks()`** | ✗        | ✗        | ✓        | spy 场景清理       |

---

## 1. vi.clearAllMocks() - 清除调用历史

### 功能

**清除所有 mock 的调用历史记录，但保留 mock 的实现。**

调用历史包括：

- 函数被调用的次数
- 每次调用的参数
- 每次调用的返回值

### 代码示例

```javascript
import { vi, expect, test } from "vitest";

test("clearAllMocks 示例", () => {
  const mockFn = vi.fn(() => "result");

  // 第一步：调用 mock
  mockFn("arg1");
  mockFn("arg2");

  expect(mockFn).toHaveBeenCalledTimes(2); // ✓ 通过
  expect(mockFn).toHaveBeenCalledWith("arg1"); // ✓ 通过

  // 第二步：清除历史
  vi.clearAllMocks();

  // 第三步：检查结果
  expect(mockFn).toHaveBeenCalledTimes(0); // ✓ 历史被清空
  expect(mockFn()).toBe("result"); // ✓ 实现保留
});
```

### 使用场景：测试间隔清理

这是最常用的清理方法，在 `afterEach` 中使用：

```javascript
import { afterEach, describe, test, expect, vi } from "vitest";

describe("用户服务", () => {
  const mockFetch = vi.fn();

  afterEach(() => {
    // 每个测试后清除历史，防止测试间相互干扰
    vi.clearAllMocks();
  });

  test("获取用户1", () => {
    mockFetch("user1");
    expect(mockFetch).toHaveBeenCalledWith("user1");
  });

  test("获取用户2", () => {
    mockFetch("user2");
    // 由于之前清除了历史，这里只检测到 user2 的调用
    expect(mockFetch).toHaveBeenCalledWith("user2");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

---

## 2. vi.resetAllMocks() - 重置为未实现状态

### 功能

**清除所有 mock 的调用历史，并将 mock 的实现重置为默认状态（返回 `undefined`）。**

### 代码示例

```javascript
import { vi, expect, test } from "vitest";

test("resetAllMocks 示例", () => {
  const mockFn = vi.fn(() => "original result");

  // 第一步：自定义 mock 的返回值
  mockFn.mockReturnValue("custom result");
  mockFn();

  expect(mockFn).toHaveBeenCalledTimes(1); // ✓ 被调用1次
  expect(mockFn()).toBe("custom result"); // ✓ 返回自定义值

  // 第二步：重置所有 mock
  vi.resetAllMocks();

  // 第三步：检查结果
  expect(mockFn).toHaveBeenCalledTimes(0); // ✓ 历史被清空
  expect(mockFn()).toBe(undefined); // ✓ 实现被重置为默认状态
});
```

### 使用场景：多次修改 mock 实现

当你在测试中多次修改 mock 的实现，并需要恢复到初始状态：

```javascript
import { beforeEach, test, expect, vi } from "vitest";

describe("支付系统", () => {
  const mockPayment = vi.fn();

  beforeEach(() => {
    // 初始化 mock
    mockPayment.mockReturnValue({ success: true });
  });

  test("成功支付", () => {
    expect(mockPayment()).toEqual({ success: true });
  });

  test("失败支付 - 自定义实现", () => {
    // 修改实现
    mockPayment.mockReturnValue({ success: false, error: "余额不足" });
    expect(mockPayment()).toEqual({ success: false, error: "余额不足" });

    // 重置为初始状态
    vi.resetAllMocks();
    expect(mockPayment()).toEqual({ success: true });
  });
});
```

---

## 3. vi.restoreAllMocks() - 恢复原始实现

### 功能

**恢复所有由 `vi.spyOn()` 创建的 spy 的原始实现。**

重要特点：

- 只作用于 `vi.spyOn()` 创建的 spy
- **不清空调用历史** ← 关键区别
- **不影响 `vi.mock()` 的 auto mock**

### 代码示例

```javascript
import { vi, expect, test } from "vitest";

test("restoreAllMocks 示例 - spy 场景", () => {
  // 原始对象
  const calculator = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
  };

  // 第一步：创建 spy
  const spyAdd = vi.spyOn(calculator, "add");
  spyAdd.mockReturnValue(100); // 修改 spy 的实现

  // 第二步：调用 spy
  calculator.add(2, 3);
  calculator.add(5, 5);

  expect(spyAdd).toHaveBeenCalledTimes(2); // ✓ 被调用2次
  expect(calculator.add(2, 3)).toBe(100); // ✓ 返回 mock 值

  // 第三步：恢复原始实现
  vi.restoreAllMocks();

  // 第四步：检查结果
  expect(spyAdd).toHaveBeenCalledTimes(2); // ⚠️ 历史保留！
  expect(calculator.add(2, 3)).toBe(5); // ✓ 恢复原始计算逻辑
});
```

### 关键特点：调用历史保留

```javascript
import { vi, test, expect } from "vitest";

test("restoreAllMocks 保留调用历史", () => {
  const obj = { method: () => "original" };

  const spy = vi.spyOn(obj, "method");
  spy.mockReturnValue("mocked");

  // 调用多次
  obj.method();
  obj.method();
  obj.method();

  console.log("恢复前：");
  console.log("调用次数:", spy.mock.calls.length); // 3

  vi.restoreAllMocks();

  console.log("\n恢复后：");
  console.log("调用次数:", spy.mock.calls.length); // ⚠️ 仍然是 3
  console.log("返回值:", obj.method()); // 'original' - 恢复原始实现
});
```

### 使用场景：spy 测试清理

在 `afterEach` 中恢复所有 spy 的原始实现：

```javascript
import { afterEach, test, expect, vi } from "vitest";

describe("DOM 操作", () => {
  afterEach(() => {
    // 恢复所有 spy 的原始实现
    vi.restoreAllMocks();
  });

  test("监视 console.log", () => {
    const spyLog = vi.spyOn(console, "log");
    console.log("test message");
    expect(spyLog).toHaveBeenCalledWith("test message");
  });

  test("console.log 已恢复", () => {
    // spy 已被移除，console.log 恢复正常
    console.log("normal message"); // 真的会打印到控制台
  });
});
```

---

## 理解文档中的两个 WARNING

### WARNING 1: "不会触及 automocking 期间生成的任何 mock"

```javascript
import { vi, test } from "vitest";

// 自动模拟这个模块
vi.mock("./math.js");

test("restoreAllMocks 不作用于 auto mock", async () => {
  const { add } = await import("./math.js");

  add(1, 1);

  // 调用 vi.restoreAllMocks - 对 auto mock 无效
  vi.restoreAllMocks();

  // add 仍然是 mock，没有被恢复
  console.log(add.mock !== undefined); // true
});
```

**含义：** `vi.restoreAllMocks()` 只恢复 `vi.spyOn()` 创建的 spy，不管 `vi.mock()` 的 auto mock。

### WARNING 2: "既不会清空调用历史，也不会重置 mock 的实现"

```javascript
import { vi, test, expect } from "vitest";

test("restoreAllMocks 的特殊性", () => {
  const obj = { method: () => "original" };
  const spy = vi.spyOn(obj, "method");

  spy.mockReturnValue("mocked");
  spy(); // 调用一次

  vi.restoreAllMocks();

  // ✗ 调用历史保留（不像 clearAllMocks）
  expect(spy).toHaveBeenCalledTimes(1); // ✓ 通过

  // ✓ 恢复原始实现（这是 restoreAllMocks 的唯一作用）
  expect(obj.method()).toBe("original"); // ✓ 通过
});
```

**含义：** 相比 `clearAllMocks()` 和 `resetAllMocks()`，`restoreAllMocks()` 专注于恢复原始实现，而不关心清理历史或重置配置。

---

## 完整对比表

| 操作                  | `clearAllMocks()` | `resetAllMocks()` | `restoreAllMocks()` |
| --------------------- | ----------------- | ----------------- | ------------------- |
| **清除调用历史**      | ✓                 | ✓                 | ✗                   |
| **重置实现**          | ✗                 | ✓                 | ✗                   |
| **恢复原始函数**      | ✗                 | ✗                 | ✓                   |
| **作用于 vi.fn()**    | ✓                 | ✓                 | ✗                   |
| **作用于 vi.spyOn()** | ✓                 | ✓                 | ✓                   |
| **作用于 vi.mock()**  | ✓                 | ✓                 | ✗                   |
| **最常见用途**        | 测试间隔清理      | 恢复默认状态      | spy 场景清理        |

---

## 实际应用指南

### 场景1：测试框架配置推荐

```javascript
// vitest.config.js
export default {
  test: {
    globals: true,
    clearMocks: true, // ← 每个测试后自动调用 vi.clearAllMocks()
    restoreMocks: true, // ← 每个测试后自动调用 vi.restoreAllMocks()
  },
};
```

### 场景2：手动配置清理

```javascript
import { afterEach, describe, test, vi } from "vitest";

describe("完整的 mock 清理", () => {
  afterEach(() => {
    // 1. 恢复 spy 的原始实现
    vi.restoreAllMocks();

    // 2. 清除 vi.fn() 创建的 mock 的历史
    vi.clearAllMocks();

    // 3. 如果需要完全重置 vi.fn() 创建的 mock
    vi.resetAllMocks();
  });

  test("测试用例", () => {
    // 测试代码
  });
});
```

### 场景3：选择合适的方法

```javascript
// 如果只需要清除历史记录
// → 使用 vi.clearAllMocks()
afterEach(() => {
  vi.clearAllMocks();
});

// 如果需要完全重置 mock
// → 使用 vi.resetAllMocks()
afterEach(() => {
  vi.resetAllMocks();
});

// 如果使用了 vi.spyOn()
// → 使用 vi.restoreAllMocks()
afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## 总结

- **`vi.clearAllMocks()`** - 最常用，用于日常测试清理
- **`vi.resetAllMocks()`** - 用于需要完全重置 mock 状态的场景
- **`vi.restoreAllMocks()`** - 专门用于 spy 场景，恢复被监视方法的原始实现

选择哪个方法取决于你的具体需求：你只想清除历史，还是要重置实现，还是要恢复原始方法？

---

## 相关资源

- [Vitest 官方文档 - vi.clearAllMocks()](https://cn.vitest.dev/api/vi.html#vi-clearallmocks)
- [Vitest 官方文档 - vi.resetAllMocks()](https://cn.vitest.dev/api/vi.html#vi-resetallmocks)
- [Vitest 官方文档 - vi.restoreAllMocks()](https://cn.vitest.dev/api/vi.html#vi-restoreallmocks)
- [Vitest 官方文档 - vi.spyOn()](https://cn.vitest.dev/api/vi.html#vi-spyon)
