# Vitest expect API 之自定义错误消息

## 问题背景

Vitest 的 expect API 与 Jest 有一个重要区别：**支持在 expect 中传入第二个参数作为自定义错误消息**。

> 与 Jest 不同，Vitest 支持将一条消息作为第二个参数传入，如果断言失败，错误信息将等于该消息。
>
> —— [Vitest 官方文档 - expect API](https://cn.vitest.dev/api/expect.html)

## 基本用法

```typescript
import { expect, test } from "vitest";

test("自定义错误消息示例", () => {
  const user = { name: "张三", age: 25 };

  // 断言失败时，会显示自定义消息
  expect(user.age, "用户年龄应该为30岁").toBe(30);
});
```

## 错误信息对比

| 方式                   | 断言失败时的错误信息   |
| ---------------------- | ---------------------- |
| 不传第二个参数（默认） | `expected 25 to be 30` |
| 传入第二个参数         | `用户年龄应该为30岁`   |

## 实际应用场景

### 1. 订单验证场景

当测试业务数据时，自定义消息能更快定位问题：

```typescript
test("验证订单状态", () => {
  const order = getOrder(123);

  expect(order.status, `订单 ${order.id} 状态应该是已支付`).toBe("paid");
  expect(order.amount, `订单 ${order.id} 金额应该大于0`).toBeGreaterThan(0);
});
```

### 2. 循环测试场景

在遍历多个数据时，知道具体哪个数据失败：

```typescript
test("验证所有商品价格", () => {
  const products = [
    { id: 1, price: 100 },
    { id: 2, price: -50 }, // 错误数据
  ];

  products.forEach((product) => {
    expect(
      product.price,
      `商品 ${product.id} 的价格 ${product.price} 必须大于0`,
    ).toBeGreaterThan(0);
  });
});
```

### 3. 复杂对象断言

对象嵌套较深时，指明具体断言意图：

```typescript
test("验证用户配置", () => {
  const config = loadConfig();

  expect(config.database.host, "数据库配置必须包含 host").toBeDefined();

  expect(config.api.timeout, "API 超时时间应该设置为30秒").toBe(30000);
});
```

## 注意事项

1. **可选参数**：第二个参数是可选的，不传时使用默认错误信息
2. **字符串类型**：目前只支持字符串类型的消息
3. **只影响失败时**：只有在断言失败时才会显示自定义消息

## 与 Jest 的对比

```typescript
// Jest - 不支持第二个参数
expect(value).toBe(expected);

// Vitest - 支持第二个参数
expect(value, "自定义错误消息").toBe(expected);
```

这个功能在大型项目或复杂测试中特别有用，能让测试失败时的错误信息更加清晰可读。

---

**参考来源：** [Vitest 官方文档 - expect API](https://cn.vitest.dev/api/expect.html)
