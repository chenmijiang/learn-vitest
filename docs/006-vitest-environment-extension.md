# Vitest 环境扩展与自定义指南

本文档介绍如何在 Vitest 中进行环境属性扩展和自定义环境开发，包括预设环境配置、自定义环境实现以及 `populateGlobal` 工具函数的深入解析。

## 概述

Vitest 通过 `environment` 选项支持在特定环境中运行测试代码。你可以使用内置环境（node、jsdom、happy-dom、edge-runtime），也可以通过配置扩展内置环境或创建完全自定义的环境。

## 一、预设环境的属性扩展

### 1.1 通过配置扩展（Config 方式）

使用 `environmentOptions` 在配置文件中传递参数，这是扩展内置环境的推荐方式：

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
        pretendToBeVisual: true,
        resources: "usable",
      },
      happyDOM: {
        width: 1920,
        height: 1080,
        url: "https://example.com",
      },
    },
  },
});
```

**配置说明：**

- 选项按环境隔离，`jsdom` 配置放在 `jsdom` 键下，`happyDOM` 配置放在 `happyDOM` 键下
- Vitest 会将这些配置传递给对应环境的 `setup` 方法
- 默认只支持 `jsdom` 和 `happyDOM` 的配置项

### 1.2 运行时扩展（Setup 方式）

在环境对象的 `setup` 方法中直接操作 `global` 对象进行运行时扩展：

```typescript
import type { Environment } from "vitest/runtime";

export default <Environment>{
  name: "custom-jsdom",
  viteEnvironment: "client",

  async setup(global, options) {
    // 方式1：直接赋值全局属性
    global.MY_GLOBAL_CONFIG = { apiUrl: "https://api.example.com" };

    // 方式2：从 environmentOptions 读取配置
    const { custom = {} } = options;

    // 方式3：使用 populateGlobal 批量注入（详见下文）
    const { populateGlobal } = await import("vitest/runtime");
    const { keys, originals } = populateGlobal(global, mockWindow, {
      bindFunctions: true,
    });

    return {
      teardown(global) {
        // 清理：恢复原始值
        keys.forEach((key) => delete global[key]);
        originals.forEach((value, key) => {
          global[key] = value;
        });
      },
    };
  },
};
```

**注意：** `teardown` 函数签名应为 `teardown(global)`，与官方类型定义保持一致。

**来源：** [Vitest 源码 - environment.ts#L4](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/types/environment.ts)

**两种方式的对比：**

| 特性     | Config 方式                    | Setup 方式           |
| -------- | ------------------------------ | -------------------- |
| 适用场景 | 静态配置（URL、视口等）        | 动态逻辑、复杂初始化 |
| 类型安全 | 需扩展 EnvironmentOptions 类型 | 需扩展 global 类型   |
| 执行时机 | Vitest 启动时                  | 每个测试文件执行前   |
| 代码位置 | vitest.config.ts               | 独立环境文件         |

## 二、自定义环境的类型扩展

### 2.1 扩展 environmentOptions 类型

为了让 TypeScript 识别自定义配置项，需要创建类型声明文件：

```typescript
// vitest.d.ts
import "vitest";

declare module "vitest" {
  interface EnvironmentOptions {
    // 扩展自定义环境的配置选项
    myCustomEnv?: {
      featureFlag?: boolean;
      apiEndpoint?: string;
      timeout?: number;
    };
  }
}
```

### 2.2 扩展 global 类型

如果向 global 注入自定义属性，需要声明全局类型：

```typescript
// global.d.ts
export {};

declare global {
  var MY_GLOBAL_CONFIG: {
    apiUrl: string;
    version: string;
  };

  var customAPI: {
    fetchData: () => Promise<any>;
    processData: (data: any) => any;
  };
}

