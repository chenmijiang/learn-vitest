# test.concurrent 和 test.sequential 详解

## 核心概念

### 默认行为：Sequential（顺序执行）

- vitest 中所有测试**默认按顺序执行**
- 每个测试必须等待前一个测试完成才能运行
- 这确保了测试的稳定性和可预测性

### 模式对比

| 特性     | Sequential | Concurrent   |
| -------- | ---------- | ------------ |
| 执行方式 | 一个接一个 | 同时运行多个 |
| 默认     | ✅ 是      | ❌ 否        |
| 执行时间 | 较长       | 较短         |
| 共享状态 | 安全       | 需谨慎       |
| 依赖关系 | 支持       | 不支持       |
| 场景     | 数据库操作 | 独立单元测试 |

## 使用场景详解

### 1️⃣ 顺序执行场景 - 数据库操作

```typescript
describe("Database Operations", () => {
  let userId: number | null = null;

  test("create user", () => {
    userId = 1; // 创建用户
  });

  test("update user", () => {
    // ✅ 依赖前一个测试的结果
    expect(userId).toBe(1);
    userId = 2;
  });

  test("delete user", () => {
    // ✅ 依赖前面两个测试的结果
    expect(userId).toBe(2);
  });
});
```

**为什么顺序执行？**

- 测试之间有明确的依赖关系
- 需要保证数据流向和状态变化
- 并发执行会导致数据不一致

### 2️⃣ 并发执行场景 - 独立 API 调用

```typescript
describe("API Calls", () => {
  test.concurrent("fetch users", async () => {
    const res = await fetchUsers();
    expect(res).toBeDefined();
  });

  test.concurrent("fetch products", async () => {
    const res = await fetchProducts();
    expect(res).toBeDefined();
  });

  test.concurrent("fetch orders", async () => {
    const res = await fetchOrders();
    expect(res).toBeDefined();
  });
});
```

**为什么并发执行？**

- 这些测试完全独立，无共享状态
- 大幅提高测试执行速度
- 没有竞态条件或冲突

### 3️⃣ 混合模式 - 全局并发下的局部顺序

```typescript
// vitest.config.ts 配置全局并发
export default defineConfig({
  test: {
    sequence: { concurrent: true },
  },
});

// 测试文件
test("并发测试 1", () => {});
test("并发测试 2", () => {});

test.sequential("顺序测试 - 需要隔离", () => {
  // 修改全局状态
  globalState = "modified";
});

test.sequential("顺序测试 - 验证全局状态", () => {
  // 依赖前一个测试的全局状态修改
  expect(globalState).toBe("modified");
});
```

## 深入理解：concurrent 的执行顺序

### 常见困惑

运行 concurrent 测试时，观察 trace 输出会发现：

```
A-start → B-start → C-start → A-end → B-end → C-end
```

看起来 start 和 end **分别都是有序的**，这和 sequential 的区别在哪？

### 原因：JS 单线程 + 事件循环

`test.concurrent` 不是多线程并行，而是**异步并发**。JS 是单线程的，执行模型如下：

**Sequential 的时间线：**

```
t=0ms    A-start
t=100ms  A-end
t=100ms  B-start     ← 等 A 完成才启动 B
t=200ms  B-end
t=200ms  C-start
t=300ms  C-end
总耗时: ~300ms
```

**Concurrent 的时间线：**

```
t=0ms    A-start（同步执行到 await sleep，让出控制权）
t=0ms    B-start（同步执行到 await sleep，让出控制权）
t=0ms    C-start（同步执行到 await sleep，让出控制权）
t=100ms  A-end（sleep 到期，按注册顺序回调）
t=100ms  B-end
t=100ms  C-end
总耗时: ~100ms
```

### 为什么 start 有序？

三个 test 函数被按注册顺序**同步调用**。每个函数从开头执行到第一个 `await` 之前的代码（包括 `trace.push("start")`）都是同步的，所以 start 的顺序就是代码书写顺序。

### 为什么 end 也有序？

因为三个 sleep 时长相同（都是 100ms），它们的 Promise 按注册顺序 resolve，微任务队列按 FIFO 处理，所以 end 也恰好有序。

### 如何验证真正的并发？

给不同任务设置**不同的 sleep 时长**，end 顺序就会由实际耗时决定：

```typescript
test.concurrent("task A (150ms)", async () => await runTask("A", 150));
test.concurrent("task B (50ms)", async () => await runTask("B", 50));
test.concurrent("task C (100ms)", async () => await runTask("C", 100));
// 输出顺序：A-start, B-start, C-start, B-end, C-end, A-end
```

