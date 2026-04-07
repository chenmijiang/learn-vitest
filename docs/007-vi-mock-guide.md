# vi.mock 完全指南

## 什么是 vi.mock？

`vi.mock` 是 Vitest 提供的**模块模拟**工具，用于在测试中**替换真实模块**为模拟实现，让你能够：

- 隔离测试（不依赖真实数据库、API）
- 控制返回值（模拟各种边界情况）
- 验证调用行为（确认函数被正确调用）

---

## 核心概念：悬挂式(Hoisted)执行

### 什么是悬挂？

`vi.mock` 的调用会被**提升到文件最顶部**，在所有 `import` 之前执行：

```javascript
import { fetchData } from "./api.js";
import { vi } from "vitest";

vi.mock("./api.js", () => ({
  fetchData: () => "mocked",
}));
```

**实际执行顺序：**

```javascript
// 1. vi.mock 先执行（被提升）
vi.mock('./api.js', ...)

// 2. 然后才是 import
import { fetchData } from './api.js'  // 已经使用 mock 版本
```

**为什么要悬挂？**

- 保证模块在被导入前就已经被替换
- 无论你写在文件哪里，效果都一样
- 避免多次 mock 同一模块的混乱

---

## 三种使用方式

### 方式 1：自动模拟（不提供工厂）

```javascript
vi.mock("./api.js");

// 所有导出变成 mock 函数，返回 undefined
```

### 方式 2：自定义工厂函数

```javascript
vi.mock("./api.js", () => ({
  fetchData: () => "mocked data",
  default: { version: "1.0" }, // 默认导出
}));
```

### 方式 3：Spy 模式（保留实现）

```javascript
vi.mock("./api.js", { spy: true });

// 执行真实代码，但可以断言调用
```

---

## 常见陷阱与解决方案

### ❌ 工厂函数内不能引用外部变量

```javascript
const mockData = { name: "test" };

vi.mock("./api.js", () => ({
  fetchData: () => mockData, // ❌ 报错！
}));
```

**原因：** 工厂函数被悬挂到顶部执行，此时外部变量还未定义。

### ✅ 使用 vi.hoisted 解决

```javascript
const mocks = vi.hoisted(() => ({
  mockData: { name: "test" },
}));

vi.mock("./api.js", () => ({
  fetchData: () => mocks.mockData, // ✅ 正常
}));
```

---

## 高级用法：Promise 导入

### 更好的 IDE 支持

```javascript
vi.mock(import("./utils/math.js"), async (importOriginal) => {
  const mod = await importOriginal(); // 自动类型推断
  return {
    ...mod,
    complexCalc: vi.fn(), // 只 mock 部分方法
  };
});
```

**优势：**

- 文件移动时路径自动更新
- `importOriginal` 有完整类型支持
- IDE 自动补全和重构支持

**⚠️ 注意：** 不能用 TypeScript paths 别名（如 `@/utils/math`），必须用相对路径。

---

## **mocks** 文件夹自动 Mock

### 目录结构

```
project/
├── __mocks__/
│   └── axios.js          # 第三方依赖 mock
├── src/
│   ├── __mocks__/
│   │   └── helper.js     # 本地模块 mock
│   └── helper.js
└── tests/
    └── app.test.js
```

### 使用方式

不写工厂函数，自动加载 `__mocks__` 中的文件：

```javascript
// __mocks__/axios.js
export default {
  get: vi.fn().mockResolvedValue({ data: {} }),
};
```

```javascript
// app.test.js
vi.mock("axios"); // 自动使用 __mocks__/axios.js
vi.mock("../src/helper.js"); // 自动使用 src/__mocks__/helper.js
```

---

## 完整实战示例

### 场景：测试 Express Controller，Mock Model 层

```javascript
// models/user.js - 真实 Model
export async function findUser(id) {
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}
```

```javascript
// controllers/user.js - Controller 层
import { findUser } from "../models/user.js";

export async function getUser(req, res) {
  const user = await findUser(req.params.id);
  res.json(user);
}
```

```javascript
// tests/user.test.js - 测试
import { vi, test, expect } from "vitest";
import { getUser } from "../controllers/user.js";

vi.mock("../models/user.js", () => ({
  findUser: vi.fn(),
}));

test("should return user", async () => {
  const { findUser } = await import("../models/user.js");

  // 设置 mock 返回值
  findUser.mockResolvedValue({ id: 1, name: "John" });

  const req = { params: { id: "1" } };
  const res = { json: vi.fn() };

  await getUser(req, res);

  expect(findUser).toHaveBeenCalledWith("1");
  expect(res.json).toHaveBeenCalledWith({ id: 1, name: "John" });
});
```

---

## 关键要点速查

| 特性         | 说明                             |
| ------------ | -------------------------------- |
| 悬挂式       | `vi.mock` 总在 `import` 之前执行 |
| 缓存         | 工厂函数只执行一次，结果被缓存   |
| spy: true    | 保留真实实现，只添加监听         |
| vi.hoisted   | 解决工厂函数内引用外部变量的问题 |
| **mocks**    | 不写工厂时自动查找的 mock 文件夹 |
| Promise 导入 | 更好的 IDE 支持和类型推断        |

---

## 警告与限制

1. **只支持 ESM**：`vi.mock` 只对 `import` 有效，不支持 `require`
2. **必须直接导入 `vi`**：不能通过工具文件间接导入
3. **Setup 文件导入无法 mock**：需要在 `vi.hoisted` 中调用 `vi.resetModules()`
4. **不会自动 mock**：必须显式调用 `vi.mock()`，不像 Jest 自动生效

---

## 信息来源

- [Vitest 官方文档 - vi.mock](https://cn.vitest.dev/api/vi.html#vi-mock)
