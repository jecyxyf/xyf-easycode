---
name: xyf-easycode
description: 根据用户任务和已有上下文选择 EasyCode 技能。
metadata:
  version: "0.0.1"
---

# XYF EasyCode 主技能

确定项目后，运行前及每批写入前重读 `<project>/docs/xyf-easycode/PromptsRules.md`；未部署先读[模板](../xyf-easycode-install/PromptsRules.md)并说明缺项，复制交给 install 按授权处理。读取失败则暂停。

本技能负责技能路由，具体如何执行由对应技能决定。编程过程中的检查、文档核对和缺陷审查由 xyf-easycode-code 内部完成。

安装时，将本目录和下表中的六个技能目录一起放入当前 Agent 支持的技能目录，保持同一父目录，并保留各目录内的全部文件。不要覆盖已有的用户修改。调用前确认目标技能及所需资源存在；缺失时报告具体缺项，不得假称已加载或可用。

## 技能路由

根据用户当前需求和已有上下文选择技能，只有无法确定任务归属时才询问。以下路径均相对于本文件所在目录；读取选中技能的 `SKILL.md` 并按其说明执行。

| 任务 | 技能 |
| --- | --- |
| 采访需求，设计初始架构，部署架构网页 | [xyf-archify](../xyf-archify/SKILL.md) |
| 基于现有架构和需求提出改进方案并更新架构 | [xyf-easycode-plan](../xyf-easycode-plan/SKILL.md) |
| 部署网页或补齐 PromptsRules.md，默认在 docs/xyf-easycode/ | [xyf-easycode-install](../xyf-easycode-install/SKILL.md) |
| 按已确认的框架实现、修改或修复代码 | [xyf-easycode-code](../xyf-easycode-code/SKILL.md) |
| 只读核对代码是否符合架构、需求或接口 | [xyf-easycode-check](../xyf-easycode-check/SKILL.md) |
| 只读审查指定代码改动引入的新缺陷 | [review-agent](../review-agent/SKILL.md) |
