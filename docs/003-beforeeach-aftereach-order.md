# beforeEach 和 afterEach 的执行顺序

本文总结 Vitest 里 `beforeEach`、`afterEach`，以及 `beforeEach` 返回的 cleanup function 的实际执行机制。

## 结论

在当前 Vitest 实现中，单个测试的顺序是：

```ts
beforeEach -> test body -> afterEach -> cleanup from beforeEach
```

也就是说，`beforeEach` 返回的 cleanup function 并不是在 `afterEach` 之前执行，而是在 `afterEach` 之后执行。

另外，`beforeEach` 本身可以是异步的。异步 `beforeEach` 的 `await` 部分属于 setup 阶段，会先完成，再进入 `test body`。

这篇文档只演示一个 `beforeEach` / `afterEach` 组合。多个 hook 或嵌套 `describe` 时，Vitest 默认按 stack order 处理，`after` 类 hooks 会反向执行。

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

1. `beforeEach` 先执行并被等待
2. `beforeEach` 最终返回的函数会被收集成 cleanup
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

### 返回 async 函数作为 cleanup

如果 `beforeEach` 返回的是一个 `async` 函数，这个函数才是 cleanup。Vitest 会把它收集起来，并在 `afterEach` 之后执行：

## 四种写法对比

| 写法                                          | 是否等待 | 是否作为 cleanup | 含义                                               |
| --------------------------------------------- | -------- | ---------------- | -------------------------------------------------- |
| `beforeEach(async () => { await ... })`       | 是       | 否               | 异步 setup                                         |
| `beforeEach(() => Promise<void>)`             | 是       | 否               | 异步 setup                                         |
| `beforeEach(() => () => {})`                  | 是       | 是               | 同步 cleanup                                       |
| `beforeEach(() => Promise.resolve(() => {}))` | 是       | 是               | 当前实现下，Promise 最终解析出函数时会作为 cleanup |

前两种是 setup，后两种才会进入 cleanup 语义。当前实现里，Vitest 关心的是 `beforeEach` 最终解析出的值是否为函数。

```ts
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

describe("async cleanup function", () => {
  const events: string[] = [];

  beforeEach(() => {
    events.push("beforeEach");

    return async () => {
      events.push("cleanup start");
      await Promise.resolve();
      events.push("cleanup end");
    };
  });

  afterEach(() => {
    events.push("afterEach");
  });

  test("records order", () => {
    expect(events).toEqual(["beforeEach"]);
    events.push("test body");
  });

  afterAll(() => {
    expect(events).toEqual([
      "beforeEach",
      "test body",
      "afterEach",
      "cleanup start",
      "cleanup end",
    ]);
  });
});
```

所以异步 cleanup 的完整顺序仍然是：

```ts
beforeEach -> test body -> afterEach -> cleanup start -> cleanup end
```

### 直接返回 Promise 不是 cleanup

如果 `beforeEach` 直接返回一个 `Promise<void>`，Vitest 会先等待这个 Promise 完成，这仍然是 setup，而不是 cleanup。

```ts
beforeEach(() => {
  return new Promise<void>((resolve) => {
    // 这里会在 test body 之前完成
    resolve();
  });
});
```

这种写法验证的是异步 setup 的等待行为，不是 cleanup 的执行位置。

### 返回 Promise 解析出函数

如果 `beforeEach` 返回的是一个 Promise，且这个 Promise 最终解析出一个函数，那么这个函数仍然会被当成 cleanup：

```ts
beforeEach(() => {
  return Promise.resolve(async () => {
    // cleanup
  });
});
```

这说明 Vitest 关心的是 `beforeEach` 最终解析出的值是否为函数，而不是它是不是直接写成 `async` 函数。

## 参考来源

- Vitest Hooks API: https://vitest.dev/api/hooks/
- Vitest 源码: `packages/runner/src/run.ts`
