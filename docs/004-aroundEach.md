# aroundEach 钩子详解

`aroundEach` 是 Vitest 提供的测试生命周期钩子，用于**包裹每个测试的执行**，能够在测试运行前后提供完整的上下文控制能力。

## 核心作用

与 `beforeEach`/`afterEach` 不同，`aroundEach` 可以将整个测试包裹在特定的上下文（context）中执行，让测试代码运行在受控环境里。

## API 定义

```ts
function aroundEach(
  body: (runTest: () => Promise<void>, context: TestContext) => Promise<void>,
  timeout?: number,
): void;
```

**参数说明**：

- `runTest`: 执行测试的函数，**必须调用**，否则测试会失败
- `context`: 测试上下文，可以访问 fixtures
- `timeout`: 可选的超时时间（毫秒），默认为 10 秒

## 工作原理

`runTest()` 函数会按顺序执行：

1. `beforeEach` 钩子
2. 测试代码本身（包括测试中用到的 fixtures 初始化）
3. `afterEach` 钩子

```
aroundEach 包裹
├── beforeEach 钩子
├── 测试代码执行（fixtures 在访问时初始化）
└── afterEach 钩子
```

**重要细节**：如果 `afterEach` 钩子需要访问 fixtures，这些 fixtures 会在 `runTest()` 调用**之前**就初始化好，确保 setup 和 teardown 阶段都能安全使用。

## 使用场景

### 1. 数据库事务包裹

最常见的用法是将测试包裹在数据库事务中，测试完成后自动回滚，保持数据干净：

```ts
import { aroundEach, test } from "vitest";

aroundEach(async (runTest) => {
  await db.transaction(runTest); // 在事务中运行测试
});

test("插入用户后回滚", async () => {
  await db.insert({ name: "Alice" });
  // 事务会在 runTest 返回后自动回滚
});
```

### 2. AsyncLocalStorage 上下文

在特定异步上下文中运行测试：

```ts
import { aroundEach, test } from "vitest";

const context = new AsyncLocalStorage<{ user: string }>();

aroundEach(async (runTest) => {
  await context.run({ user: "admin" }, runTest);
});

test("访问上下文数据", () => {
  const store = context.getStore();
  expect(store?.user).toBe("admin");
});
```

### 3. 性能追踪

将测试包裹在追踪 span 中：

```ts
aroundEach(async (runTest) => {
  await tracer.trace("test-span", runTest);
});
```

### 4. 结合 Fixtures 使用（TypeScript 支持）

使用 `test.aroundEach` 可以获得更好的 fixtures TypeScript 类型支持：

```ts
import { aroundEach, test as base } from "vitest";

const test = base.extend<{ db: Database; user: User }>({
  db: async ({}, use) => {
    const db = await createTestDatabase();
    await use(db);
    await db.close();
  },
  user: async ({ db }, use) => {
    const user = await db.createUser();
    await use(user);
  },
});

// 使用 test.aroundEach 获得类型提示
test.aroundEach(async (runTest, { db }) => {
  await db.transaction(runTest);
});

test("insert user", async ({ db, user }) => {
  await db.insert(user);
});
```

## 嵌套规则

注册多个 `aroundEach` 钩子时会相互嵌套，**先注册的是最外层**：

```ts
aroundEach(async (runTest) => {
  console.log("外层 - 前");
  await runTest();
  console.log("外层 - 后");
});

aroundEach(async (runTest) => {
  console.log("内层 - 前");
  await runTest();
  console.log("内层 - 后");
});

// 执行顺序：
// 外层 - 前 → 内层 - 前 → 测试 → 内层 - 后 → 外层 - 后
```

## 与 beforeEach/afterEach 的区别

| 场景                       | 推荐方案                    | 原因                 |
| -------------------------- | --------------------------- | -------------------- |
| 简单的资源准备和清理       | `beforeEach` + 返回清理函数 | 代码更简洁直观       |
| 测试需要在特定上下文中执行 | `aroundEach`                | 只有它能包裹测试执行 |

### 对比示例

**可互换的简单场景**（推荐用 beforeEach）：

```ts
// beforeEach 版本（推荐）
beforeEach(async () => {
  await db.connect();
  return async () => {
    await db.disconnect();
  };
});

// aroundEach 版本（过于复杂）
aroundEach(async (runTest) => {
  await db.connect();
  await runTest();
  await db.disconnect();
});
```

**必须用 aroundEach 的场景**：

```ts
// 测试在事务上下文中运行 - 只能用 aroundEach
aroundEach(async (runTest) => {
  await db.transaction(runTest); // 事务自动包裹测试
});
```

## 注意事项

1. **必须调用 `runTest()`**，否则测试会报错失败
2. 超时时间分别作用于：
   - `runTest()` 之前的 setup 阶段
   - `runTest()` 之后的 teardown 阶段
3. 可在 `aroundEach` 中访问 fixtures（它们会在 `runTest()` 执行时初始化）
4. 使用 `test.aroundEach` 可以获得更好的 TypeScript 类型支持

## 来源

- [Vitest 官方 API 文档 - Hooks](https://cn.vitest.dev/api/hooks#aroundeach)
