---
title: Visual Regression Testing
created: 2026-05-29
updated: 2026-05-29
type: topic
tags: ["browser", "snapshot", "advanced"]
sources:
  - https://cn.vitest.dev/guide/browser/visual-regression-testing.html
---

# Visual Regression Testing

## 一句话总结

视觉回归测试在 Browser Mode 下给组件/页面拍"标准照"作为基准截图，之后每次运行重新截图并**逐像素对比**，差异超阈值即失败——它问的是"看起来对吗"，而功能测试问的是"它工作吗"。

### 相关主题

- [[component-testing]]
- [[environment]]
- [[snapshots]]

## 适用场景

- 设计系统 / 组件库：基础组件样式改动后确保外观无意外变化
- 大范围重构 CSS、升级样式框架：肉眼看不过来所有页面时用截图对比兜底
- 改全局样式变量后验证其他页面没被连带破坏
- 跨浏览器 / 跨平台外观一致性核对

## 核心概念

### 与功能测试、文本快照的关系

- **功能测试**（断言、事件）只验证逻辑，样式坏了它照样通过——视觉回归专门补这层。
- 和文本 [[snapshots]] 是同一种心智（留底 → 对比 → 差异需人工确认），区别在于快照比的是**序列化文本**，视觉回归比的是**渲染出来的图像像素**。
- 必须在真实浏览器渲染才有意义，因此属于 **Browser Mode**（见 [[environment]] / [[component-testing]]）。

### `toMatchScreenshot` API

```ts
// 首次运行：生成基准截图，保存到 __screenshots__/ 目录（需提交到版本控制）
// 之后运行：当前截图与基准对比，差异超阈值则失败
await expect(page.getByTestId("hero")).toMatchScreenshot("hero-section");
```

- 基准文件存放在 `__screenshots__` 目录，应纳入 git 管理。
- 文件名包含浏览器与平台标识（如 `button-chromium-darwin.png`），不同环境各自留基准、互不覆盖。

### 稳定截图检测（stable screenshot detection）

Vitest 会反复截图与基准比对，直到画面稳定或超时，借此自动忽略加载动画等临时视觉抖动，降低误报。

### 关键配置

全局配置（`vitest.config.ts`）：

```ts
test: {
  browser: {
    expect: {
      toMatchScreenshot: {
        comparatorName: 'pixelmatch',          // 像素对比算法
        comparatorOptions: {
          allowedMismatchedPixelRatio: 0.01,    // 允许的差异比例，调高可减少误报
        },
      },
    },
  },
}
```

也可以在单次 `toMatchScreenshot(name, options)` 调用时传入选项覆盖全局配置。

### 稳定性最佳实践

- **只截被测元素**而非整页，减少无关干扰。
- **遮盖动态内容**：用 `mask` 选项盖住时间戳、随机数等会变化的部分。
- **禁用动画**：注入 CSS 关掉所有过渡，避免动画造成抖动。
- **固定视口**：显式设置 `viewport(1280, 720)` 等尺寸，否则尺寸差异会误报。
- **统一 CI 环境**：用 Docker 或云服务保证渲染一致，否则不同系统的字体渲染差异极易误报。

## 常见误区

- **以为它能取代功能测试**：截图只看外观，逻辑正确性仍需断言/事件测试覆盖。
- **本地生成基准、CI 直接比对**：本地与 CI 的字体/渲染环境不同，几乎必然误报；基准应在与 CI 一致的环境中生成。
- **让 CI 自动更新基准截图**：等于关掉了这层保护；基准更新应走**手动触发**的工作流。
- **截整页 + 不遮盖动态内容**：时间戳、动画、随机数据会让测试反复无常，失去可信度。
- **和单元测试混在一起跑**：视觉测试更慢、更依赖环境，官方建议与单元测试分离运行。

## 证据状态

- 已验证：`toMatchScreenshot` API 与 `__screenshots__` 基准目录、稳定截图检测机制、`comparatorName: 'pixelmatch'` 与 `allowedMismatchedPixelRatio` 配置、`mask`/禁用动画/固定视口/统一 CI 环境等最佳实践、文件名含浏览器+平台标识、基准更新走手动工作流等，均已对照 Vitest 官方《Visual Regression Testing》页面核对。
- 待验证：无。
- 冲突中：无。

## 最近更新

- 2026-05-29 query-update：新建 visual-regression 主题页，沉淀视觉回归测试概念（可视化外观 + 回归对比）、`toMatchScreenshot` 用法与 `__screenshots__` 基准、稳定截图检测、pixelmatch/`allowedMismatchedPixelRatio` 配置、稳定性最佳实践（mask/禁用动画/固定视口/统一 CI 环境）、跨平台文件名差异，以及与功能测试和文本 [[snapshots]] 的区别。

## 关联文档

- 无（当前 `docs/` 下尚无视觉回归测试专题发布文档）

## 来源

- https://cn.vitest.dev/guide/browser/visual-regression-testing.html（视觉回归测试概念、`toMatchScreenshot`、`__screenshots__`、稳定截图检测、`pixelmatch`/`allowedMismatchedPixelRatio` 配置、`mask`/禁用动画/固定视口/统一 CI 环境最佳实践、跨平台文件名、手动更新基准工作流）
- [[component-testing]]（Browser Mode 组件测试方法论）
- [[snapshots]]（文本快照的留底-对比心智，与图像对比同源）
