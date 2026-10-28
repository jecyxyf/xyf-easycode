# XYF EasyCode

[English](README.md)

**优化 VibeCoding 的用户交互，让代码结果与用户需求一致。**

XYF EasyCode 将软件框架和接口变成可以查看、修改的图，再用确认后的架构约束 AI 编码。用户先看清模块、依赖、方法的输入输出、事件和预期行为，再让 Agent 开发、测试和检查。

这是一套可安装的 Agent 技能，内置架构编辑网页，适用于 Codex、Claude Code、OpenCode，以及能够读取 `SKILL.md` 的其他 Agent。它通过文档核对、测试和代码审查，让实现紧扣确认后的设计。

## 告诉 Agent 安装

在要开发的项目中发送：

> 从 https://github.com/jecyxyf/xyf-easycode 安装 xyf-easycode 技能到本项目。先阅读仓库的 INSTALL.md，再按你使用的 Agent 完成安装。

Agent 会下载仓库、运行安装脚本，并核对结果。安装包含全部子技能、模板和编辑工具，不修改业务代码，也不启动服务。完整流程见 [INSTALL.md](INSTALL.md)。从 GitHub 安装时，所用分支或版本中必须已经包含这些文件。

## 从本地仓库安装

### 必需依赖：Node.js 22+

**安装脚本和本地架构编辑器都需要 Node.js 22 或更高版本。** 用 `node --version` 检查。无需安装 npm 包，也不用运行 `npm install`。下载源码仓库时使用 Git。

| 检测结果 | 安装流程 |
| --- | --- |
| 已有 Node.js 22+ | 继续安装技能 |
| 未安装或版本太低 | 说明原因，询问是否安装受支持的 Node.js 版本 |
| 用户明确同意 | 按操作系统安装 Node.js，检查版本成功后继续安装技能 |
| 用户拒绝或未回复 | 停止，不安装 Node.js，也不宣称技能已安装 |

这个确认由执行安装的 Agent 在运行安装脚本前发起。安装 Node.js 时可能还需要操作系统的正常安装权限。也可以自行前往 [Node.js 官方下载页面](https://nodejs.org/en/download)安装，然后重试。

已有 Node.js 后运行：

```sh
git clone https://github.com/jecyxyf/xyf-easycode.git
cd xyf-easycode
node scripts/install.mjs --agent codex --project /你的项目路径
```

将 `codex` 替换为 `claude-code` 或 `opencode` 即可安装给对应 Agent。使用 `--global` 替代 `--project`，供多个项目使用。其他 Agent 可用 `--skills-dir /技能目录` 指定其支持的位置。

| Agent | 项目内安装 | 全局安装 |
| --- | --- | --- |
| Codex | `.agents/skills/xyf-easycode/` | `~/.agents/skills/xyf-easycode/` |
| Claude Code | `.claude/skills/xyf-easycode/` | `~/.claude/skills/xyf-easycode/` |
| OpenCode | `.opencode/skills/xyf-easycode/` | `$XDG_CONFIG_HOME/opencode/skills/xyf-easycode/`，未设置时使用 `~/.config/opencode/skills/xyf-easycode/` |

相同内容重复安装不会修改文件。用 `--update` 更新本脚本管理的副本；如果用户改过其中的文件，脚本会停止并保留修改。已有不同内容且不属于本安装器管理的技能，也不会被覆盖。安装后未显示时，可重新加载技能或新开会话。

## 使用方法

> 使用 xyf-easycode 梳理需求，展示软件框架和接口，再按确认后的设计完成开发。

| 阶段 | 内容 |
| --- | --- |
| 确认需求 | 明确目标、范围、限制和预期行为 |
| 展示架构 | 维护项目架构，启动可编辑的本地网页 |
| 按约定开发 | 按依赖顺序实现，验证接口和实际行为 |
| 核对文档 | 检查代码是否符合架构，提供文件位置和证据 |
| 审查改动 | 查找新缺陷，修复已授权的问题，如实报告验证结果 |

也可以只要求其中一步。已确认且仍有效的结论直接沿用。Agent 不应自行简化设计，也不能通过修改架构掩盖代码偏差。

## 架构编辑器

编辑器使用 Node.js 在本机运行，由 Agent 在处理架构任务时部署到目标项目。JSON 是用户和 Agent 共用的实现依据。

- 默认配置位置为 `docs/archify/archify.json`。已有或用户指定的架构目录继续沿用。
- 部署后的 `ReadMe.md` 记录实际访问地址、五位数随机端口和重启命令。
- 保存或 Ctrl+S 写回同一个 JSON；另存为下载副本；HTML 快照用于分享，不代表配置已保存。
- 检测外部修改，发生冲突时保留未保存内容并提示。
- 新建架构网页时，技能第一个问题先问网页使用什么语言，再由内置 `xyf-web-language` 翻译 `tools/` 后部署。可指定任意自然语言，英文名称保留英文，新架构的说明跟随所选语言；已有项目数据仅在用户要求时翻译。
- 可选中译英按钮将所选名称发送给 MyMemory；正常编辑、保存不依赖该服务。

部署说明见[编辑器文档](.agents/skills/xyf-easycode/tools/README.md)。

## 开发与验证

```sh
npm run check
npm test
npm run build
```

检查技能文件、内部链接、配置格式和 JavaScript 语法。安装器测试位于 `scripts/tests/installer.test.mjs`；编辑器测试位于 `.agents/skills/xyf-easycode/tests/editor.test.mjs`，随技能分发。测试覆盖实际安装、更新保护，以及网页服务的部署、加载、保存和冲突处理。`npm test` 的运行目录为 `docs/archify/test/`，临时文件位于其中的 `.runtime/`，不进入 Git。实际浏览器检查与接口测试分别报告。