### 核心区别总结

| 指标              | Sequential   | Concurrent             |
| ----------------- | ------------ | ---------------------- |
| 时间重叠          | 无，串行执行 | 有，sleep 时间重叠     |
| 总耗时（3×100ms） | ~300ms       | ~100ms                 |
| start 顺序        | 按代码顺序   | 按代码顺序（同步部分） |
| end 顺序          | 按代码顺序   | 取决于各任务实际耗时   |

> 判断是否真正并发，看的不是日志顺序，而是**总耗时**和**时间是否重叠**。

## concurrent 中的 expect：全局 vs 本地

### 两种 expect 的区别

```typescript
import { test, expect } from "vitest"; // ← 全局 expect（共享实例）

// ✅ 从 test context 解构的 expect（每个 test 独立实例）
test.concurrent("test A", async ({ expect }) => {
  expect(data).toMatchSnapshot();
});
```

### 为什么 concurrent 需要本地 expect？

全局 `expect` 是所有 test 共享的单例，内部需要追踪"当前断言属于哪个 test"。sequential 模式下同一时间只有一个 test 在跑，没有歧义；但 concurrent 模式下多个 test **同时运行**，全局 expect 无法正确区分断言归属，会导致：

1. **快照错乱** — snapshot 写到错误的 test 名下
2. **断言计数混乱** — `expect.assertions(2)` 的计数可能跨 test 累加
3. **错误归属错误** — 断言失败时报告到错误的 test 上

而 `({ expect })` 解构出的是**绑定到当前 test 的私有实例**，天然隔离，不会串扰。

### 什么时候必须用本地 expect？

| 场景                                      | 全局 `expect` | 本地 `({ expect })` |
| ----------------------------------------- | :-----------: | :-----------------: |
| 普通 `test`                               |      OK       |         OK          |
| `test.concurrent` + 简单断言              |  通常能工作   |        推荐         |
| `test.concurrent` + **snapshot**          |    会出错     |      **必须**       |
| `test.concurrent` + `expect.assertions()` |    会出错     |      **必须**       |

### 实际写法

```typescript
// ❌ concurrent 中用全局 expect — 快照和计数可能出问题
test.concurrent("snapshot test", async () => {
  expect(data).toMatchSnapshot();
});

// ✅ concurrent 中用本地 expect — 安全
test.concurrent("snapshot test", async ({ expect }) => {
  expect(data).toMatchSnapshot();
});
```

> **经验法则**：写 `test.concurrent` 时，养成从参数解构 `({ expect })` 的习惯，避免潜在问题。

## 组合用法

```typescript
// 跳过并发测试
test.skip.concurrent("跳过此并发测试", () => {});

// 仅运行此并发测试
test.only.concurrent("仅运行此并发测试", () => {});

// 并发测试但期望失败
test.fails.concurrent("应该失败的并发测试", () => {
  expect(true).toBe(false);
});

// TODO 并发测试
test.todo.concurrent("待实现的并发测试");
```

## 性能影响

### 顺序执行

```
Test 1: ████████░ (100ms)
Test 2:        ████░ (80ms)
Test 3:             ████░ (100ms)
总耗时: ~280ms
```

### 并发执行

```
Test 1: ████████░ (100ms)
Test 2: ████░     (80ms)
Test 3: ██████░   (100ms)
总耗时: ~100ms (最长的测试时间)
```

## 最佳实践

| 实践                         | 说明                             |
| ---------------------------- | -------------------------------- |
| ✅ 默认使用 Sequential       | 除非有明确的性能需求             |
| ✅ 独立单元测试用 Concurrent | 加快执行速度                     |
| ✅ 有依赖关系用 Sequential   | 确保测试稳定性                   |
| ✅ 快照测试用 Context expect | 正确关联快照                     |
| ❌ 避免竞态条件              | 不要在 concurrent 中共享可变状态 |
| ❌ 谨慎使用全局状态          | 容易导致测试失败                 |

## 信息来源

- [Vitest API - test.concurrent](https://cn.vitest.dev/api/test#test-concurrent)
- [Vitest API - test.sequential](https://cn.vitest.dev/api/test#test-sequential)
- [Vitest Guide - Test Context](https://cn.vitest.dev/guide/test-context)
- [Vitest Guide - Parallelism](https://cn.vitest.dev/guide/parallelism)
- 项目测试实例：`__tests__/concurrent-sequential.test.ts`
