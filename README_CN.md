# XYF EasyCode

[English](README.md)

## 项目描述

XYF EasyCode 是一套辅助 AI 编程的技能工具，配有可视化的软件架构编辑器。

它帮助用户把需求整理成清楚的模块、接口和协作关系，再让 AI 按确认的架构开发、测试和审查代码，减少功能遗漏和实现偏差。

## 使用流程

### 1. 安装

运行 [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md)，在项目中安装架构网页和公共规则。

安装后打开 `docs/xyf-easycode/html/index.html` 查看架构。

### 2. 需求讨论，获得软件架构

调用 [xyf-easycode-requirements](skills/xyf-easycode-requirements/SKILL.md)，讨论需求，确认后生成或更新软件架构。

架构为 JSON 数据，保存在 `docs/xyf-easycode/html/software_architecture.js`。

### 3. 审查，获得审查结果和工作计划

调用 [xyf-easycode-check](skills/xyf-easycode-check/SKILL.md)，对照软件架构检查现有代码，列出差异，形成工作计划。

审查报告保存在 `docs/xyf-easycode/reports/`。确认工作计划后进入开发。

### 4. 编码实现，同时审查代码

调用 [xyf-easycode-code](skills/xyf-easycode-code/SKILL.md)，按照软件架构和确认的工作计划编码实现。

开发过程中完成测试，并使用 [review-agent](skills/review-agent/SKILL.md) 审查代码；发现问题后修复、重测和复查，通过后交付。