export {};
```

**重要提示：**

- 类型扩展是可选的，仅用于提供 TypeScript 类型提示
- Vitest 运行时不做类型检查，直接传递 `Record<string, any>`
- 确保在 `tsconfig.json` 中包含这些声明文件

## 三、populateGlobal 函数详解

### 3.1 为什么需要 populateGlobal？

直接操作 `global` 对象虽然可行，但存在以下问题：

1. **this 绑定问题**：浏览器 API（如 `fetch`、`addEventListener`）需要正确的 `this` 指向 window
   - 错误示例：`global.fetch = window.fetch; global.fetch(url)` 会抛出 `TypeError: Illegal invocation`
2. **值恢复困难**：测试结束后需要手动清理和恢复原始值
   - 如果不恢复，一个测试的修改可能影响后续测试，造成测试污染
3. **属性代理复杂**：需要支持 getter/setter 以实现属性变更监听
   - 手动实现需要编写大量 boilerplate 代码

`populateGlobal` 解决了这些问题。

### 3.2 函数签名与返回值

```typescript
interface PopulateOptions {
  bindFunctions?: boolean; // 是否自动绑定函数 this
  additionalKeys?: string[]; // ⚠️ 内部实现细节，一般不直接使用
}

interface PopulateResult {
  keys: Set<string>; // 所有被复制的属性名
  skipKeys: string[]; // 被跳过的属性名
  originals: Map<string | symbol, any>; // 原始值备份
}

export function populateGlobal(
  global: any,
  win: any,
  options?: PopulateOptions,
): PopulateResult;
```

**来源：** [Vitest 源码 - utils.ts](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/integrations/env/utils.ts)

### 3.3 核心功能

#### ① 智能属性代理

使用 `Object.defineProperty` 创建 getter/setter，而非简单赋值：

```typescript
Object.defineProperty(global, key, {
  get() {
    return boundFunction || win[key];
  },
  set(v) {
    // 支持后续覆盖
    overrideObject.set(key, v);
  },
  configurable: true,
});
```

**优势：**

- 属性变更可以被追踪
- 支持属性被重新赋值
- 修改会同步到代理目标

#### ② 自动函数绑定

当 `bindFunctions: true` 时，自动将函数绑定到正确的 `this`：

**来源：** [Vitest 源码 - utils.ts#L54-58](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/integrations/env/utils.ts)

```typescript
const boundFunction =
  bindFunctions &&
  typeof win[key] === "function" &&
  !isClassLikeName(key) &&
  win[key].bind(win);
```

**示例：**

```typescript
// 不使用 bindFunctions 时可能报错
global.fetch = window.fetch;
global.fetch("https://api.example.com"); // TypeError: Illegal invocation

// 使用 populateGlobal 自动绑定后
global.fetch("https://api.example.com"); // ✅ 正常工作
```

#### ③ 原始值备份与恢复

自动保存可能被覆盖的原始值，便于测试后清理：

```typescript
// 保存原始值
if (overriddenKeys.has(key) && key in global) {
  originals.set(key, global[key]);
}

// teardown 时恢复
originals.forEach((value, key) => {
  global[key] = value;
});
```

### 3.4 完整使用示例

```typescript
import { populateGlobal } from "vitest/runtime";
import type { Environment } from "vitest/runtime";

