import { afterAll, describe, expect, test } from "vitest";

declare function setTimeout(
  handler: (...args: unknown[]) => void,
  timeout?: number,
): unknown;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

type TraceItem = {
  task: string;
  phase: "start" | "end";
  at: number;
};

/**
 * 目标：让“顺序执行”和“并发执行”的效果在输出和断言上都一眼可见。
 *
 * 参考：
 * - https://cn.vitest.dev/guide/parallelism
 * - https://cn.vitest.dev/api/test
 */

// ============================================================
// 场景 1：默认顺序执行（同一文件中的 test 默认顺序执行）
// ============================================================
describe("Scenario 1: Default Sequential Execution", () => {
  const trace: TraceItem[] = [];
  let suiteStart = 0;

  const runTask = async (name: string, ms: number) => {
    trace.push({ task: name, phase: "start", at: Date.now() });
    await sleep(ms);
    trace.push({ task: name, phase: "end", at: Date.now() });
  };

  test("task A (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("A", 100);
  });

  test("task B (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("B", 100);
  });

  test("task C (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("C", 100);
  });

  afterAll(() => {
    const timeline = trace.map((item) => `${item.task}-${item.phase}`);

    // 顺序执行时，开始/结束应严格串行
    expect(timeline).toEqual([
      "A-start",
      "A-end",
      "B-start",
      "B-end",
      "C-start",
      "C-end",
    ]);

    const total = Date.now() - suiteStart;
    // 3 个 100ms 顺序执行，通常应接近 300ms，给调度留余量
    expect(total).toBeGreaterThanOrEqual(260);
  });
});

// ============================================================
// 场景 2：使用 test.concurrent 并发执行
// ============================================================
describe("Scenario 2: test.concurrent Execution", () => {
  const trace: TraceItem[] = [];
  let suiteStart = 0;

  const runTask = async (name: string, ms: number) => {
    trace.push({ task: name, phase: "start", at: Date.now() });
    await sleep(ms);
    trace.push({ task: name, phase: "end", at: Date.now() });
  };

  test.concurrent("task A (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("A", 100);
  });

  test.concurrent("task B (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("B", 100);
  });

  test.concurrent("task C (100ms)", async () => {
    suiteStart = suiteStart || Date.now();
    await runTask("C", 100);
  });

  afterAll(() => {
    const starts = trace.filter((item) => item.phase === "start");
    const ends = trace.filter((item) => item.phase === "end");

    // 并发时，通常会先看到多个 start，再陆续出现 end
    expect(starts).toHaveLength(3);
    expect(ends).toHaveLength(3);

    const firstEndTime = Math.min(...ends.map((item) => item.at));
    const startedBeforeFirstEndCount = starts.filter(
      (item) => item.at <= firstEndTime,
    ).length;

    // 在第一个任务结束前，至少有 2 个任务已经启动，表示发生了重叠执行
    expect(startedBeforeFirstEndCount).toBeGreaterThanOrEqual(2);

    const total = Date.now() - suiteStart;
    // 3 个 100ms 并发时，总耗时应明显小于顺序 300ms
    expect(total).toBeLessThan(220);
  });
});

// ============================================================
// 场景 3：在并发 suite 中用 test.sequential 强制顺序
// ============================================================
describe.concurrent("Scenario 3: describe.concurrent + test.sequential", () => {
  const sequentialTrace: string[] = [];

  test.sequential("sequential step 1", async () => {
    sequentialTrace.push("step-1-start");
    await sleep(40);
    sequentialTrace.push("step-1-end");
  });

  test.sequential("sequential step 2", async () => {
    sequentialTrace.push("step-2-start");
    await sleep(40);
    sequentialTrace.push("step-2-end");
  });

  afterAll(() => {
    expect(sequentialTrace).toEqual([
      "step-1-start",
      "step-1-end",
      "step-2-start",
      "step-2-end",
    ]);
  });
});
