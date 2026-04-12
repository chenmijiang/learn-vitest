# vi.mockObject 与其他 Mock API 的本质差异

> **文档说明**：本文基于 Vitest 3.2.0+ 版本。`vi.mockObject()` 是 Vitest 3.2.0（2025-05）新增的 API。
>
> 本文内容基于 Vitest 源码分析，包括 `@vitest/mocker` 和 `vitest` 包的实现代码。

## 概述

Vitest 提供了三个主要的 mock API：`vi.mock()`、`vi.doMock()` 和 `vi.mockObject()`。虽然它们的名字相似，看起来都是用来"mock"，但它们工作在完全不同的系统层级，解决的是完全不同的问题。本文基于 Vitest 源码实现，深度分析这三个 API 的根本区别。

---

## 核心差异速览

| 维度         | vi.mock             | vi.doMock        | vi.mockObject       |
| ------------ | ------------------- | ---------------- | ------------------- |
| **工作系统** | 模块加载系统        | 模块加载系统     | JavaScript 对象系统 |
| **处理时机** | 编译时              | 运行时           | 运行时              |
| **自动提升** | 是（提升到顶部）    | 否               | 否                  |
| **缓存机制** | 全局缓存（永久）    | 全局缓存（永久） | 无缓存              |
| **使用对象** | 模块导入语句        | 动态 import      | 已加载的对象实例    |
| **作用范围** | 单个文件内的 import | 当前线程/测试    | 单个对象引用        |

---

## 1. 工作系统层级完全分离

### vi.mock / vi.doMock：模块加载系统

```
依赖链：Vite → 模块解析系统 → MockerRegistry → NativeModuleMocker → 缓存系统
```

- **核心依赖**：Vite 的模块加载器、模块 URL/ID 解析系统
- **工作流**：将模块引用映射到 mock factory 函数
- **生命周期**：与模块加载绑定，缓存在整个测试生命周期内

### vi.mockObject：JavaScript 对象系统

```
依赖链：JavaScript 对象遍历 → 属性描述符修改 → 对象引用修改
```

- **核心依赖**：`Object.getOwnPropertyDescriptor()`、`Object.defineProperty()`
- **工作流**：遍历对象属性，逐个替换为 mock 或 spy
- **生命周期**：纯函数式，修改传入的对象实例

**为什么不能互相替代**：模块系统和对象系统有完全不同的数据结构、查询机制、生命周期管理。无法用模块系统的 import 替换来实现对象属性的修改，反之亦然。

---

## 2. 编译时提升 vs 运行时执行

### vi.mock：编译时处理

Vite 插件在编译阶段扫描代码中的 `vi.mock()` 调用，**静态分析**并将其提升到文件顶部。同时，`vi.mock()` 所对应的 import 语句会被转换为动态 import，确保 mock 在模块加载前注册：

```javascript
// 源码
import { foo } from "./module";
vi.mock("./module", () => ({ foo: vi.fn() }));

// 编译后（Vite 插件转换）
vi.mock("./module", () => ({ foo: vi.fn() })); // 提升到顶部
// import 被转换为动态 import，延迟到 vi.mock 执行之后
```

这样确保：

1. `vi.mock()` 调用在 import 之前执行
2. 模块加载时，mock 已经注册到 MockerRegistry
3. import 获得的是 mock 版本

### vi.doMock：运行时处理

保持代码原始位置，在运行时执行：

```javascript
// 与源码一致，无转换
await vi.doMock("./module", () => ({ foo: vi.fn() }));
const { foo } = await import("./module");
```

**运行时处理的意义**：

- 支持条件判断：根据测试参数决定是否 mock
- 支持动态 import：可以在异步代码中调用
- 但必须在 import 之前调用

### vi.mockObject：原地运行

```javascript
const obj = { foo: realFunction, bar: realValue };
const mocked = vi.mockObject(obj, { foo: vi.fn() });
// mocked === obj（同一引用），但类型标记为 MaybeMockedDeep<typeof obj>
```

无编译转换，纯函数式操作。`vi.mockObject()` 修改原对象并返回其引用，返回类型为 `MaybeMockedDeep<T>` 以便 TypeScript 正确推导 mock 后的类型。

