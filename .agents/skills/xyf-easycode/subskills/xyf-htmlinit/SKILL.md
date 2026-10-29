---
name: xyf-htmlinit
description: 部署项目的软件架构 HTML 开发环境，包括工具复制、网页翻译、空白配置、网页生成和本地服务启动。已部署则跳过。
---

# 33 架构网页环境部署

你做为自身的应用部署工程师需要帮助用户完成软件架构Html工具的部署

目标目录为 `<project>/docs/archify/`，下文简称 `<workspace>`。

**部署前只检查下方目录结构。** 结构符合就报告“已部署，跳过”，立即结束本技能，不再执行后续步骤。

| 步骤 | 执行要求 |
|---|---|
| 1. 检查现有环境 | 只确认下方列出的文件和目录是否存在，不检查子目录内部文件、文件内容或服务状态。结构符合则跳过；有缺失才补齐，保留已有配置和定制。额外文件不影响判断。 |
| 2. 确定语言和环境 | 新网页先询问语言，用户已指定则沿用。要求 Node.js ≥ 22，无需安装 npm 包；安装 Node.js 前须取得明确同意。 |
| 3. 复制并翻译工具 | 将本技能的 `../../tools/` 复制到 `<workspace>/tools/`。调用 [xyf-web-language](../xyf-web-language/SKILL.md)，只翻译此副本中的显示文字和说明，保留英文名称、变量、字段、路径及布局。 |
| 4. 准备配置 | 已有有效 `archify.json` 直接沿用；没有时用 `Model.createProject()` 创建独立 ID 的空白配置，设置项目绝对路径，模块、分层和关系留空。使用 `files.mjs` 写入并回读核对；配置冲突时不得覆盖。 |
| 5. 生成并启动 | 翻译检查通过后生成 `index.html`，将 `tools/html/` 复制到 `<workspace>/html/`，再启动正式服务。端口使用 `10000–65535` 内可用的随机整数，通过持久终端保持运行。 |
| 6. 检查并交付 | 检查配置、网页、实际地址、语言及数据一致性。用表格交付目录、配置路径、访问地址、重启命令和检查结果；未完成的检查如实注明。 |

只需确认以下文件和目录存在：

    docs/archify/
    ├── archify.json
    ├── index.html
    ├── ReadMe.md
    ├── html/
    └── tools/

在 `<workspace>` 内执行：

- 生成：`node tools/html/scripts/build.mjs --runtime index.html`
- 将 `tools/html/` 复制到 `html/` 后启动：`node html/server.mjs`
- 检查配置：`node html/scripts/check.mjs archify.json`
- 检查网页：`node html/scripts/check.mjs index.html`
- 检查服务：`node html/scripts/check.mjs --url "<实际地址>"`

服务必须绑定 `<workspace>/archify.json`，不得从 `tools/html/server.mjs` 启动。

用户只要求生成文件时，省略启动和服务检查。部署完成即结束，不自动设计业务架构或开始编码。
