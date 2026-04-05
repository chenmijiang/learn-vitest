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

    // 不会被调用
    return () => {
      events.push("cleanup from afterEach");
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

describe("async cleanup order", () => {
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

    return new Promise<void>((resolve) => {
      events.push("afterEach cleanup start");
      resolve();
      events.push("afterEach cleanup end");
    });
  });

  test("cleanup does not run before the test body", () => {
    expect(events).toEqual(["beforeEach"]);
    events.push("test body");
  });

  afterAll(() => {
    expect(events).toEqual([
      "beforeEach",
      "test body",
      "afterEach",
      "afterEach cleanup start",
      "afterEach cleanup end",
      "cleanup start",
      "cleanup end",
    ]);
  });
});

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
