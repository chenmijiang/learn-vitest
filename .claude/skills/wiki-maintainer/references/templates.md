# Wiki Templates

## `wiki/index.md`

```md
# Vitest Wiki

## 学习入口

- [初学者路径](./paths/beginner-path.md)

## 主题导航

- [Mocking](./topics/mocking.md)

## 来源

- [官方资料入口](./sources/official-docs.md)
- [项目文档映射](./sources/internal-docs-map.md)

## 最近更新

- 见 [log.md](./log.md)
```

## `wiki/log.md`

```md
# Wiki Log

## YYYY-MM-DD

- `ingest`
  - changed:
    - `wiki/topics/xxx.md`
    - `wiki/sources/internal-docs-map.md`
  - source:
    - `docs/NNN-xxx.md`
  - note:
    - 简述更新意图与边界

- `lint`
  - checks:
    - orphan docs
    - map-topic sync
    - broken links
  - findings:
    - ...
  - follow-up:
    - ...
```

## Topic Page Template

```md
# Topic Name

## 一句话总结

## 适用场景

- ...

## 核心概念

### ...

## 常见误区

- ...

## 关联文档

- [NNN-xxx](../../docs/NNN-xxx.md)

## 来源

- https://cn.vitest.dev/
- [NNN-xxx](../../docs/NNN-xxx.md)
```

## Path Page Template

```md
# Path Name

## 目标

## 建议顺序

1. ...

## 配套主题

- [Topic](../topics/topic.md)

## 对应项目任务

- [TODO.md](../../docs/TODO.md)
```
