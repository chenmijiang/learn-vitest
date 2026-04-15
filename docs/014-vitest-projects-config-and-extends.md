# Vitest `projects` 配置：匹配、继承、`extends` 与 `defineProject`

## 先看结论

- `test.projects` 里的字符串模式可以是 glob，但它匹配的是“项目目录或项目配置文件”，不是测试文件。
- `test.include` 用来匹配“某个项目内部的测试文件”，不负责发现子项目。
- 文档里“项目配置不会继承根配置文件中的选项”指的是：子项目不会自动拿到根配置里的 `test.include`、`clearMocks`、`environment` 这类项目级选项。
- `extends: true` 只在“内联 project 配置”场景下表示继承根配置；单独的项目配置文件通常应通过共享配置 + `mergeConfig(...)` 复用公共配置。
- `defineProject` 比 `defineConfig` 的类型更严格，会把一批 root-only 选项排除掉，更适合写项目配置文件。

## 1. `projects` 的匹配模式是不是 glob

是，但要先分清它匹配的对象。

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
  },
});
```

这里的 `packages/*` 是在匹配项目，而不是在匹配测试文件。项目命中之后，每个项目内部再根据自己的 `test.include` 去找测试文件。

因此：

- `projects` 解决“有哪些项目”
- `include` 解决“某个项目里哪些文件算测试”

把根配置里的 `test.include` 写成 `packages/**` 这样的路径，本质上是在改根项目的测试文件匹配规则，而不是在告诉 Vitest “这些目录都是项目”。

## 2. 如何理解“项目配置不会继承根配置文件中的选项”

这句话最容易被误解成“根配置完全没用”或“根配置会和项目配置自动覆盖”。更准确的理解是：

- 根配置和项目配置默认是两套独立配置源
- 子项目不会自动继承根配置里的项目级选项
- 根配置在启用 `projects` 后，默认也不会被当成其中一个项目

例如：

```ts
// root vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
    include: ["never-match/**/*.test.ts"],
    clearMocks: true,
  },
});
```

```ts
// packages/a/vitest.config.ts
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "a",
    include: ["src/**/*.test.ts"],
    clearMocks: false,
  },
});
```

这里不能理解成 `a` 项目先继承了根配置，再把 `clearMocks` 改成 `false`。更准确的语义是：

- 根配置负责声明要加载哪些项目
- `a` 项目按自己的配置运行
- 根配置里的 `include` 和 `clearMocks` 不会自动注入到 `a` 项目

## 3. 为什么“看起来像是根配置生效了”

一个常见误区是：在根配置里直接写一个内联 project，然后把它的 `include` 指向某个子目录：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "custom",
          include: ["b/**/*.test.ts"],
          clearMocks: true,
        },
      },
    ],
  },
});
```

如果 `b` 目录里还有自己的 `vitest.config.ts`，并且这个配置文件也被 `test.projects` 或其他显式入口加载了，那么这两者不是“同一个项目里的继承与覆盖”，而是两个不同的项目：

- 一个是内联声明的 `custom`
- 一个是 `b` 自己的项目配置

如果这两个项目都命中了同一批测试文件，测试可能会分别按两套配置执行，所以看起来会像“根配置把 `b` 覆盖了”。实际上更接近“你同时定义了两个项目”。

## 4. `extends` 到底什么时候生效

### 4.1 根配置里的内联 project

在根配置里声明内联 project 时，可以写 `extends: true`：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    pool: "threads",
    projects: [
      {
        extends: true,
        test: {
          name: "b",
          include: ["b/**/*.test.ts"],
          clearMocks: false,
        },
      },
    ],
  },
});
```

这里的语义是：

- 先把根配置里的可继承项目级选项作为默认值带进来
- 再应用项目自己的配置
- 同一个受支持选项两边都写时，以项目自己的显式配置为准

因此 `extends: true` 不是“项目配置失效”，而是“先继承，再覆盖”。

如果你不想继承根配置，而是想让某个内联 project 继承另一份可复用配置，`extends` 也可以写成配置文件路径。它的语义仍然是“先继承，再合并项目自己的显式配置”。

如果你不想继承根配置，而是想让某个内联 project 继承另一份可复用配置，`extends` 也可以写成配置文件路径。它的语义仍然是“先继承，再合并项目自己的显式配置”。

### 4.2 单独的项目配置文件

如果项目配置在单独文件里，例如 `packages/a/vitest.config.ts`，更推荐的写法不是在根配置里“远程打开 extends”，而是显式共享公共配置：

```ts
// packages/vitest.shared.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    pool: "threads",
  },
});
```

```ts
// packages/a/vitest.config.ts
import { defineProject, mergeConfig } from "vitest/config";
import shared from "../vitest.shared";