---

## 3. 模块缓存机制的根本差异

### vi.mock / vi.doMock：全局模块缓存

使用 `MockerRegistry` 的两层缓存系统：

**第一层：URL → ID 映射**

```javascript
// MockerRegistry 中的实现（源码）
registry.set(url, id, moduleFactory); // 按 URL 存储
```

**第二层：模块加载缓存**

```javascript
// NativeModuleMocker.load() 中的实现
if (this.registry.has(url, id)) {
  const cached = this.registry.get(url, id);
  return cached;
}
```

**缓存特点**：

- 全局永久缓存（整个测试生命周期）
- 同一模块多次 import 返回同一 mock 实例
- 模块语义要求：一个模块只能加载一次
- 跨测试共享（需要手动 cleanup）

### vi.mockObject：无缓存

```javascript
// 每次调用都遍历属性创建新的 mock，但修改同一原对象
const obj = { foo: realFunction };
vi.mockObject(obj, { foo: vi.fn() }); // 修改 obj，返回 obj
vi.mockObject(obj, { foo: vi.fn() }); // 再次修改 obj（覆盖前一次的 mock）
```

**无缓存的意义**：

- 灵活性高：每次调用都是独立的操作
- 不需要全局状态管理
- 便于对象级别的细粒度控制

---

## 4. 实现机制的详细对比

### vi.mock / vi.doMock：模块加载器拦截

**流程图**：

```
1. vi.mock(path, factory) / await vi.doMock(path, factory)
   ↓
2. 注册到 MockerRegistry
   registry.set(normalizedUrl, moduleId, factory)
   ↓
3. import / dynamic import 触发模块加载
   ↓
4. Vite 模块加载器调用 NativeModuleMocker.load()
   ↓
5. NativeModuleMocker 检查 registry
   if (registry.has(url, id)) {
     return moduleFactory()  // 返回 mock
   }
   ↓
6. Mock 实例缓存到 cache Map
```

**关键代码位置**：

- 注册：`@vitest/mocker/src/registry.ts` 的 `MockerRegistry.set()`
- 加载：`vitest/dist/chunks/nativeModuleMocker.*.js` 的 `NativeModuleMocker.load()`

### vi.mockObject：对象属性遍历

**流程图**：

```
1. vi.mockObject(obj, implementation)
   ↓
2. mockPropertiesOf(obj, implementation, automock)
   ↓
3. 遍历对象属性（含原型链）
   for (key in obj) {
     if (isOwn(obj, key)) { ... }
   }
   ↓
4. 对每个属性应用 mock / spy
   if (key in implementation) {
     obj[key] = implementation[key]  // 替换为 mock
   } else if (automock) {
     obj[key] = vi.fn()  // 自动 mock 为函数
   }
   ↓
5. 返回修改后的对象（修改原对象，无副本）
```

**关键特性**：

- 支持原型链属性
- 支持循环引用检测（`RefTracker`）
- 支持只读属性处理
- 支持数组和嵌套对象

---

## 5. 为什么不能互相替代

### 原因 1：模块解析依赖

`vi.mock/doMock` 需要：

- Vite 的模块解析系统（URL → ID 映射）
- 模块路径的规范化处理
- 条件导入的处理（根据环境变量等）

`vi.mockObject` 无法访问这些信息，它只能操作已加载到内存中的对象实例。

**例子**：

```javascript
// vi.mock 可以处理相对路径、别名等
vi.mock("@/utils/helper", () => ({ fn: vi.fn() }));

// vi.mockObject 无法处理路径，只能处理对象实例
const helper = require("@/utils/helper");
vi.mockObject(helper, { fn: vi.fn() });
```

### 原因 2：编译时信息需求

`vi.mock()` 依赖编译时的静态分析：

- 需要识别 `vi.mock()` 调用
- 需要提取模块路径字符串
- 需要生成转换代码

`vi.mockObject()` 是纯运行时的，无法访问这些编译信息。

### 原因 3：循环依赖处理机制不同

**模块系统**处理循环依赖通过延迟初始化：

```javascript
// module A
import B from "./b";
export const a = () => B.fn(); // 延迟访问 B

// module B
import A from "./a";
export const fn = () => A.a();
```

