# beforeEach 和 afterEach 的执行顺序

本文总结 Vitest 里 `beforeEach`、`afterEach`，以及 `beforeEach` 返回的 cleanup function 的实际执行机制。

## 结论

在当前 Vitest 实现中，单个测试的顺序是：

```ts
beforeEach -> test body -> afterEach -> cleanup from beforeEach
```

也就是说，`beforeEach` 返回的 cleanup function 并不是在 `afterEach` 之前执行，而是在 `afterEach` 之后执行。

另外，`beforeEach` 本身可以是异步的。异步 `beforeEach` 的 `await` 部分属于 setup 阶段，会先完成，再进入 `test body`。

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
3. 异步 `beforeEach` 会先完成 setup
4. 测试体执行完后，先跑 `afterEach`
5. 最后才执行 `beforeEach` 返回的 cleanup

## 说明

Vitest 文档说明：

- `beforeEach` 可以返回一个 cleanup function
- 这个 cleanup function 的作用是做测试后的清理

但源码显示，它是作为独立的 cleanup 阶段执行的，不是 `afterEach` 的替代品。

如果 `beforeEach` 是异步函数，里面的 `await` 只是让测试开始前多等一段 setup 时间，不会改变 cleanup 的位置。

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

### 异步 setup 示例

```ts
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

describe("async setup in beforeEach", () => {
  const events: string[] = [];

  beforeEach(async () => {
    events.push("setup start");
    await Promise.resolve();
    events.push("setup end");

    return () => {
      events.push("cleanup from setup");
    };
  });

  afterEach(() => {
    events.push("afterEach");
  });

  test("setup completes before the test body", () => {
    expect(events).toEqual(["setup start", "setup end"]);
    events.push("test body");
  });

  afterAll(() => {
    expect(events).toEqual([
      "setup start",
      "setup end",
      "test body",
      "afterEach",
      "cleanup from setup",
    ]);
  });
});
```

## 参考来源

- Vitest Hooks API: https://vitest.dev/api/hooks/
- Vitest 源码: `packages/runner/src/run.ts`
