# Vitest 快照测试完全指南

## 什么是快照？

**定义**

快照（Snapshot）是一个测试工具，用于捕获代码输出的完整状态，并在后续测试运行中与之比较。Vitest 会在首次运行测试时创建快照文件，后续运行将对比当前输出与参考快照，确保输出没有意外改变。

**核心思想**

快照类似于拍照：第一次测试时拍下"相片"（快照），以后每次运行都对比最新的"相片"与参考相片是否一样。

---

## 快照 vs 断言的区别

| 维度         | 快照 (`toMatchSnapshot`) | 断言 (`toBe`, `toEqual` 等) |
| ------------ | ------------------------ | --------------------------- |
| **验证方式** | 整体输出结构不变         | 验证特定条件是否满足        |
| **适用场景** | 大量、复杂的输出         | 单个、具体的业务逻辑        |
| **更新方式** | `vitest -u` 一键更新     | 手动修改测试代码            |
| **易读性**   | 对复杂对象/组件友好      | 对单值验证友好              |
| **改动频率** | 结构稳定后很少改         | 日常代码最常用              |

### 使用示例对比

```typescript
// ❌ 用多个断言验证复杂 HTML（冗长不易维护）
expect(htmlOutput).toContain('<div class="card">');
expect(htmlOutput).toContain("<h1>");
expect(htmlOutput).toContain("</div>");
expect(htmlOutput).toContain('data-id="123"');

// ✅ 用快照验证（简洁易维护）
expect(htmlOutput).toMatchSnapshot();

// ✅ 用断言验证单个业务条件（推荐）
expect(user.name).toBe("John");
expect(items.length).toBeGreaterThan(0);
expect(fn).toHaveBeenCalledWith("apple", 20);
```

---

## 快照的应用场景

### 1. UI 组件渲染

验证组件输出的 HTML 结构不会意外变化：

```typescript
import { render } from "@testing-library/vue";
import Button from "./Button.vue";

test("button renders correctly", () => {
  const { container } = render(Button, {
    props: { label: "Click me" },
  });
  expect(container.innerHTML).toMatchSnapshot();
});
```

### 2. 复杂对象转换

验证数据转换的完整结果（特别是嵌套结构）：

```typescript
test("user serialization", () => {
  const user = {
    id: 1,
    name: "John",
    profile: {
      avatar: "avatar.jpg",
      bio: "Developer",
    },
    tags: ["js", "vue", "testing"],
  };
  expect(JSON.stringify(user, null, 2)).toMatchSnapshot();
});
```

### 3. 错误消息

确保错误提示文本与预期一致：

```typescript
test("validation error message", () => {
  expect(() => {
    validateEmail("invalid-email");
  }).toThrowErrorMatchingSnapshot();
});
```

### 4. 代码生成

验证生成的代码、配置文件等是否正确：

```typescript
test("generate config file", () => {
  const config = generateConfig({ env: "production" });
  expect(config).toMatchSnapshot();
});
```

---

## 使用快照的三种方式

### 1. 文件快照 (推荐)

**优点：** 快照与测试分离，易于版本控制审查

**快照文件位置规则：**

- 测试文件：`src/components/Button.test.ts`
- 快照文件：`src/components/__snapshots__/Button.test.ts.snap`

即：`__snapshots__/` 目录与测试文件同级，快照文件名为 `[测试文件名].snap`

```typescript
import { expect, test } from "vitest";

test("renders heading", () => {
  const html = renderComponent();
  expect(html).toMatchSnapshot();
});
```

首次运行会生成 `__snapshots__/Button.test.ts.snap` 文件：

```javascript
// vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports["renders heading 1"] = `
<div class="heading">
  <h1>Welcome</h1>
</div>
`;
```

**快照文件中的数字编号规则：**

- 同一个测试文件中的第一个 `toMatchSnapshot()` 调用 → `["renders heading 1"]`
- 第二个 `toMatchSnapshot()` 调用 → `["renders heading 2"]`
- 多个 `test` 块中的快照按顺序编号

### 2. 内联快照

**优点：** 快照与测试在同一文件，无需跳转查看

```typescript
import { expect, test } from "vitest";

test("renders heading", () => {
  const html = renderComponent();
  expect(html).toMatchInlineSnapshot();
});
```

