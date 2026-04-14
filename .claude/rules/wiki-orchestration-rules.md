# Wiki Orchestration Rules

## Knowledge Layers

- Publish Layer: `docs/NNN-xxx.md`
  - 由 `conversation-summary` 生成
  - 仅在用户明确要求“总结成文档”时触发
  - 作为可发布、可审校的知识原子文档
- Wiki Layer: `wiki/`
  - 用于主题聚合、学习路径、导航、维护日志
  - 不直接承载原始对话，保存提炼后的稳定知识

## Trigger Matrix

- `backfill`
  - 触发条件：发现 `docs/NNN-xxx.md` 不满足“已覆盖”定义
  - 目标：补全历史文档到 wiki 的主题映射
- `ingest`
  - 触发条件：新增 `docs/NNN-xxx.md`
  - 目标：将新文档并入已有 topic；无合适 topic 才新建
- `lint`
  - 触发条件：周期性巡检（建议每周一次）或大规模更新前
  - 目标：检查孤儿文档、重复主题、失效链接、来源缺失、内容漂移
- `query-update`
  - 触发条件：问答过程产生可复用的新结论，且 wiki 尚未覆盖
  - 目标：最小增量回写对应 topic/path，并记录来源

## Execution Ownership

- 触发策略和门禁由 `AGENTS.md` 负责
- 具体执行步骤由 `wiki-maintainer` skill 负责
- 生成发布型文档仍由 `conversation-summary` 负责
- `wiki-maintainer` 不得替代 `conversation-summary` 生成 `docs/NNN-xxx.md`

## Writeback Policy

- 所有 wiki 更新必须写入 `wiki/log.md`
- 所有 `backfill`、`ingest`、`query-update` 更新必须同步维护 `wiki/sources/internal-docs-map.md`
- 所有 topic 页面必须包含：
  - 一句话总结
  - 适用场景
  - 核心概念
  - 常见误区
  - 证据状态（已验证 / 待验证 / 冲突中）
  - 最近更新（最近一次写回带来的变化）
  - 关联文档（`docs/NNN-xxx.md`）
  - 来源（官方优先，可补充项目文档与经验说明）
- 优先“合并已有 topic”，避免碎片化新建页面
- `wiki/index.md` 中的每个 topic/path 条目必须包含：链接、一句话摘要、`updated` 日期、来源数量

## Mapping Canonical Model

- `wiki/sources/internal-docs-map.md` 是文档映射的唯一事实来源（canonical map）
- `references/topic-map.md` 是 skill 内参考模板，不作为运行时判定依据
- `internal-docs-map.md` 必须使用结构化 `primary` / `secondary` 小节表达映射关系，不能在链接后用自然语言后缀标记
- “已覆盖”定义：同时满足以下两项
  - 文档存在于 `internal-docs-map.md` 的 primary 或 secondary 映射
  - 文档链接出现在对应 `topics/*.md` 的 `关联文档` 中
- 如果 `internal-docs-map.md` 与 topic 页面不一致，优先修正到一致后再继续内容更新

## Source Priority

- 一级来源：Vitest 官方文档（`cn.vitest.dev` / `vitest.dev`）
- 二级来源：本项目 `docs/NNN-xxx.md`
- 三级来源：明确标记为经验总结的内容
- 无法验证的陈述必须显式标注“待验证”，不得伪装为确定事实

## Query Policy

- 回答问题时优先检索 `wiki/`
- 若 wiki 信息不足，再回溯 `docs/NNN-xxx.md` 与官方文档
- 面向用户输出必须给出来源，不直接粘贴原文，需总结后表达
- 若问答过程产生稳定、可复用且当前 wiki 未覆盖的结论，应优先触发 `query-update` 最小写回，而不是只停留在对话里

## Minimum File Set

- `wiki/index.md`
- `wiki/log.md`
- `wiki/topics/*.md`
- `wiki/paths/*.md`（推荐）
- `wiki/sources/official-docs.md`
- `wiki/sources/internal-docs-map.md`

## Quality Gate

- 本次变更是否写入 `wiki/log.md`
- 新增或更新的 `docs/NNN-xxx.md` 是否已映射到 topic
- `internal-docs-map.md` 与各 topic 页 `关联文档` 是否一致
- `wiki/index.md` 导航是否可达
- `wiki/index.md` 条目是否带摘要、更新时间、来源数量
- 链接是否有效
- 来源是否完整且优先官方
- topic 页面是否包含“证据状态”和“最近更新”
