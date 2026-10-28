---
name: xyf-easycode
description: 根据用户任务和已有上下文选择 EasyCode 子技能。
metadata:
  version: "0.0.1"
---

# XYF EasyCode 主技能

本技能负责技能路由，具体如何执行由对应子技能决定。编程过程中的检查、文档核对和缺陷审查由 xyf-code 内部完成。

## 技能路由

根据用户当前需求和已有上下文选择技能，只有无法确定任务归属时才询问。以下路径均相对于本文件所在目录；读取选中技能的 `SKILL.md` 并按其说明执行。

| 任务 | 子技能 |
| --- | --- |
| 梳理需求，确认目标、范围和设计方案 | [brainstorming](subskills/brainstorming/SKILL.md) |
| 设计、生成或修改框架，部署架构网页 | [xyf-archify](subskills/xyf-archify/SKILL.md) |
| 按已确认的框架实现、修改或修复代码 | [xyf-code](subskills/xyf-code/SKILL.md) |
| 翻译架构网页工具，切换网页语言 | [xyf-web-language](subskills/xyf-web-language/SKILL.md) |
| 只读核对代码是否符合架构、需求或接口 | [xyf-archifycheck](subskills/xyf-archifycheck/SKILL.md) |
| 只读审查指定代码改动引入的新缺陷 | [review-agent](subskills/review-agent/SKILL.md) |
