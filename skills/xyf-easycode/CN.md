---
name: xyf-easycode
description: 按用户目标选择并衔接 EasyCode 的需求设计、网页安装、内容审查、代码开发和缺陷审查技能。
metadata:
  version: "0.0.1"
---

# XYF EasyCode 主技能

本技能负责确定任务归属、检查前提和衔接技能，具体执行由对应技能决定。结合用户要求和已有上下文确定目标项目及范围，只问缺少的关键信息；完成当前范围后交付，已有明确后续任务和授权时继续。

**规则**：确定项目后，开始前及每批写入前重读 `<project>/docs/xyf-easycode/PromptsRules.md`；缺失先读[模板](../xyf-easycode-install/PromptsRules.md)并说明，交 [install](../xyf-easycode-install/SKILL.md) 按授权补齐；读取失败暂停。

安装时，将本目录和下表中的六个技能目录一起放入当前 Agent 支持的技能目录，保持同一父目录，并保留各目录内的全部文件。不要覆盖已有的用户修改。

## 技能路由

按用户要的结果选择技能，只读取选中技能的 `SKILL.md` 及当前所需资源。调用前确认目标技能及必要依赖存在；缺失时报告具体缺项，暂停受影响任务，不得假称已加载或可用。下列链接均相对本文件所在目录。

| 任务 | 技能 |
| --- | --- |
| 沟通需求，生成或更新软件架构文件 | [xyf-easycode-requirements](../xyf-easycode-requirements/SKILL.md) |
| 部署架构网页或补齐 PromptsRules.md | [xyf-easycode-install](../xyf-easycode-install/SKILL.md) |
| 对照架构和代码找差异，给出开发方案 | [xyf-easycode-check](../xyf-easycode-check/SKILL.md) |
| 按架构和确认的方案编码，完成功能 | [xyf-easycode-code](../xyf-easycode-code/SKILL.md) |
| 代码修改后把架构 JSON 同步为实际代码 | [xyf-easycode-sync](../xyf-easycode-sync/SKILL.md) |
| 只读审查指定代码改动引入的新缺陷 | [review-agent](../review-agent/SKILL.md) |

## 工作流程

0. **安装网页**：项目还没有 `docs/xyf-easycode/html/` 或 `PromptsRules.md` 时，先调用 install 按授权补齐。
1. **需求沟通与架构设计**：调用 requirements，沟通需求，确认后生成或更新架构文件。
2. **差异审查与方案**：调用 check，对照架构和代码找出差异，给出开发方案，交用户确认。
3. **代码开发与交付**：调用 code，按架构和方案实现、测试、审查、修复和交付，交付前用 sync 把架构对齐实际代码。review-agent 审查此阶段代码缺陷。
