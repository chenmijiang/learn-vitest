import { describe, test, beforeEach, afterEach, expect } from "vitest";

/**
 * 演示 test.concurrent 和 test.sequential 的使用场景
 *
 * 默认模式：sequential（顺序执行）
 * - test.concurrent: 并发执行，与其他 concurrent 测试同时运行
 * - test.sequential: 强制顺序执行，用于全局并发模式下
 */

// ============================================================
// 场景 1：演示默认顺序执行（Sequential）
// ============================================================
describe("Scenario 1: Default Sequential Execution", () => {
  const executionOrder: string[] = [];

  beforeEach(() => {
    executionOrder.length = 0; // 清空执行顺序记录
  });

  test("sequential test 1", () => {
    executionOrder.push("test-1");
    expect(executionOrder).toEqual(["test-1"]);
  });

  test("sequential test 2", () => {
    // 这个测试会在 test-1 完成后执行
    executionOrder.push("test-2");
    expect(executionOrder).toEqual(["test-2"]);
  });

  test("sequential test 3", () => {
    // 这个测试会在 test-2 完成后执行
    executionOrder.push("test-3");
    expect(executionOrder).toEqual(["test-3"]);
  });
});

// ============================================================
// 场景 2：使用 test.concurrent 并发执行测试
// ============================================================
describe("Scenario 2: Concurrent Tests", () => {
  // 注意：由于测试是异步的且没有共享状态，可以安全地并发执行
  test.concurrent("concurrent test 1", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(true).toBe(true);
  });

  test.concurrent("concurrent test 2", async () => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(true).toBe(true);
  });

  test.concurrent("concurrent test 3", async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(true).toBe(true);
  });

  test("regular sequential test", () => {
    // 这个测试会按顺序执行（不是 concurrent）
    expect(true).toBe(true);
  });
});

// ============================================================
// 场景 3：混合并发和顺序测试
// ============================================================
describe("Scenario 3: Mixed Concurrent and Sequential", () => {
  test.concurrent("concurrent task A", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(1 + 1).toBe(2);
  });

  test.concurrent("concurrent task B", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(2 + 2).toBe(4);
  });

  test("sequential task 1", () => {
    // 这个测试不使用 concurrent，会按顺序执行
    expect(3 + 3).toBe(6);
  });

  test.concurrent("concurrent task C", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(4 + 4).toBe(8);
  });
});

// ============================================================
// 场景 4：数据库操作场景 - 需要顺序执行
// ============================================================
describe("Scenario 4: Database Operations (Sequential)", () => {
  let userId: number | null = null;

  test("create user", async () => {
    // 模拟创建用户
    userId = 1;
    expect(userId).toBe(1);
  });

  test("update user", async () => {
    // 这个测试依赖前一个测试的结果
    // 必须在 create user 之后执行
    expect(userId).toBe(1);
    userId = 2;
    expect(userId).toBe(2);
  });

  test("delete user", async () => {
    // 这个测试依赖前面两个测试的结果
    expect(userId).toBe(2);
    userId = null;
    expect(userId).toBeNull();
  });
});

// ============================================================
// 场景 5：独立的 API 模拟 - 可以并发执行
// ============================================================
describe("Scenario 5: Independent API Calls (Concurrent)", () => {
  // 这些测试互不依赖，可以并发执行
  test.concurrent("fetch user data", async () => {
    const response = await Promise.resolve({ id: 1, name: "Alice" });
    expect(response.id).toBe(1);
  });

  test.concurrent("fetch product data", async () => {
    const response = await Promise.resolve({ id: 100, title: "Laptop" });
    expect(response.id).toBe(100);
  });

  test.concurrent("fetch order data", async () => {
    const response = await Promise.resolve({ id: 200, total: 999 });
    expect(response.id).toBe(200);
  });
});

// ============================================================
// 场景 6：嵌套 describe 中的 concurrent
// ============================================================
describe.concurrent("Scenario 6: Concurrent Suite", () => {
  test("test in concurrent suite 1", async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(true).toBe(true);
  });

  test("test in concurrent suite 2", async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(true).toBe(true);
  });

  test.sequential("sequential test in concurrent suite", async () => {
    // 即使在 concurrent suite 中，这个测试也会顺序执行
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(true).toBe(true);
  });
});

// ============================================================
// 场景 7：使用 concurrent 时需要从 context 获取 expect（快照测试）
// ============================================================
describe("Scenario 7: Concurrent with Context Expect", () => {
  test.concurrent("concurrent snapshot test 1", async ({ expect }) => {
    // 使用 context 中的 expect 来确保快照正确关联到正确的测试
    const data = { name: "Alice", age: 25 };
    expect(data).toMatchSnapshot();
  });

  test.concurrent("concurrent snapshot test 2", async ({ expect }) => {
    // 每个 concurrent 测试都有独立的 expect 实例
    const data = { name: "Bob", age: 30 };
    expect(data).toMatchSnapshot();
  });
});

// ============================================================
// 场景 8：性能对比 - 顺序 vs 并发
// ============================================================
describe("Scenario 8: Performance Comparison", () => {
  describe("Sequential execution (slow)", () => {
    test("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });

    test("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });

    test("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });
    // 总耗时: ~300ms
  });

  describe("Concurrent execution (fast)", () => {
    test.concurrent("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });

    test.concurrent("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });

    test.concurrent("takes 100ms", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });
    // 总耗时: ~100ms (并发执行)
  });
});
