# Vitest Wiki

> 项目级 Vitest 学习知识库。维护规则见 [[SCHEMA]]。

## 学习入口

- [[初学者路径|paths/beginner-path.md]] - 最小可运行学习闭环，先掌握断言、hooks、环境、mock。`updated: 2026-04-14` `sources: 1`
- [[Mock 学习路径|paths/mocking-path.md]] - 从 `vi.fn/vi.spyOn` 到 `vi.mock`、类型辅助和模块时机。`updated: 2026-04-14` `sources: 1`
- [[环境与配置路径|paths/environment-path.md]] - 聚焦执行模型、宿主环境选择和扩展边界。`updated: 2026-04-14` `sources: 1`

## 主题导航

- [[Assertions|topics/assertions.md]] - 断言表达与失败信息设计。`updated: 2026-04-14` `sources: 2`
- [[Execution Model|topics/execution-model.md]] - 顺序/并发执行模型与本地 `expect` 使用边界。`updated: 2026-04-14` `sources: 3`
- [[Hooks|topics/hooks.md]] - setup/cleanup 生命周期与 `aroundEach` 包裹契约。`updated: 2026-04-14` `sources: 4`
- [[Environment|topics/environment.md]] - `node/jsdom/happy-dom` 选择与自定义环境扩展。`updated: 2026-04-14` `sources: 3`
- [[Mocking|topics/mocking.md]] - `vi.fn`、`vi.spyOn`、`vi.mock` 分层使用与清理策略。`updated: 2026-04-14` `sources: 9`
- [[Typing|topics/typing.md]] - `vi.mocked` 类型层语义与 deep/partial 取舍。`updated: 2026-04-14` `sources: 3`
- [[Modules|topics/modules.md]] - 动态导入稳定性与模块副作用时机。`updated: 2026-04-14` `sources: 4`
- [[Snapshots|topics/snapshots.md]] - 快照适用边界与审查流程。`updated: 2026-04-14` `sources: 2`

## 来源

- [官方资料入口](./sources/official-docs.md)
- [项目文档映射](./sources/internal-docs-map.md)

## 最近更新

- 见 [log.md](./log.md)
