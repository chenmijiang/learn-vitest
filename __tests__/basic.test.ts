import { assert, describe, expect, test } from "vitest";

describe("basic test configuration", () => {
  test.skip("should skip this test", () => {
    assert.fail("This test should be skipped");
  });

  test("dynamic skip this test", (context) => {
    context.skip("Skipping this test dynamically");
    assert.fail("This test should be skipped");
  });

  // test.only("should only run this test", () => {
  //   assert.equal(1 + 1, 3, "This test should fail because 1 + 1 is not equal to 3");
  // });

  test("should run this test", () => {
    assert.equal(1 + 1, 2, "This test should pass because 1 + 1 is equal to 2");
  });

  test("should catch thrown error", () => {
    // expect 接收一个函数，断言该函数执行时会抛出异常
    expect(() => {
      throw new Error("something went wrong");
    }).toThrow("something went wrong");
  });

  test("should catch specific error type", () => {
    // 可以同时断言错误类型和错误消息
    expect(() => {
      throw new TypeError("invalid type");
    }).toThrow(TypeError);
  });

  test("should not throw", () => {
    // 断言函数不会抛出异常
    expect(() => {
      return 1 + 1;
    }).not.toThrow();
  });
});
