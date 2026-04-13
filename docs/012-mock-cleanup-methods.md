# Mock 清理方法：`clearAllMocks` vs `resetAllMocks` vs `restoreAllMocks`

## 先看结论

| 方法                   | 做什么                                           | 不做什么                                     | 典型场景               |
| ---------------------- | ------------------------------------------------ | -------------------------------------------- | ---------------------- |
| `vi.clearAllMocks()`   | 清空调用历史（`mock.calls` / `mock.results` 等） | 不改实现                                     | 每个用例后清理调用计数 |
| `vi.resetAllMocks()`   | 清空调用历史 + 重置实现到初始状态                | 不恢复对象原始属性描述符                     | 需要把 mock 行为“归零” |
| `vi.restoreAllMocks()` | 恢复 `vi.spyOn()` 创建的 spy 到原始实现          | 不清空调用历史；不处理 `vi.mock()` 自动 mock | spy 场景收尾           |

## 1) `vi.clearAllMocks()`

只清调用历史，函数实现保持不变。

```ts
import { expect, test, vi } from "vitest";

test("clearAllMocks", () => {
  const fn = vi.fn(() => "result");
  fn("a");
  expect(fn).toHaveBeenCalledTimes(1);

  vi.clearAllMocks();

  expect(fn).toHaveBeenCalledTimes(0);
  expect(fn()).toBe("result"); // 实现仍在
});
```

## 2) `vi.resetAllMocks()`

关键点：`reset` 是“回到初始状态”，不是“统一变成 `undefined`”。

- `vi.fn()`（无初始实现）重置后调用返回 `undefined`
- `vi.fn(() => "initial")`（有初始实现）重置后会恢复为 `"initial"`

```ts
import { expect, test, vi } from "vitest";

test("resetAllMocks", () => {
  const emptyMock = vi.fn();
  const withInitialImpl = vi.fn(() => "initial");

  emptyMock.mockReturnValue("temp");
  withInitialImpl.mockReturnValue("temp");
  expect(emptyMock()).toBe("temp");
  expect(withInitialImpl()).toBe("temp");

  vi.resetAllMocks();

  expect(emptyMock()).toBe(undefined); // vi.fn() -> undefined
  expect(withInitialImpl()).toBe("initial"); // vi.fn(impl) -> 回到初始实现
});
```

## 3) `vi.restoreAllMocks()`

只针对 `vi.spyOn()` 创建的 spy，恢复到对象原始实现。

官方文档里的两条警告要点：

- 不会处理 automocking（`vi.mock()` 生成的 mock）
- 不会清空调用历史，也不会重置 mock 实现历史

```ts
import { expect, test, vi } from "vitest";

test("restoreAllMocks", () => {
  const calculator = { add: (a: number, b: number) => a + b };
  const spyAdd = vi.spyOn(calculator, "add");
  spyAdd.mockReturnValue(100);

  calculator.add(2, 3);
  expect(spyAdd).toHaveBeenCalledTimes(1);
  expect(calculator.add(2, 3)).toBe(100);

  vi.restoreAllMocks();

  expect(calculator.add(2, 3)).toBe(5); // 对象方法已恢复
  expect(spyAdd).toHaveBeenCalledTimes(2); // 历史保留，但新调用不再进入旧 spy
});
```

## 常见误区

- 误区 1：`resetAllMocks` 后任何 `vi.fn` 都返回 `undefined`
  - 纠正：只有无初始实现的 `vi.fn()` 是这样；`vi.fn(impl)` 会回到 `impl`。
- 误区 2：`restoreAllMocks` 会清空调用次数
  - 纠正：不会，调用历史保留。
- 误区 3：`restoreAllMocks` 能撤销 `vi.mock()` 的自动 mock
  - 纠正：不能；它只恢复 `vi.spyOn` 的 spy。

## 参考资料

- [Vitest 官方 - vi API](https://cn.vitest.dev/api/vi.html)
- [Vitest 官方 - Mock API](https://cn.vitest.dev/api/mock)
