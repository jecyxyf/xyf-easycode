---
name: xyf-easycode
description: 按用户目标选择并衔接 EasyCode 的需求设计、网页安装、内容审查、代码开发和缺陷审查技能。
metadata:
  version: "0.0.1"
---

# XYF EasyCode 主技能

本技能负责确定任务归属、检查前提和衔接技能，具体执行由对应技能决定。结合用户要求和已有上下文确定目标项目及范围，只问缺少的关键信息；完成当前范围后交付，已有明确后续任务和授权时继续。

确定项目后，运行前及每批写入前重读 `<project>/docs/xyf-easycode/PromptsRules.md`；未部署先读[模板](../xyf-easycode-install/PromptsRules.md)并说明缺项，复制交给 install 按授权处理。读取失败则暂停。

安装时，将本目录和下表中的五个技能目录一起放入当前 Agent 支持的技能目录，保持同一父目录，并保留各目录内的全部文件。不要覆盖已有的用户修改。

## 技能路由

按用户要的结果选择技能，只读取选中技能的 `SKILL.md` 及当前所需资源。调用前确认目标技能及必要依赖存在；缺失时报告具体缺项，暂停受影响任务，不得假称已加载或可用。下列链接均相对本文件所在目录。

| 任务 | 技能 |
| --- | --- |
| 与用户沟通需求，生成或更新软件架构文件 | [xyf-easycode-requirements](../xyf-easycode-requirements/SKILL.md) |
| 部署架构网页或补齐 PromptsRules.md，默认在 docs/xyf-easycode/ | [xyf-easycode-install](../xyf-easycode-install/SKILL.md) |
| 对照软件架构文件和现有代码，找出差异并给出开发方案 | [xyf-easycode-check](../xyf-easycode-check/SKILL.md) |
| 按软件架构和确认的开发方案编码，完成功能 | [xyf-easycode-code](../xyf-easycode-code/SKILL.md) |
| 只读审查指定代码改动引入的新缺陷 | [review-agent](../review-agent/SKILL.md) |

## 工作流程

1. **需求沟通与架构设计**：调用 requirements，与用户沟通需求，讨论确认后生成或更新软件架构文件。
2. **差异审查与方案**：调用 check，对照软件架构文件和现有代码，找出差异，给出具体开发方案，交用户确认。
3. **代码开发与交付**：调用 code，按软件架构和确认的开发方案实现功能，完成测试、审查、修复和交付。review-agent 用于此阶段的代码缺陷审查。
