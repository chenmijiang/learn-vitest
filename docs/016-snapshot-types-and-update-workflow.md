# Vitest 快照类型全谱与生成 / 更新 / 清除工作流

## 先看结论

- 快照分**文本快照**和**图像快照**两大类，用哪类**取决于你调用的 API，而不是运行环境**。
- 在 Browser Mode 里写测试，调用 `toMatchSnapshot()` 依然产出 `.snap` **文本**；只有 `toMatchScreenshot()` 才产出 `.png` **图像**（视觉回归）。
- 文本侧有 5 个 API：`toMatchSnapshot` / `toMatchInlineSnapshot` / `toMatchFileSnapshot` / `toThrowErrorMatchingSnapshot` / `toThrowErrorMatchingInlineSnapshot`，区别在**存到哪、存成什么形态**。
- 生成是首次运行**自动**完成；更新用 `vitest -u`（watch 模式按 `u`）；过时快照（obsolete）随 `-u` 一并删除；CI 下默认不写快照，更新必须在本地做。

## 1. 先厘清：为什么 Browser Mode 里快照是 `.snap` 文本

一个常见困惑是：「我在 Browser Mode 写的测试，快照怎么是 `.snap` 文本，不是图片？」

原因是快照的**产物形态由 API 决定，与运行环境无关**：

| 你调用的 API          | 比较的东西         | 产物                           |
| --------------------- | ------------------ | ------------------------------ |
| `toMatchSnapshot()`   | 序列化后的**文本** | `.snap` 文本                   |
| `toMatchScreenshot()` | 渲染出来的**像素** | `.png` 图像（仅 Browser Mode） |

所以即使在真实浏览器里跑，`toMatchSnapshot()` 比的也是 DOM 的**文本结构**而非外观。要做"看起来对不对"的视觉回归，必须改用 `toMatchScreenshot()`（详见项目 wiki 的 visual-regression 主题）。

两者是同一种心智（留底 → 对比 → 差异需人工确认），只是一个比文本、一个比图像。

## 2. 文本快照 API 全谱

### 2.1 对照表

| API                                    | 存储位置                                | 形态                                | 优点                           | 缺点                    | 适合场景                     |
| -------------------------------------- | --------------------------------------- | ----------------------------------- | ------------------------------ | ----------------------- | ---------------------------- |
| `toMatchSnapshot()`                    | `__snapshots__/<文件名>.snap`           | 序列化文本                          | 不污染测试文件；适合大输出     | 要跳到另一个文件看 diff | DOM 结构、复杂对象、较长输出 |
| `toMatchInlineSnapshot()`              | **写回测试文件本身**（作为字符串参数）  | 序列化文本                          | 断言与期望值并排，review 直观  | 大输出会撑爆测试文件    | 小而稳定的值、单行结构       |
| `toMatchFileSnapshot()`                | **你指定的任意文件**（如 `./out.html`） | 任意扩展名                          | 可用 `.html`/`.xml` 等原生格式 | 需手动管理文件路径      | 代码生成、HTML 等格式化输出  |
| `toThrowErrorMatchingSnapshot()`       | `.snap`                                 | 错误消息（序列化为 `[Error: ...]`） | 专门固定函数抛出的错误消息     | 仅限抛错场景            | 校验错误消息                 |
| `toThrowErrorMatchingInlineSnapshot()` | 测试文件本身                            | 错误消息（序列化为 `[Error: ...]`） | 错误消息内联，直观             | 仅限抛错场景            | 校验小段错误消息             |

### 2.2 用法示例

文件快照（默认存到测试文件旁的 `__snapshots__/`）：

```ts
import { expect, test } from "vitest";

test("file snapshot", () => {
  expect({ id: 1, name: "vitest" }).toMatchSnapshot();
});
```

内联快照（首次运行后 Vitest 把期望值**自动写回**到 `` `...` `` 里）：

```ts
test("inline snapshot", () => {
  expect({ id: 1 }).toMatchInlineSnapshot(`
    {
      "id": 1,
    }
  `);
});
```

