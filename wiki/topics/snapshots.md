---
title: Snapshots
created: 2026-04-14
updated: 2026-06-06
type: topic
tags: ["snapshot", "beginner"]
sources:
  - https://cn.vitest.dev/guide/snapshot
  - https://cn.vitest.dev/config/snapshotformat
  - https://cn.vitest.dev/config/snapshotserializers
  - https://cn.vitest.dev/guide/browser/visual-regression-testing.html
  - ../../docs/005-snapshot-testing.md
  - ../../docs/016-snapshot-types-and-update-workflow.md
---

# Snapshots

## 一句话总结

快照适合保存“结构化输出的当前样子”，但它不是万能断言，只有在变化本身值得被审查时才应该用。

### 相关主题

- [[assertions]]
- [[mocking]]

## 适用场景

- UI 渲染结果或复杂对象输出
- 错误消息、代码生成结果等文本化产物
- 需要审查变更 diff，而不是只关心真假断言

## 核心概念

### 快照类型全谱（文本 vs 图像）

快照分**文本**和**图像**两类，用哪类**取决于调用的 API，而不是运行环境**——这点常让人困惑：在 Browser Mode 里 `toMatchSnapshot()` 照样产出 `.snap` **文本**（比的是 DOM 序列化结构），只有 `toMatchScreenshot()` 才产出 `.png` **图像**（比的是渲染像素，见 [[visual-regression]]）。

文本侧 5 个 API，区别在「存到哪、存成什么形态」：

| API                                    | 存储位置                              | 形态                                | 适合场景                     |
| -------------------------------------- | ------------------------------------- | ----------------------------------- | ---------------------------- |
| `toMatchSnapshot()`                    | `__snapshots__/<文件名>.snap`         | 序列化文本                          | DOM 结构、复杂对象、较长输出 |
| `toMatchInlineSnapshot()`              | **写回测试文件本身**（字符串参数）    | 序列化文本                          | 小而稳定的值、单行结构       |
| `toMatchFileSnapshot()`                | **指定的任意文件**（如 `./out.html`） | 任意扩展名                          | 代码生成、HTML 等格式化输出  |
| `toThrowErrorMatchingSnapshot()`       | `.snap`                               | 错误消息（序列化为 `[Error: ...]`） | 校验函数抛出的错误消息       |
| `toThrowErrorMatchingInlineSnapshot()` | 测试文件本身                          | 错误消息（序列化为 `[Error: ...]`） | 校验小段错误消息             |

取舍要点：**文件快照**适合长期维护的大输出；**内联快照**适合小而稳定、希望 review 时并排看全的值；**`toMatchFileSnapshot`** 适合本身就是某种文件格式（HTML/XML 等）的产物。完整对照、代码示例与图像侧细节见 [016-snapshot-types-and-update-workflow.md](../../docs/016-snapshot-types-and-update-workflow.md)。

### 生成 / 更新 / 清除 / 重建工作流

- **生成**：首次运行时快照不存在 → Vitest **自动创建**并通过，从第二次起才对比。
- **更新**：`vitest -u` / `vitest --update` 重写不匹配的快照；watch 模式下测试失败时按 `u` 键交互式更新。
- **清除过时（obsolete）**：删除/重命名测试后，对不上任何测试的旧条目被标记 obsolete，运行 `-u` 时**一并删除**。
- **彻底重建**：删掉对应 `.snap`（图像删 `__screenshots__/*.png`）再跑，或直接 `-u`。
- **CI 行为（重要）**：`process.env.CI` 为真时 Vitest **默认不写快照文件**——缺失/不匹配直接判失败，不会偷偷生成新基准。所以**更新快照要在本地做并提交 git**。

> 习惯优先级：**先看 diff 是否合理，再决定要不要更新**，不要机械按 `u` 或跑 `-u`。

### 审查流程

先看 diff 是否合理，再决定是否更新快照，而不是直接按 `u`。

### 自定义序列化器

自定义序列化器的目标不是“改测试结果”，而是“改快照里最终写出来的文本”。也就是说，被测值本身没变，只是你决定用更适合审查的方式把它打印出来。

可以把它理解成两步：

- `test(val)`：先判断“这个值要不要交给我处理”
- `serialize(...)`：如果要处理，就返回一段最终写进快照的字符串