export default <Environment>{
  name: "jsdom-with-mocks",
  viteEnvironment: "client",

  async setup(global, options) {
    const { JSDOM } = await import("jsdom");

    // 创建 JSDOM 实例
    const dom = new JSDOM("<!DOCTYPE html>", {
      url: options.jsdom?.url || "http://localhost:3000",
    });

    // 使用 populateGlobal 批量注入 DOM API
    const { keys, originals } = populateGlobal(global, dom.window, {
      bindFunctions: true,
      // ⚠️ additionalKeys 是内部实现细节，一般不直接使用
      additionalKeys: ["Request", "Response", "fetch", "Headers"],
    });

    // 注入自定义全局属性
    global.testConfig = options.myCustomEnv || {};

    return {
      teardown(global) {
        // 1. 删除注入的属性
        keys.forEach((key) => {
          delete global[key];
        });

        // 2. 恢复原始值
        originals.forEach((value, key) => {
          global[key] = value;
        });

        // 3. 清理自定义属性
        delete global.testConfig;

        // 4. 清理 JSDOM
        dom.window.close();
      },
    };
  },
};
```

### 3.5 对比：使用 vs 不使用 populateGlobal

**❌ 不使用 populateGlobal（手动方式）：**

```typescript
setup(global) {
  // 问题1：需要逐个处理属性
  global.fetch = window.fetch.bind(window)
  global.document = window.document
  // ... 还有其他几十个属性

  // 问题2：没有自动备份，可能导致测试污染
  return {
    teardown(global) {
      delete global.fetch
      delete global.document
      // 容易遗漏，且无法恢复原始值
    }
  }
}
```

**✅ 使用 populateGlobal：**

```typescript
setup(global) {
  // 一行代码批量处理
  const { keys, originals } = populateGlobal(global, window, {
    bindFunctions: true
  })

  return {
    teardown(global) {
      // 自动清理和恢复
      keys.forEach(key => delete global[key])
      originals.forEach((v, k) => global[k] = v)
    }
  }
}
```

## 四、完整自定义环境示例

### 4.1 创建自定义环境包

命名规范：`vitest-environment-${name}` 或指定文件路径

**文件结构：**

```
my-project/
├── vitest.config.ts
├── environments/
│   └── custom-env.ts
└── package.json
```

**environments/custom-env.ts：**

```typescript
import type { Environment } from "vitest/runtime";
import { populateGlobal } from "vitest/runtime";

export default <Environment>{
  name: "custom",
  viteEnvironment: "ssr",

  // 可选：仅在使用 vmForks/vmThreads 线程池时需要
  async setupVM() {
    const vm = await import("node:vm");
    const context = vm.createContext();
    return {
      getVmContext() {
        return context;
      },
      teardown() {
        // VM 级别的清理
      },
    };
  },

  async setup(global, options) {
    console.log("Setting up custom environment...");

    // 从 options 获取配置
    const { custom = {} } = options;

    // 注入全局 API
    global.customFetch = async (url: string) => {
      // 自定义 fetch 逻辑
      return fetch(url);
    };

    return {
      teardown(global) {
        console.log("Tearing down custom environment...");
        delete global.customFetch;
      },
    };
  },
};
```

**vitest.config.ts：**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "./environments/custom-env.ts",
    environmentOptions: {
      custom: {
        apiUrl: "https://api.example.com",
        timeout: 5000,
      },
    },
  },
});
```

### 4.2 使用注释指定环境

对于特定测试文件，可以使用控制注释指定环境：

```typescript
// @vitest-environment jsdom

import { expect, test } from "vitest";

test("test with jsdom", () => {
  expect(typeof window).not.toBe("undefined");
});
```

## 五、最佳实践

### 5.1 选择合适的扩展方式

- **简单配置**（URL、视口尺寸）：使用 `environmentOptions`
- **复杂逻辑**（自定义 API、数据处理）：使用自定义环境
- **全局工具函数**：在 `setupFiles` 中配置
- **DOM 模拟**：使用 `jsdom` 或 `happy-dom` + `populateGlobal`

### 5.2 类型安全

1. 总是为自定义配置添加类型声明
2. 使用 `declare global` 扩展全局类型
3. 确保 `tsconfig.json` 包含类型声明文件

### 5.3 资源清理

1. 始终在 `teardown` 中清理注入的属性
2. 使用 `populateGlobal` 返回的 `originals` 恢复原始值
3. 关闭 JSDOM 等需要显式清理的资源（`dom.window.close()`）

### 5.4 性能优化

- 避免在 `setup` 中执行耗时操作
- 使用 `setupVM` 时要注意内存占用
- 考虑使用 `pool: 'forks'` 隔离不同环境的测试

## 参考

- [Vitest 官方文档 - 测试环境](https://cn.vitest.dev/guide/environment)
- [Vitest 官方文档 - environmentOptions](https://cn.vitest.dev/config/environmentoptions.html)
- [Vitest 源码 - populateGlobal 实现](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/integrations/env/utils.ts)
- [Vitest 源码 - Environment 类型定义](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/types/environment.ts)
- [Vitest 源码 - JSDOM 环境实现](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/integrations/env/jsdom.ts)
