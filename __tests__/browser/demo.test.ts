import { describe, expect, it } from "vitest";

describe("browser demo", () => {
  // 这里可以编写浏览器环境下的测试代码

  it("should run in browser environment", () => {
    // 例如，可以测试一些 DOM 操作或者浏览器特有的 API
    const div = document.createElement("div");
    div.textContent = "Hello, Vitest!";
    document.body.appendChild(div);

    // 断言 div 是否正确添加到文档中
    const addedDiv = document.querySelector("div");
    expect(addedDiv).not.toBeNull();
    expect(addedDiv?.textContent).toBe("Hello, Vitest!");
  });
});