运行后自动更新测试代码：

```typescript
expect(html).toMatchInlineSnapshot(`
  <div class="heading">
    <h1>Welcome</h1>
  </div>
`);
```

### 3. 文件路径快照

**优点：** 快照存储在指定文件，方便特定格式（HTML、CSS 等）

**⚠️ 注意：** `toMatchFileSnapshot()` 返回 **Promise**，必须使用 `await`，否则测试可能伪通过

```typescript
import { expect, test } from "vitest";

test("renders HTML", async () => {
  const html = renderComponent();
  // ❌ 错误：没有 await，测试会伪通过
  expect(html).toMatchFileSnapshot("./expected-output.html");

  // ✅ 正确：使用 await
  await expect(html).toMatchFileSnapshot("./expected-output.html");
});
```

---

## 快照的工作流程

### 首次运行测试

```bash
vitest
```

- Vitest 执行测试
- 如果没有快照文件，会创建 `.snap` 文件
- 测试通过

### 代码改变后再次运行

假设你修改了组件，导致输出改变：

```bash
vitest
```

输出：

```
FAIL  | tests/Button.test.ts
✓ renders correctly (expected)
✗ renders correctly (snapshot mismatch)

Expected:   <button>Old Text</button>
Received:   <button>New Text</button>

Press 'u' to update the snapshot
```

### 更新快照

**方式 1：交互模式（推荐）**

按 `u` 键更新失败的快照

**方式 2：命令行**

```bash
vitest -u
```

或

```bash
vitest --update
```

更新后快照文件变为：

```javascript
exports["renders correctly 1"] = `<button>New Text</button>`;
```

### 审查并提交

1. 查看快照文件的 diff：`git diff __snapshots__/`（根据实际测试目录，如 `tests/__snapshots__/` 或 `src/__snapshots__/`）
2. 确认改变符合预期
3. 提交快照文件到 git：`git add *.snap && git commit`

---

## 快照最佳实践

### ✅ DO - 应该这样做

1. **快照配合断言** - 同时验证结构和具体值

```typescript
test("user profile", () => {
  const profile = getUserProfile();
  // 快照检查整体结构
  expect(profile).toMatchSnapshot();
  // 断言检查关键值
  expect(profile.id).toBeTruthy();
  expect(profile.email).toContain("@");
});
```

2. **保持快照简洁** - 过大的快照难以审查

```typescript
// ❌ 不好：快照包含太多无关数据
expect(entireDatabaseExport).toMatchSnapshot();

// ✅ 好：只快照必要部分
expect(user).toMatchSnapshot();
expect(user.permissions).toMatchSnapshot();
```

3. **快照文件纳入版本控制** - 快照应与代码一起 commit

```bash
git add src/
git add __snapshots__/
git commit -m "feat: add user profile feature"
```

4. **审查快照变化** - 提交前仔细检查 diff

```bash
git diff __snapshots__/
```

### ❌ DON'T - 不应该这样做

1. **用快照验证随机数据**

```typescript
// ❌ 不好：随机数据每次都不同
const randomId = Math.random();
expect({ id: randomId }).toMatchSnapshot();

// ✅ 好：使用 mock 固定数据
vi.spyOn(Math, "random").mockReturnValue(0.5);
expect({ id: Math.random() }).toMatchSnapshot();
```

2. **忽视快照变化直接更新**

```typescript
// ❌ 不好：盲目按 u 键更新
vitest -u  # 没有审查变化

// ✅ 好：先查看变化再更新
# 1. 运行测试看 diff
vitest
# 2. 检查改变是否符合预期
# 3. 再按 u 或 vitest -u
```

3. **快照替代所有测试**

```typescript
// ❌ 不好：只用快照，没有业务逻辑验证
expect(result).toMatchSnapshot();

// ✅ 好：快照 + 断言组合
expect(result.items).toHaveLength(3);
expect(result.total).toBe(100);
expect(result).toMatchSnapshot();
```

---

## 常见问题

### Q1: 快照文件应该提交吗？

**A:** 是的。快照是代码行为的参考，应该与代码一起版本控制，便于 code review。

### Q2: 如何在 CI 环境禁止更新快照？