**对象系统**处理循环引用通过引用追踪：

```javascript
const obj = { nested: {} };
obj.nested.self = obj; // 循环引用
// vi.mockObject 使用 RefTracker 防止无限遍历
```

两种机制完全不同，无法转换。

### 原因 4：缓存策略的约束

**模块加载**是单例模式：一个模块只能加载一次，必须缓存。这是 JavaScript 模块系统的基本保证。

**对象修改**可以灵活重复：同一对象可以多次 mock，每次修改都是独立的。

### 原因 5：TypeScript 类型系统不同

```typescript
// vi.mock / vi.doMock 返回 Promise<any> 或 void
vi.mock("./module", () => ({ foo: vi.fn() })); // void
await vi.doMock("./module", () => ({ foo: vi.fn() })); // Promise<void>

// vi.mockObject 返回 MaybeMockedDeep<T>
const obj = { foo: () => "real", bar: 42 };
const mocked = vi.mockObject(obj, { foo: vi.fn() });
// mocked 的类型是 MaybeMockedDeep<typeof obj>
// 这告诉 TypeScript：obj.foo 现在是 Mock 函数而不是普通函数
```

这导致 TypeScript 推导出完全不同的类型，API 无法互换。`MaybeMockedDeep<T>` 类型确保 TypeScript 能够正确理解 mock 后对象的属性类型变化。

---

## 6. 实际使用场景

### vi.mock：替换 import 语句的模块

**场景**：你需要在整个测试文件中使用某个模块的 mock 版本。

```javascript
// 测试文件
vi.mock("./api", () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: "Test" })),
}));

import { fetchUser } from "./api"; // 这个 import 会得到 mock 版本

test("fetchUser returns mocked data", async () => {
  const user = await fetchUser();
  expect(user.name).toBe("Test");
});
```

### vi.doMock：条件性或异步的模块替换

**场景 1**：根据测试条件 mock 不同版本

```javascript
test("handles different API versions", async () => {
  if (process.env.API_VERSION === "v1") {
    await vi.doMock("./api-v1", () => ({ fetch: vi.fn() }));
  } else {
    await vi.doMock("./api-v2", () => ({ fetch: vi.fn() }));
  }

  const api = await import("./api");
  // 使用相应版本的 mock
});
```

**场景 2**：在异步流程中需要动态 mock

```javascript
async function setupTest() {
  const config = await loadConfig();
  await vi.doMock("./db", () => ({
    connect: vi.fn().mockResolvedValue({ database: config.database }),
  }));
}

await setupTest();
const db = await import("./db");
```

### vi.mockObject：修改已加载对象的属性

**场景 1**：Mock 类的实例方法

```javascript
class UserService {
  async getUser() {
    /* 真实实现 */
  }
  validateEmail() {
    /* 真实实现 */
  }
}

const userService = new UserService();
vi.mockObject(userService, {
  getUser: vi.fn(() => Promise.resolve({ id: 1 })),
  validateEmail: vi.fn(() => true),
});

test("user service with mocked methods", async () => {
  const user = await userService.getUser();
  expect(userService.validateEmail).toHaveBeenCalled();
});
```

**场景 2**：Mock 第三方库的对象方法

```javascript
import lodash from "lodash";

vi.mockObject(lodash, {
  debounce: vi.fn((fn) => fn), // 去掉防抖，直接执行
});

test("lodash debounce is disabled", () => {
  const fn = vi.fn();
  const debounced = lodash.debounce(fn, 100);
  debounced();
  expect(fn).toHaveBeenCalled(); // 立即执行，不延迟
});
```

**场景 3**：自动 mock 对象属性

```javascript
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};

vi.mockObject(config); // 自动 mock 所有属性为 undefined

test("config is mocked", () => {
  expect(config.apiUrl).toBeUndefined();
  expect(config.timeout).toBeUndefined();
});
```

---

## 7. 选择指南

