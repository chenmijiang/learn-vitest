# Vitest 快速掌握学习计划

目标：基于 Vitest 官网内容，按阶段完成打卡，最终能够在不同实际场景中快速应用。

## 使用方式

- [x] 每完成一个任务点就勾选一次
- [x] 每个阶段至少亲手写 1 次测试，不只看文档
- [x] 每完成一个阶段，回到当前项目尝试落地一个最小案例
- [x] 遇到不理解的 API 时，优先回看对应官网章节和 API 文档

## 阶段 0：建立全局认知

- [x] 阅读首页，先了解 Vitest 的定位与能力范围
      链接：https://cn.vitest.dev/
- [x] 阅读“为什么是 Vitest”，理解它和 Vite 的关系
      链接：https://cn.vitest.dev/guide/why
- [x] 阅读“主要功能”，建立完整能力地图
      链接：https://cn.vitest.dev/guide/features
- [x] 记住当前版本的基础前提：Vitest 4 需要 Vite >= 6、Node >= 20
      链接：https://cn.vitest.dev/guide/
- [x] 用一句话总结：Vitest 适合解决我当前项目里的哪些测试问题

效果：知道 Vitest 不只是单元测试工具，也能覆盖组件测试、浏览器模式、Mock、覆盖率、类型测试等场景。

## 阶段 1：跑通最小闭环

- [x] 阅读快速起步，完成安装、运行、首个测试
      链接：https://cn.vitest.dev/guide/
- [x] 阅读 API 索引中的 `test`、`expect` 基础用法
      链接：https://cn.vitest.dev/api/test
- [x] 确认测试文件命名规则：`.test.` 或 `.spec.`
      链接：https://cn.vitest.dev/guide/
- [x] 分清 `vitest`、`vitest watch`、`vitest run` 的差别
      链接：https://cn.vitest.dev/guide/cli
- [x] 在当前项目里亲手写 3 个最小测试
- [x] 写 1 个纯函数测试
- [x] 写 1 个异步 Promise 测试
- [x] 写 1 个异常抛出测试

效果：能独立在项目里安装、编写、执行最基础的 Vitest 测试。

## 阶段 2：掌握日常开发最常用能力

- [x] 学会使用 `describe` 组织测试
      链接：https://cn.vitest.dev/api/describe
- [x] 学会使用 `beforeEach`、`afterEach` 管理初始化和清理
      链接：https://cn.vitest.dev/api/hooks
- [x] 阅读测试运行生命周期，理解测试是如何执行的
      链接：https://cn.vitest.dev/guide/lifecycle
- [x] 阅读测试筛选，掌握按文件、按名称执行测试
      链接：https://cn.vitest.dev/guide/filtering
- [x] 学会使用 `-t` 只运行指定名称的测试
      链接：https://cn.vitest.dev/guide/cli、https://cn.vitest.dev/config/testnamepattern.html
- [x] 学会使用 `.skip`、`.only`、`.todo`
      链接：https://cn.vitest.dev/guide/filtering
- [x] 学会给测试和 hooks 配置超时
      链接：https://cn.vitest.dev/guide/filtering
- [x] 在当前项目中给一个已有模块补 5 到 10 个测试
- [x] 练习只运行单文件测试
- [x] 练习只运行单个测试名
- [x] 练习在 watch 模式下修改代码并观察增量执行

效果：能把测试融入日常开发循环，快速回归而不是整套重跑。

## 阶段 3：理解环境与配置

- [x] 阅读测试上下文，理解测试环境的概念
      链接：https://cn.vitest.dev/guide/test-context
- [x] 阅读测试环境，理解 `node`、`jsdom`、`happy-dom`、`edge-runtime`
      链接：https://cn.vitest.dev/guide/environment
- [x] 理解默认环境是 `node`
      链接：https://cn.vitest.dev/guide/environment
- [x] 理解什么时候该用 DOM 模拟环境，什么时候不用
- [x] 阅读快速起步中的配置部分，理解 `vite.config.ts` 和 `vitest.config.ts`
      链接：https://cn.vitest.dev/guide/
- [x] 学会在配置文件中写 `test` 选项
      链接：https://cn.vitest.dev/config/
- [x] 学会对单个测试文件指定环境注释 `@vitest-environment`
      链接：https://cn.vitest.dev/guide/environment
- [x] 在当前项目里分别尝试 1 次 `node` 环境和 1 次 DOM 环境测试

效果：遇到不同类型代码时，能先选对测试环境，而不是盲目写测试。

