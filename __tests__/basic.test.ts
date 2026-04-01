import { assert, describe, test } from "vitest";

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
});
