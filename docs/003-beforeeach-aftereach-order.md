# beforeEach 和 afterEach 的执行顺序

本文总结 Vitest 里 `beforeEach`、`afterEach`，以及 `beforeEach` 返回的 cleanup function 的实际执行机制。

## 结论

在当前 Vitest 实现中，单个测试的顺序是：

```ts
beforeEach -> test body -> afterEach -> cleanup from beforeEach
```

也就是说，`beforeEach` 返回的 cleanup function 并不是在 `afterEach` 之前执行，而是在 `afterEach` 之后执行。

## 为什么会这样

根据 Vitest 源码，测试执行逻辑在 `packages/runner/src/run.ts` 的 `runTest()` 中：

```ts
beforeEachCleanups = await callSuiteHook(..., 'beforeEach', ...)
...
await callSuiteHook(..., 'afterEach', ...)
if (beforeEachCleanups.length) {
  await callCleanupHooks(runner, beforeEachCleanups)
}
```

可以看出：

1. `beforeEach` 先执行
2. `beforeEach` 的返回值会被收集成 cleanup 函数
3. 测试体执行完后，先跑 `afterEach`
4. 最后才执行 `beforeEach` 返回的 cleanup

## 说明

Vitest 文档说明：

- `beforeEach` 可以返回一个 cleanup function
- 这个 cleanup function 的作用是做测试后的清理

但源码显示，它是作为独立的 cleanup 阶段执行的，不是 `afterEach` 的替代品。

## 可验证示例

```ts
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

describe("hook order", () => {
  const events: string[] = [];

  beforeEach(() => {
    events.push("beforeEach");
    return () => {
      events.push("cleanup from beforeEach");
    };
  });

  afterEach(() => {
    events.push("afterEach");
  });

  test("records order", () => {
    events.push("test body");
  });

  afterAll(() => {
    expect(events).toEqual([
      "beforeEach",
      "test body",
      "afterEach",
      "cleanup from beforeEach",
    ]);
  });
});
```

## 参考来源

- Vitest Hooks API: https://vitest.dev/api/hooks/
- Vitest 源码: `packages/runner/src/run.ts`
