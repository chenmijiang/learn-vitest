import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

describe("hook order: beforeEach declared first", () => {
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

describe("hook order: afterEach declared first", () => {
  const events: string[] = [];

  afterEach(() => {
    events.push("afterEach");
  });

  beforeEach(() => {
    events.push("beforeEach");

    return () => {
      events.push("cleanup from beforeEach");
    };
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