## 阶段 4：掌握 Mock，这是实战关键

- [x] 阅读 Mock 总览，先理解 `vi` 的角色
      链接：https://cn.vitest.dev/guide/mocking
- [x] 学会使用 `vi.fn`
      链接：https://cn.vitest.dev/guide/mocking/functions
- [x] 学会使用 `vi.spyOn`
      链接：https://cn.vitest.dev/guide/mocking/functions
- [x] 学会使用 `vi.mock` 模拟模块
      链接：https://cn.vitest.dev/guide/mocking/modules
- [x] 学会模拟全局对象
      链接：https://cn.vitest.dev/guide/mocking/globals
- [x] 学会模拟日期
      链接：https://cn.vitest.dev/guide/mocking/dates
- [x] 学会模拟时间和定时器
      链接：https://cn.vitest.dev/guide/mocking/timers
- [x] 学会模拟请求
      链接：https://cn.vitest.dev/guide/mocking/requests
- [x] 理解 mock 的清理、重置、恢复
      链接：https://cn.vitest.dev/api/mock
- [x] 在当前项目里写 1 个“依赖外部模块”的 mock 测试
- [x] 写 1 个“校验函数是否被调用、参数是否正确”的测试
- [x] 写 1 个“模拟时间或定时器”的测试

效果：能隔离副作用、外部依赖和不稳定因素，写出稳定的业务测试。

## 阶段 5：组件测试与浏览器模式

- [ ] 阅读快照测试，理解快照的概念和使用方法
      链接：https://cn.vitest.dev/guide/snapshot
- [ ] 阅读浏览器模式总览，先建立真实浏览器测试的概念
      链接：https://cn.vitest.dev/guide/browser/
- [ ] 阅读组件测试，理解“测试行为而不是实现细节”
      链接：https://cn.vitest.dev/guide/browser/component-testing
- [ ] 学会最基础的 `page`、`userEvent`、`expect.element`
      链接：https://cn.vitest.dev/guide/browser/
- [ ] 理解 browser mode 与 `jsdom` / `happy-dom` 的区别
      链接：https://cn.vitest.dev/guide/browser/
- [ ] 阅读 UI 模式，了解交互式查看测试结果的方式
      链接：https://cn.vitest.dev/guide/ui
- [ ] 在当前项目里给一个界面组件补测试
- [ ] 测试一次初始渲染
- [ ] 测试一次输入或点击交互
- [ ] 测试一次成功状态、失败状态或空状态
- [ ] 如果项目使用 React、Vue、Svelte 等框架，对照官网示例跑通对应方案

效果：能开始测试表单、弹窗、交互组件，而不仅是纯函数。

## 阶段 6：覆盖率与质量控制

- [ ] 阅读覆盖率文档，理解 Vitest 的覆盖率能力
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 理解 `v8` 和 `istanbul` 的差别
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 学会启用 `--coverage`
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 学会配置 `coverage.include`
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 学会配置 `coverage.exclude`
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 学会查看 HTML 覆盖率报告
      链接：https://cn.vitest.dev/guide/coverage
- [ ] 在当前项目里生成一次覆盖率报告
- [ ] 找出 3 个未覆盖或覆盖薄弱的模块
- [ ] 补至少 1 个关键模块的缺失测试

效果：能把测试从“有就行”推进到“知道覆盖了什么、缺了什么”。

## 阶段 7：工程化能力

- [x] 阅读测试项目 `projects`，理解多项目配置
      链接：https://cn.vitest.dev/guide/projects
- [x] 理解如何在一个仓库中同时跑 node 测试和 browser 测试
      链接：https://cn.vitest.dev/guide/projects
- [ ] 学会使用 `vitest related --run`
      链接：https://cn.vitest.dev/guide/cli
- [ ] 学会使用 `--shard` 做分片执行
      链接：https://cn.vitest.dev/guide/cli
- [ ] 了解报告器和输出格式
      链接：https://cn.vitest.dev/guide/reporters
- [ ] 了解性能优化思路
      链接：https://cn.vitest.dev/guide/improving-performance
- [ ] 了解性能分析方式
      链接：https://cn.vitest.dev/guide/profiling-test-performance
- [ ] 尝试为当前项目写一个最小 `projects` 配置草案
- [ ] 思考当前项目未来是否需要单元测试、组件测试、浏览器测试并存

效果：能在团队项目、CI、monorepo 或多策略测试场景中使用 Vitest。

## 阶段 8：调试与迁移

- [ ] 阅读调试文档，掌握 VS Code 或浏览器调试方式
      链接：https://cn.vitest.dev/guide/debugging
