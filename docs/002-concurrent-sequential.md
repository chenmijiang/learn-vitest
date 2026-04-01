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

## 快照测试中的注意事项

在使用 `test.concurrent` 时，**必须从 TestContext 获取 expect**：

```typescript
// ❌ 错误：全局 expect 无法正确关联快照
test.concurrent("snapshot test", async () => {
  expect(data).toMatchSnapshot();
});

// ✅ 正确：使用 context 中的 expect
test.concurrent("snapshot test", async ({ expect }) => {
  expect(data).toMatchSnapshot();
});
```

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

- [Vitest API - test.concurrent](https://vitest.dev/api/test#test-concurrent)
- [Vitest API - test.sequential](https://vitest.dev/api/test#test-sequential)
- 项目测试实例：`__tests__/concurrent-sequential.test.ts`