export default mergeConfig(
  shared,
  defineProject({
    test: {
      name: "a",
      include: ["src/**/*.test.ts"],
      clearMocks: false,
    },
  }),
);
```

根配置当然可以显式指定项目配置文件路径：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/a/vitest.config.ts"],
  },
});
```

但这只是告诉 Vitest “去加载这个项目配置文件”，不等于“自动让它继承根配置”。

## 5. `defineProject` 和 `defineConfig` 的类型差异

项目配置并不支持所有根配置选项，所以 Vitest 推荐在项目配置文件里使用 `defineProject`。

可以把差异理解成：

- `defineConfig(...)` 面向根配置
- `defineProject(...)` 面向项目配置

在 Vitest 源码里，`defineProject` 使用的是裁剪后的 `ProjectConfig` 类型，它会排除一批 root-only 选项，例如：

- `coverage`
- `reporters`
- `watch`
- `run`
- `ui`
- `open`
- `outputFile`
- `resolveSnapshotPath`
- `onConsoleLog`
- `onStackTrace`
- `inspect`
- `inspectBrk`

因此下面这种写法更容易在类型层尽早报错：

```ts
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    coverage: {
      enabled: true,
    },
  },
});
```

这些选项更像是“整个 Vitest 进程的运行行为”，而不是“某一个 project 自己决定的行为”，所以不适合作为项目配置项。上面的列表只是常见例子，不是完整清单；完整范围应以 Vitest 当前版本的 `ProjectConfig` 类型定义为准。

## 6. 如何验证“项目配置不继承根配置”

如果你想自己做一个最小实验，可以用 `clearMocks` 这种容易观察的选项。

先准备一组共享函数状态的测试：

```ts
import { expect, test, vi } from "vitest";

const fn = vi.fn();

test("first", () => {
  fn();
  expect(fn).toHaveBeenCalledTimes(1);
});

test("second", () => {
  expect(fn).toHaveBeenCalledTimes(0);
});
```

然后做两组对照：

1. 根配置里的内联 project 设为 `clearMocks: true`
2. `b/vitest.config.ts` 里的项目配置设为 `clearMocks: false`

如果把同一个测试文件分别放到两个独立 project 下执行，观察结果通常会不同：

- 运行内联 project 时，第二个测试会通过
- 运行 `b` 项目时，第二个测试会失败

这说明它们是两个独立项目，而不是“根配置已经自动继承到了 `b` 项目”。

如果要验证“单独项目文件不会自动继承根配置”，可以把根配置里的 `include` 改成一个故意匹配不到的路径，再给项目文件写一个能匹配到测试文件的 `include`。如果项目仍能找到自己的测试文件，就说明项目没有自动继承根 `include`。

## 7. 排查 `projects` 配置问题时的检查顺序

1. 先确认你要解决的是“项目发现”还是“测试文件发现”
2. 如果是发现项目，检查 `test.projects`
3. 如果是项目内部找不到测试，检查该项目自己的 `test.include`
4. 如果用了单独的项目配置文件，不要默认它会继承根配置
5. 如果需要共享公共配置，优先使用共享配置文件 + `mergeConfig(...)`
6. 只有在根配置里写内联 project 时，再考虑 `extends: true`

## 验证状态

- 已验证：本文关于 `projects` 的职责、根配置默认不是项目、项目配置默认不继承根配置、`extends: true` 与 `extends: "<path>"` 的适用范围，以及 `defineProject` 对 root-only 选项的类型裁剪，均依据 Vitest 官方文档和源码类型定义整理。
- 未在本仓库执行：文中的配置片段和验证步骤用于解释语义，没有在当前仓库构造完整 monorepo 用例逐一执行。

## 参考资料

- Vitest 官方文档，Projects（中文）：https://cn.vitest.dev/guide/projects
- Vitest 官方文档，Projects（英文）：https://vitest.dev/guide/projects
- Vitest 官方文档，`include` 配置：https://vitest.dev/config/include
- Vitest 官方文档，Advanced API：`vitest` 项目说明：https://vitest.dev/api/advanced/vitest
- Vitest 源码，`ProjectConfig` / `NonProjectOptions` 类型定义：https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/types/config.ts
- Vitest 源码，`defineConfig` / `defineProject` 导出：https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/public/config.ts