官方示例里 `test(val)` 会检查对象上是否有 `foo` 属性；命中后，`serialize(...)` 不直接把整个对象原样打印，而是只取 `val.foo`，再配合 `printer(...)` 继续复用 Vitest 已有的默认序列化能力。

对初学者来说，最容易记的心智模型是：

- `test` 像过滤器，负责“拦不拦”
- `serialize` 像格式化函数，负责“怎么显示”
- `printer` 像“调用 Vitest 默认打印机”，避免你自己递归处理嵌套对象

什么时候需要它：

- 快照里有噪音字段，导致 diff 很难看
- 某类对象默认输出不可读，需要统一改成更稳定、更短的文本
- 你想保留对象的一部分结构，而不是整个对象原样入快照

什么时候不需要它：

- 你只是想调整通用格式，例如 key 排序、函数名、shadow root、输出长度，这类优先看 `snapshotFormat`
- 你只是想在多个测试文件里复用同一个序列化器，这类优先用 `test.snapshotSerializers` 配置模块路径，而不是每个测试里手动 `expect.addSnapshotSerializer(...)`

## 常见误区

- 用快照代替所有精确断言
- 在包含时间、随机数等不稳定数据时直接生成快照
- **以为产物形态由运行环境决定**：在 Browser Mode 里 `toMatchSnapshot()` 照样是 `.snap` 文本；要图像得显式用 `toMatchScreenshot()`（见 [[visual-regression]]）
- **在 CI 里靠 `-u` 更新快照**：CI 下 `process.env.CI` 为真时默认不写快照，更新应在本地完成并提交 git
- **不看 diff 就更新**：`-u` / 按 `u` 前要确认变化是预期的，否则快照失去回归保护意义

## 证据状态

- 已验证：快照基本 API、自定义序列化器、`snapshotFormat` 与 `snapshotSerializers` 的职责边界来自官方文档和项目文档。
- 已验证（2026-06-06）：文本快照 5 个 API（`toMatchSnapshot` → `__snapshots__/*.snap`、`toMatchInlineSnapshot` → 写回测试文件、`toMatchFileSnapshot` → 任意指定文件、`toThrowErrorMatching[Inline]Snapshot` → 错误消息序列化为 `[Error: ...]`）的存储位置与形态，以及生成/更新（`-u`/`--update`、watch 按 `u`）/obsolete 随 `-u` 删除/CI 默认不写快照等工作流，全部 9 条经 `vitest-doc-verifier` 对照官方 `guide/snapshot` 与 `guide/browser/visual-regression-testing` 核对为 VERIFIED（沉淀于 `docs/016`）。
- 待验证：大型项目下的快照治理策略（阈值、分层审查）当前仓库尚无系统化文档，后续可补充。
- 冲突中：无。

## 最近更新

- 2026-06-06 ingest：并入新建发布文档 `docs/016-snapshot-types-and-update-workflow.md`，核心概念新增 "快照类型全谱（文本 vs 图像）"（取决于 API 而非环境，文本侧 5 个 API 对照表）与 "生成 / 更新 / 清除 / 重建工作流"（首次自动、`-u`/`--update`、watch 按 `u`、obsolete 随 `-u` 删除、CI 默认不写快照），补三条常见误区并与 [[visual-regression]] 交叉链接；全部事实经官方核对为 VERIFIED。
- 2026-04-20 query-update：补充自定义序列化器的心智模型，明确 `test` / `serialize` / `printer` 的分工，并区分 `expect.addSnapshotSerializer`、`snapshotFormat`、`snapshotSerializers` 的适用边界。
- 2026-04-14 ingest：补充“先审 diff 再更新快照”的流程化建议，减少机械更新。

## 关联文档

- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)
- [016-snapshot-types-and-update-workflow.md](../../docs/016-snapshot-types-and-update-workflow.md)

## 来源

- https://cn.vitest.dev/guide/snapshot
- https://cn.vitest.dev/config/snapshotformat
- https://cn.vitest.dev/config/snapshotserializers
- https://cn.vitest.dev/guide/browser/visual-regression-testing.html（图像快照 `toMatchScreenshot` 与 `__screenshots__` 基准）
- [005-snapshot-testing.md](../../docs/005-snapshot-testing.md)
- [016-snapshot-types-and-update-workflow.md](../../docs/016-snapshot-types-and-update-workflow.md)
