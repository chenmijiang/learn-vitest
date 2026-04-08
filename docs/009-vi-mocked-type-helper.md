# vi.mocked：TypeScript 类型助手

## 是什么？

`vi.mocked` 是 Vitest 提供的一个 **TypeScript 类型助手（type helper）**。

**关键特性：**

- **纯类型工具**：它不改变代码的运行时行为，只影响 TypeScript 的类型推断
- **类型转换**：告诉 TypeScript 编译器"这个对象现在是 mock 函数了"
- **增强提示**：让 mock 函数获得完整的类型支持和 IDE 智能提示

## 有什么用？

当你使用 `vi.mock()` 模拟一个模块后，模块中的函数会被替换成 mock 函数。但 TypeScript **并不知道** 这一点，它仍然按照原始类型来推断。

这时候就会出现问题：

- 你尝试调用 `mockReturnValue()` 等 mock 方法
- TypeScript 报错："类型上不存在此属性"
- 你失去了类型安全，容易写出错误代码

`vi.mocked` 就是解决这个问题的：**显式声明类型转换，获得完整的类型支持**。

## 基础使用示例

### 问题场景

```typescript
import * as example from "./example";

vi.mock("./example");

test("mock return value", () => {
  // ❌ TypeScript 报错！
  // 编译器不知道 add 现在是 mock 函数
  example.add.mockReturnValue(10); // Property 'mockReturnValue' does not exist
});
```

### 使用 vi.mocked 解决

```typescript
import * as example from "./example";

vi.mock("./example");

test("mock return value", () => {
  // ✅ 使用 vi.mocked 包装后，获得完整类型支持
  vi.mocked(example.add).mockReturnValue(10);
  expect(example.add(1, 1)).toBe(10);
});
```

**对比说明：**

| 方式          | 类型支持 | 代码提示 | 类型安全  |
| ------------- | -------- | -------- | --------- |
| 直接调用      | ❌ 报错  | ❌ 无    | ❌ 不安全 |
| `vi.mocked()` | ✅ 正确  | ✅ 完整  | ✅ 安全   |

## 高级用法

### 1. 深度 Mock（deep: true）

当你需要模拟返回包含嵌套对象的数据时：

```typescript
// 嵌套返回值的 mock
vi.mocked(example.getUser, { deep: true }).mockReturnValue({
  name: "John",
  address: {
    city: "Los Angeles",
    zipCode: "90001",
  },
});
```

**作用**：即使返回值是嵌套对象，也会被当作 mock 处理，可以链式调用 mock 方法。

### 2. 部分 Mock（partial: true）

当你不需要提供完整的返回类型时：

```typescript
// 只提供部分属性，不需要完整的 Response 类型
vi.mocked(example.fetchSomething, { partial: true }).mockResolvedValue({
  ok: false,
  status: 404,
  // 不需要提供 Response 类型的所有属性
});
```

**作用**：简化测试代码，避免构造完整的大型对象。

## 常用选项总结

| 选项      | 类型      | 说明                    | 使用场景                 |
| --------- | --------- | ----------------------- | ------------------------ |
| `deep`    | `boolean` | 深度转换嵌套对象为 mock | 返回复杂嵌套结构的场景   |
| `partial` | `boolean` | 允许部分属性匹配        | 不需要完整返回类型的场景 |

## 注意事项

1. **只在 TypeScript 中需要**：纯 JavaScript 项目不需要使用 `vi.mocked`
2. **运行时无影响**：它不会添加或改变任何实际功能，只提供类型支持
3. **配合 `vi.mock()` 使用**：通常在使用 `vi.mock()` 后需要时添加

## 参考来源

- [Vitest 官方文档 - vi.mocked](https://cn.vitest.dev/api/vi.html#vi-mocked)（2024 年 12 月）
