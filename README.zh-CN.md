# XYF EasyCode

[English](README.md)

**优化 VibeCoding 的用户交互，让代码结果与用户需求一致。**

XYF EasyCode 将软件框架和接口变成可以查看、修改的图，再用确认后的架构约束 AI 编码。用户先看清模块、依赖、方法的输入输出、事件和预期行为，再让 Agent 开发、测试和检查。

仓库包含六个 Agent 技能和独立架构网页，技能平级存放在 `skills/` 下。能否完整使用，取决于 Agent 的技能发现、文件读写、工具和代理能力；能读取 `SKILL.md` 不代表支持全部流程。

## 安装

在目标项目中告诉 Agent：

> 从 https://github.com/jecyxyf/xyf-easycode 安装 EasyCode 技能到本项目。按仓库 README 中的说明完成安装。

手动安装时，下载所需版本的仓库，将 **`skills/` 内的六个目录全部复制**到目标 Agent 的技能目录。保持目录名和平级关系，完整保留所有文件，包括 `xyf-easycode-install/html/`。

| Agent | 项目内技能目录 |
| --- | --- |
| Codex | `.agents/skills/` |
| Claude Code | `.claude/skills/` |
| OpenCode | `.opencode/skills/` |
| 其他 Agent | 使用该 Agent 文档规定的位置。 |

仓库的 `skills/` 是源码目录，安装位置由 Agent 和版本决定。更新时保留已有的本地修改；安装后未显示时，重新加载技能或新开会话。安装和网页使用都无需 Node.js、npm 包、构建命令或本地服务器。

## 使用方法

> 使用 xyf-easycode 梳理需求，展示软件框架和接口，再按确认后的设计完成开发。

| 阶段 | 内容 |
| --- | --- |
| 确认需求 | 明确目标、范围、限制和预期行为 |
| 展示架构 | 维护项目架构，打开可编辑的本地网页 |
| 按约定开发 | 按依赖顺序实现，验证约定的行为 |
| 核对文档 | 检查代码是否符合架构，提供文件位置和证据 |
| 审查改动 | 查找新缺陷，修复已授权的问题，如实报告验证结果 |

也可以只要求其中一步。已确认且仍有效的结论直接沿用。Agent 不应自行简化设计，也不能通过修改架构掩盖代码偏差。需要独立代理的流程必须有相应能力；无法执行的阶段应如实说明，不能宣称完成。

## 架构编辑器

双击 [index.html](skills/xyf-easycode-install/html/index.html) 即可使用内置网页。部署到项目时，使用 [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md) 将 `skills/xyf-easycode-install/html/` 的**全部内容**复制到 `docs/xyf-easycode/html/`。已有部署只补缺失文件，保留项目数据、语言设置和网页定制。部署后打开 `docs/xyf-easycode/html/index.html`，默认中文。

| 文件或目录 | 作用 |
| --- | --- |
| `index.html` | 网页入口，自动加载语言和架构文件 |
| `software_architecture.js` | 项目数据，格式为 `globalThis.softwareArchitecture = <合法 JSON>;` |
| `language.js` | 当前界面语言，默认中文 |
| `language_zh.js` / `language_eng.js` | 中文、英文语言配置 |
| `assert/` | 网页组件和样式 |
| `module/` | 画布、模块和分层模板 |

用 `language_eng.js` 覆盖 `language.js`，刷新后显示英文。增加其他语言时，只翻译配置中的文字，保留消息键和占位符。已有架构数据仅在用户要求时翻译。

浏览器支持且获准读写本地文件时，保存或 Ctrl+S 会写回选定的数据文件；否则下载 JS 副本，替换 `software_architecture.js` 后刷新。保存时检查外部修改，发生冲突时保留未保存内容。HTML 快照用于分享当前页面，不代表原配置已保存。可选名称翻译按钮需要访问在线服务，普通编辑和保存支持离线使用。

详细说明见[编辑器文档](skills/xyf-easycode-install/html/README.md)。

## 仓库目录

```text
skills/
├── xyf-easycode/          总入口
├── xyf-easycode-install/  html/ 及网页部署到 docs/xyf-easycode/html/
├── xyf-archify/           架构设计
├── xyf-archifycheck/      架构与代码核对
├── xyf-code/             编码流程
└── review-agent/         代码审查
AGENTS.md                 仓库协作规则
README.md                 英文说明
README.zh-CN.md           中文说明
```

修改技能后检查名称、内部链接和共用文件。修改网页后直接用浏览器打开，验证受影响的功能。如实报告已执行的检查，以及尚未验证的能力。
