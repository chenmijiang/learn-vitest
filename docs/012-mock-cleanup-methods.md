# Mock 清理方法：clearAllMocks vs resetAllMocks vs restoreAllMocks

## 快速对比

| 方法                   | 清除历史 | 重置实现 | 恢复原始 | 场景         |
| ---------------------- | -------- | -------- | -------- | ------------ |
| `vi.clearAllMocks()`   | ✓        | ✗        | ✗        | 测试间隔清理 |
| `vi.resetAllMocks()`   | ✓        | ✓        | ✗        | 恢复默认状态 |
| `vi.restoreAllMocks()` | ✗        | ✗        | ✓        | spy 场景清理 |

---

## vi.clearAllMocks() - 清除调用历史

**功能：清除 mock 的调用历史，但保留实现。**

```javascript
import { vi, expect, test } from "vitest";

test("clearAllMocks 示例", () => {
  const mockFn = vi.fn(() => "result");

  mockFn("arg1");
  expect(mockFn).toHaveBeenCalledTimes(1);

  vi.clearAllMocks();

  expect(mockFn).toHaveBeenCalledTimes(0); // ✓ 历史被清空
  expect(mockFn()).toBe("result"); // ✓ 实现保留
});
```

**最常见用法：**

```javascript
afterEach(() => {
  vi.clearAllMocks(); // 每个测试后清理
});
```

---

## vi.resetAllMocks() - 重置为未实现状态

**功能：清除调用历史，并将实现重置为默认状态（返回 `undefined`）。**

```javascript
import { vi, expect, test } from "vitest";

test("resetAllMocks 示例", () => {
  const mockFn = vi.fn(() => "original");

  mockFn.mockReturnValue("custom");
  mockFn();
  expect(mockFn()).toBe("custom");

  vi.resetAllMocks();

  expect(mockFn).toHaveBeenCalledTimes(0); // ✓ 历史清空
  expect(mockFn()).toBe(undefined); // ✓ 实现重置
});
```

**用途：** 需要完全重置 mock 状态，恢复到初始化时的样子。

---

## vi.restoreAllMocks() - 恢复原始实现

**功能：恢复所有由 `vi.spyOn()` 创建的 spy 的原始实现。**

关键特点：

- 只作用于 `vi.spyOn()` 创建的 spy
- **不清空调用历史** ← 重要
- **不影响 `vi.mock()` 的 auto mock**

```javascript
import { vi, expect, test } from "vitest";

test("restoreAllMocks 示例", () => {
  const calculator = {
    add: (a, b) => a + b,
  };

  // 创建 spy 并修改实现
  const spyAdd = vi.spyOn(calculator, "add");
  spyAdd.mockReturnValue(100);

  calculator.add(2, 3);
  expect(spyAdd).toHaveBeenCalledTimes(1);
  expect(calculator.add(2, 3)).toBe(100);

  vi.restoreAllMocks();

  expect(spyAdd).toHaveBeenCalledTimes(1); // ⚠️ 历史仍保留！
  expect(calculator.add(2, 3)).toBe(5); // ✓ 恢复原始实现
});
```

**用途：** spy 测试场景中恢复被监视方法的原始实现。

---

## 理解官方文档的两个 WARNING

### WARNING 1："不会触及 automocking 期间生成的任何 mock"

`vi.restoreAllMocks()` 只恢复 `vi.spyOn()` 创建的 spy，对 `vi.mock()` 的自动 mock 无效。

```javascript
vi.mock("./math.js");

test("restoreAllMocks 不作用于 auto mock", async () => {
  const { add } = await import("./math.js");
  vi.restoreAllMocks();
  console.log(add.mock !== undefined); // true - 仍是 mock
});
```

### WARNING 2："既不会清空调用历史，也不会重置 mock 的实现"

`vi.restoreAllMocks()` 与 `clearAllMocks()` 和 `resetAllMocks()` 的区别：

```javascript
const obj = { method: () => "original" };
const spy = vi.spyOn(obj, "method");
spy.mockReturnValue("mocked");
spy();

vi.restoreAllMocks();

// 调用历史保留（不同于其他两个方法）
expect(spy).toHaveBeenCalledTimes(1); // ✓

// 恢复原始实现（这是唯一的作用）
expect(obj.method()).toBe("original"); // ✓
```

**关键理解：** `vi.restoreAllMocks()` 专注恢复原始实现，不承担清理历史的职责。

---

## 完整对比表

| 方法                | 清除历史 | 重置实现 | 恢复原始 | 作用于 `vi.fn()` | 作用于 `vi.spyOn()` | 作用于 `vi.mock()` |
| ------------------- | -------- | -------- | -------- | ---------------- | ------------------- | ------------------ |
| `clearAllMocks()`   | ✓        | ✗        | ✗        | ✓                | ✓                   | ✓                  |
| `resetAllMocks()`   | ✓        | ✓        | ✗        | ✓                | ✓                   | ✓                  |
| `restoreAllMocks()` | ✗        | ✗        | ✓        | ✗                | ✓                   | ✗                  |

---

## 使用建议

### 配置文件方式（推荐）

```javascript
// vitest.config.js
export default {
  test: {
    clearMocks: true, // 自动调用 vi.clearAllMocks()
    restoreMocks: true, // 自动调用 vi.restoreAllMocks()
  },
};
```

### 手动方式

```javascript
afterEach(() => {
  // 场景1：仅清理历史
  vi.clearAllMocks();

  // 场景2：完全重置
  vi.resetAllMocks();

  // 场景3：恢复 spy
  vi.restoreAllMocks();
});
```

---

## 总结

- **`vi.clearAllMocks()`** 最常用，日常测试首选
- **`vi.resetAllMocks()`** 需要完全重置时使用
- **`vi.restoreAllMocks()`** 专用于 spy 场景

选择标准：

- 只清理历史 → `clearAllMocks()`
- 完全重置 mock → `resetAllMocks()`
- 恢复被监视方法 → `restoreAllMocks()`

---

## 参考资料

- [Vitest 官方 - vi.clearAllMocks()](https://cn.vitest.dev/api/vi.html#vi-clearallmocks)
- [Vitest 官方 - vi.resetAllMocks()](https://cn.vitest.dev/api/vi.html#vi-resetallmocks)
- [Vitest 官方 - vi.restoreAllMocks()](https://cn.vitest.dev/api/vi.html#vi-restoreallmocks)