- [ ] 学会使用 `--inspect` 或 `--inspect-brk`
      链接：https://cn.vitest.dev/guide/debugging
- [ ] 知道为什么调试时常常需要 `--no-file-parallelism`
      链接：https://cn.vitest.dev/guide/debugging
- [ ] 阅读常见错误，提前认识高频问题
      链接：https://cn.vitest.dev/guide/common-errors
- [ ] 阅读迁移指南，理解与 Jest 的主要差异
      链接：https://cn.vitest.dev/guide/migration
- [ ] 理解全局变量、mock、hooks、环境变量等迁移差异
      链接：https://cn.vitest.dev/guide/migration
- [ ] 如果你有 Jest 经验，尝试把 1 个旧测试思路翻译成 Vitest 写法

效果：出问题时能调试和定位，也能在迁移旧项目时少踩坑。

## 按实际场景反推学习优先级

### 场景 1：只想测工具函数或 Node 逻辑

- [ ] 先完成阶段 1
- [ ] 再完成阶段 2
- [ ] 再完成阶段 4
- [ ] 最后补阶段 6

优先链接：

- [ ] https://cn.vitest.dev/guide/
- [ ] https://cn.vitest.dev/guide/filtering
- [ ] https://cn.vitest.dev/guide/mocking
- [ ] https://cn.vitest.dev/guide/coverage

### 场景 2：要做前端组件测试

- [ ] 先完成阶段 1
- [ ] 再完成阶段 3
- [ ] 再完成阶段 5
- [ ] 再完成阶段 4
- [ ] 最后补阶段 6

优先链接：

- [ ] https://cn.vitest.dev/guide/environment
- [ ] https://cn.vitest.dev/guide/browser/
- [ ] https://cn.vitest.dev/guide/browser/component-testing
- [ ] https://cn.vitest.dev/guide/mocking

### 场景 3：要接入 CI 和覆盖率

- [ ] 先完成阶段 1
- [ ] 再完成阶段 2
- [ ] 再完成阶段 6
- [ ] 再完成阶段 7

优先链接：

- [ ] https://cn.vitest.dev/guide/cli
- [ ] https://cn.vitest.dev/guide/coverage
- [ ] https://cn.vitest.dev/guide/projects
- [ ] https://cn.vitest.dev/guide/reporters

### 场景 4：从 Jest 迁移到 Vitest

- [ ] 先完成阶段 1
- [ ] 再完成阶段 4
- [ ] 再完成阶段 8

优先链接：

- [ ] https://cn.vitest.dev/guide/migration
- [ ] https://cn.vitest.dev/guide/mocking

## 最短学习顺序

- [ ] 快速起步
      https://cn.vitest.dev/guide/
- [ ] 命令行
      https://cn.vitest.dev/guide/cli
- [ ] 测试筛选
      https://cn.vitest.dev/guide/filtering
- [ ] 测试环境
      https://cn.vitest.dev/guide/environment
- [ ] Mocking
      https://cn.vitest.dev/guide/mocking
- [ ] 覆盖率
      https://cn.vitest.dev/guide/coverage
- [ ] 浏览器模式
      https://cn.vitest.dev/guide/browser/
- [ ] 组件测试
      https://cn.vitest.dev/guide/browser/component-testing
- [ ] 测试项目
      https://cn.vitest.dev/guide/projects
- [ ] 调试
      https://cn.vitest.dev/guide/debugging
- [ ] 迁移指南
      https://cn.vitest.dev/guide/migration

## 最终能力验收清单

- [ ] 我可以独立给一个纯函数模块补单元测试
- [ ] 我可以独立给一个带依赖调用的模块写 mock 测试
- [ ] 我可以给一个表单或交互组件写渲染与交互测试
- [ ] 我知道什么时候该用 `node`、`jsdom`、`happy-dom`、`browser`
- [ ] 我可以生成覆盖率报告并定位测试薄弱点
- [ ] 我可以按项目或按范围执行测试
- [ ] 我能在测试失败时用调试手段定位问题
- [ ] 我能根据项目场景快速决定 Vitest 的落地方式

## 当前项目落地打卡

- [ ] 运行当前项目已有 Vitest 测试
- [ ] 阅读当前项目里的 `vitest.config.ts`
- [ ] 阅读当前项目里的示例测试文件
- [ ] 为当前项目再补 1 个测试文件
- [ ] 尝试生成一次覆盖率报告
- [ ] 记录当前项目下一步最值得补测试的模块
