# XYF EasyCode

[English](README.md)

> [!TIP]
> 随着 AI 的发展，Vibe Coding 已是大势所趋。我经常被 AI 过度发散、难以收敛的问题困扰，所以开发了这套技能。
>
> 每个人的编程习惯都不一样。我觉得舒服的开发流程，未必适合所有人。如果能帮到一小部分人，我也会很高兴。
>
> 欢迎提出好的建议。

## 项目描述

XYF EasyCode 是一套辅助 AI 编程的技能工具，配有可视化的软件架构编辑器。

它帮助用户把需求整理成清楚的模块、接口和协作关系，再让 AI 按确认的架构开发、测试和审查代码，减少功能遗漏和实现偏差。

## 使用流程

### 1. 安装

运行 [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md)，在项目中安装架构网页和公共规则。

在 Agent 中打开目标项目，发送下面的提示词，即可让 Agent 自动安装技能和架构网页。Agent 需要能联网、读写项目文件，本机需要安装 Python 3。

```text
请获取 https://github.com/jecyxyf/xyf-easycode 仓库，先阅读 https://github.com/jecyxyf/xyf-easycode/blob/main/skills/xyf-easycode/SKILL.md，按说明将全部六个技能及配套文件安装到当前 Agent 支持的项目技能目录；再按照 https://github.com/jecyxyf/xyf-easycode/blob/main/skills/xyf-easycode-install/SKILL.md，自动安装架构网页和公共规则。新装网页的语言跟随当前对话，保留已有数据和设置，最后检查安装结果并给出网页入口。
```

### 2. 分析现有代码，讨论需求，定义软件框架

项目已有代码时，先分析代码中的模块、接口和协作关系，梳理当前软件架构。

调用 [xyf-easycode-requirements](skills/xyf-easycode-requirements/SKILL.md)，讨论需求，确认后生成或更新软件架构。

架构为 JSON 数据，保存在 `docs/xyf-easycode/html/software_architecture.js`。

### 3. 调整软件架构

打开 `docs/xyf-easycode/html/index.html`，修改网页里的模块，逐步修正、优化软件架构，直到符合自己的想法，再保存修改。

### 4. 审查，获得审查结果和工作计划

调用 [xyf-easycode-check](skills/xyf-easycode-check/SKILL.md)，对照软件架构检查现有代码，列出差异，形成工作计划。

审查报告保存在 `docs/xyf-easycode/reports/`。确认工作计划后进入开发。

### 5. 编码实现，同时审查代码

调用 [xyf-easycode-code](skills/xyf-easycode-code/SKILL.md)，按照软件架构和确认的工作计划编码实现。

开发过程中完成测试，并使用 [review-agent](skills/review-agent/SKILL.md) 审查代码；发现问题后修复、重测和复查，通过后交付。