自定义文件快照（适合 HTML 这类本身有格式的产物）：

```ts
test("html output", async () => {
  await expect(renderToHtml()).toMatchFileSnapshot("./test/basic.output.html");
});
```

错误消息快照：

```ts
test("throws", () => {
  expect(() => parse("bad")).toThrowErrorMatchingSnapshot();
});
```

## 3. 图像快照（视觉回归，仅 Browser Mode）

```ts
import { expect } from "vitest";
import { page } from "vitest/browser";

test("visual", async () => {
  // 首次：生成基准图存到 __screenshots__/；之后：逐像素对比
  await expect(page.getByTestId("hero")).toMatchScreenshot("hero-section");
});
```

- 基准文件存在 `__screenshots__/`，文件名含浏览器与平台标识（如 `hero-section-chromium-darwin.png`），需提交到版本控制。
- 视觉回归易受字体/渲染环境影响而误报，稳定性实践（只截元素、`mask` 动态内容、禁用动画、固定视口、统一 CI 环境）见项目 wiki 的 visual-regression 主题，本文不展开。

## 4. 生成 / 更新 / 清除 / 重建

### 4.1 生成（首次自动）

第一次运行时快照不存在 → Vitest **自动创建**并让测试通过。从第二次运行起才进行对比。

### 4.2 更新（变化是预期的）

```bash
# CLI：进入更新模式，重写所有不匹配的快照
vitest -u
vitest --update
```

- **watch 模式**下，测试因快照不匹配失败时，按 `u` 键交互式更新。
- 更新前**务必先看 diff 是否合理**，确认确实是预期变化，再更新——不要机械地按 `u` 或跑 `-u`。

### 4.3 清除过时快照（obsolete）

当你删除或重命名了测试用例，原来的快照条目就"对不上任何测试"，Vitest 会把它们标记为 **obsolete（过时）**。

- 运行 `vitest -u` 时，会在更新不匹配快照的同时，**一并删除**这些过时条目。

### 4.4 彻底重新生成

- 删除对应的 `.snap` 文件（图像则删 `__screenshots__/` 下的 `.png`），再跑一次测试即可重建；
- 或直接 `vitest -u` 重写。

### 4.5 CI 行为（重要）

当 `process.env.CI` 为真时，Vitest **默认不写入快照文件**：缺失或不匹配的快照会直接判定为**失败**，而不会偷偷生成"新基准"。

含义：**更新快照要在本地做并提交进 git**，不要指望 CI 帮你生成或更新——那等于关掉了快照这层保护。

## 5. 常见误区

- **以为产物形态由环境决定**：在 Browser Mode 里 `toMatchSnapshot()` 照样是 `.snap` 文本；要图像得显式用 `toMatchScreenshot()`。
- **用快照代替所有精确断言**：快照适合"变化值得被审查"的结构化输出，不该取代针对单一值的精确断言。
- **对含时间戳 / 随机数的输出直接打快照**：会导致快照每次都变、反复无常，应先用自定义序列化器或 `mask` 等手段消除噪音。
- **在 CI 里靠 `-u` 更新**：CI 默认不写快照，更新应在本地完成并提交。
- **不看 diff 就更新**：`-u` / 按 `u` 前要确认变化是预期的，否则快照会失去回归保护意义。

## 来源

- https://cn.vitest.dev/guide/snapshot （快照官方指南：`toMatchSnapshot` / `toMatchInlineSnapshot` / `toMatchFileSnapshot` / `toThrowErrorMatching*` 的存储位置与形态、`-u`/`--update` 与 watch 模式 `u`、obsolete 快照随 `-u` 删除、CI 默认不写快照）
- https://cn.vitest.dev/guide/browser/visual-regression-testing.html （`toMatchScreenshot` 图像快照、`__screenshots__` 基准目录、跨平台文件名）
- 项目 wiki `wiki/topics/snapshots.md` 与 `wiki/topics/visual-regression.md`（已对照官方核对的留底-对比心智与视觉回归实践）