| 问题                                   | 回答 | 使用 API                           |
| -------------------------------------- | ---- | ---------------------------------- |
| 我想 mock 一个**模块的 import**吗？    | 是   | `vi.mock()`                        |
| 我需要**条件判断**来决定是否 mock 吗？ | 是   | `vi.doMock()`                      |
| 我需要在**异步代码**中 mock 吗？       | 是   | `vi.doMock()`                      |
| 我要 mock 的是**已加载的对象实例**吗？ | 是   | `vi.mockObject()`                  |
| 我需要修改**类实例的方法**吗？         | 是   | `vi.mockObject()`                  |
| 我想 mock **第三方库的特定对象**吗？   | 是   | `vi.mockObject()`                  |
| 我需要**多个测试使用同一个 mock** 吗？ | 是   | `vi.mock()`                        |
| 我的 mock **只在单个测试中使用**吗？   | 是   | `vi.mockObject()` 或 `vi.doMock()` |

---

## 8. 常见错误

### 错误 1：尝试用 vi.mockObject 替代 vi.mock

```javascript
// ❌ 错误：期望 import 得到 mock，但 vi.mockObject 无法修改 import
import { fetchUser } from "./api";
// vi.mockObject 只能修改已加载的对象
const api = await import("./api"); // 重新加载模块
vi.mockObject(api, { fetchUser: vi.fn() });
// 但之前的 import 中的 fetchUser 仍然是真实实现

// ✅ 正确：使用 vi.mock
vi.mock("./api", () => ({
  fetchUser: vi.fn(),
}));
import { fetchUser } from "./api"; // 得到 mock
```

### 错误 2：期望 vi.mockObject 返回新对象

```javascript
// ❌ 错误：期望 vi.mockObject 返回副本
const original = { foo: () => "real" };
const mocked = vi.mockObject(original, { foo: vi.fn() });
console.log(original === mocked); // true，修改了原对象
console.log(original.foo); // 现在是 Mock 函数

// ✅ 正确：理解 vi.mockObject 修改原对象
const obj = { foo: () => "real" };
const mocked = vi.mockObject(obj, { foo: vi.fn() });
// mocked === obj（同一引用）
// obj 现在已被修改，obj.foo 是 mock 函数
// mocked 的类型被标记为 MaybeMockedDeep<typeof obj>，便于 TypeScript 推导
```

### 错误 3：在 vi.doMock 后直接导入（同步 require）

```javascript
// ❌ 错误：在 Node/CommonJS 中使用 require 不遵守 vi.doMock
await vi.doMock("./module", () => ({ fn: vi.fn() }));
const m = require("./module"); // 可能得到真实模块

// ✅ 正确：使用 import 访问动态 mock
await vi.doMock("./module", () => ({ fn: vi.fn() }));
const m = await import("./module"); // 得到 mock（所有环境都支持）
```

**解释**：`vi.doMock()` 的 mock 信息存储在 MockerRegistry 中，只有动态 import 会查询这个注册表。同步 require 不会触发这个查询。

---

## 总结

- **`vi.mock()`** ：编译时提升，模块级缓存，最适合整个测试文件的模块替换
- **`vi.doMock()`** ：运行时注册，模块级缓存，最适合条件性和异步的模块替换
- **`vi.mockObject()`** ：纯函数式，对象级修改，最适合已加载对象的属性 mock

三个 API 工作在不同的系统层（模块 vs 对象），有不同的生命周期和缓存机制，是互补而非竞争的关系。正确理解这些差异，能帮助你在测试中做出更好的设计决策。

---

## 参考资源

- [Vitest 官方文档 - vi.mock](https://cn.vitest.dev/api/vi.html#vi-mock)
- [Vitest 官方文档 - vi.doMock](https://cn.vitest.dev/api/vi.html#vi-domock)
- [Vitest 官方文档 - vi.mockObject](https://cn.vitest.dev/api/vi.html#vi-mockobject-3-2-0)（3.2.0+ 新增）
- [Vitest GitHub - Mocker Package](https://github.com/vitest-dev/vitest/tree/main/packages/mocker)
- Vitest 源码实现：
  - `@vitest/mocker/src/registry.ts` - MockerRegistry 实现
  - `@vitest/mocker/src/automocker.ts` - vi.mockObject 实现
  - `vitest/src/integrations/vi.ts` - vi API 导出