**A:** CI 环境默认不允许写入快照（当 `process.env.CI` 为 true 时）。任何快照不匹配都会导致测试失败。这是为了防止自动化流程意外修改快照，确保所有快照变化都经过 code review 验证。

### Q3: 快照太大了怎么办？

**A:** 可以用 `toMatchFileSnapshot()` 将快照存储在独立文件，或使用**部分匹配快照**来忽略动态字段：

```typescript
// ❌ 不好：快照包含所有字段，其中某些是动态的
expect(response).toMatchSnapshot();

// ✅ 好：忽略动态字段（ID、时间戳等），只验证结构
expect(response).toMatchSnapshot({
  id: expect.any(String), // 忽略具体的 ID 值
  createdAt: expect.any(String), // 忽略时间戳
  user: {
    name: expect.any(String), // 只验证有 name 字段，不验证具体值
  },
});
```

这样做的好处是：快照不会因为时间戳变化而频繁失败，同时仍能验证响应结构。

### Q4: 如何自定义快照格式？

**A:** 使用 `expect.addSnapshotSerializer()` 定制序列化方式。例如，为 Date 对象定制格式：

```typescript
// 在测试文件或 vitest.config.ts 中配置
expect.addSnapshotSerializer({
  test: (val) => val instanceof Date,
  print: (val) => `Date(${val.toISOString()})`,
});

// 之后快照中的所有 Date 对象会用自定义格式显示
test("custom date format", () => {
  const data = { createdAt: new Date("2025-04-06") };
  expect(data).toMatchSnapshot();
  // 快照中会显示：Date(2025-04-06T00:00:00.000Z)
});
```

---

## 快照的常见陷阱

### ⚠️ 陷阱1：盲目更新快照

```typescript
// ❌ 风险：运行 vitest -u 后，所有快照都被更新，可能掩盖 bug
vitest - u; // 没有仔细检查变化

// ✅ 推荐流程：
// 1. 运行测试，看到快照不匹配
vitest;
// 2. 在输出中查看期望值 vs 实际值
// 3. 确认改变是否符合预期代码变化
// 4. 按 u 键或运行 vitest -u 更新
// 5. 再次运行测试确认通过
vitest;
```

### ⚠️ 陷阱2：用快照替代所有测试

```typescript
// ❌ 不好：只用快照，无法验证业务逻辑
test("fetch user data", async () => {
  const user = await fetchUser(1);
  expect(user).toMatchSnapshot(); // 快照改变 = 测试失败，但无法判断是否符合预期
});

// ✅ 好：快照 + 业务逻辑验证
test("fetch user data", async () => {
  const user = await fetchUser(1);

  // 验证关键业务逻辑
  expect(user.id).toBe(1);
  expect(user.email).toContain("@");
  expect(user.status).toBeOneOf(["active", "inactive"]);

  // 验证整体结构不变
  expect(user).toMatchSnapshot();
});
```

### ⚠️ 陷阱3：快照包含不稳定的数据

```typescript
// ❌ 不好：测试数据随机，快照每次都变
test("generate report", () => {
  const report = {
    data: generateRandomData(), // 每次不同！
    timestamp: Date.now(), // 每次不同！
  };
  expect(report).toMatchSnapshot(); // ❌ 会频繁失败
});

// ✅ 好：mock 不稳定数据
test("generate report", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  const now = new Date("2025-04-06T00:00:00Z");
  vi.useFakeTimers();
  vi.setSystemTime(now);

  const report = {
    data: generateRandomData(),
    timestamp: Date.now(),
  };
  expect(report).toMatchSnapshot(); // ✅ 稳定

  vi.useRealTimers();
});
```

---

## 来源

- [Vitest 官方文档 - 快照测试](https://cn.vitest.dev/guide/snapshot)
- [Vitest API - toMatchSnapshot](https://cn.vitest.dev/api/expect#tomatchsnapshot)
- [Vitest API - toMatchFileSnapshot](https://cn.vitest.dev/api/expect#tomatchfilesnapshot)
- Vitest 版本：4.1.0
- 文档验证日期：2025-04-06
- 多轮审查完成：通过语言清晰性、技术准确性、完整性、易理解性四维检查
