import { describe, expect, test, vi } from "vitest";

describe("mock cleanup methods", () => {
  test("vi.clearAllMocks: clears call history but keeps implementation", () => {
    const mockFn = vi.fn((arg) => "result");

    mockFn("a");
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    expect(mockFn).toHaveBeenCalledTimes(0);
    expect(mockFn("b")).toBe("result");
  });

  test("vi.resetAllMocks: resets history and implementation state", () => {
    const emptyMock = vi.fn();
    const mockWithInitialImpl = vi.fn(() => "initial");

    emptyMock.mockReturnValue("temp");
    mockWithInitialImpl.mockReturnValue("temp");

    expect(emptyMock()).toBe("temp");
    expect(mockWithInitialImpl()).toBe("temp");

    vi.resetAllMocks();

    // vi.fn() -> empty implementation (undefined)
    expect(emptyMock()).toBe(undefined);
    // vi.fn(impl) -> restored to provided impl
    expect(mockWithInitialImpl()).toBe("initial");
  });

  test("vi.restoreAllMocks: only restores vi.spyOn spies, keeping call history", () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spyAdd = vi.spyOn(calculator, "add");
    spyAdd.mockReturnValue(100);

    calculator.add(2, 3);
    expect(spyAdd).toHaveBeenCalledTimes(1);
    expect(calculator.add(2, 3)).toBe(100);

    vi.restoreAllMocks();

    expect(calculator.add(2, 3)).toBe(5);
    // restore 后，新调用不会继续记在旧 spy 上
    expect(spyAdd).toHaveBeenCalledTimes(2);
  });
});
