---
name: xyf-easycode-install
description: 部署或补齐 EasyCode 网页及公共提示规则，保留已有数据、语言和定制；支持只部署规则，不安装 Agent 技能或设计架构。
---

# EasyCode 网页与公共规则部署

确定项目后，运行前及每批写入前重读 `<project>/docs/xyf-easycode/PromptsRules.md`；未部署先读[模板](PromptsRules.md)并说明缺项，复制交给 install 按授权处理。读取失败则暂停。

用 [Python 3 标准库脚本](scripts/install.py) 一次检查、补齐和核对，不逐个阅读或复制网页源码。网页来源为本技能 `html/`，规则来源为 [PromptsRules.md](PromptsRules.md)，复制到 `<project>/docs/xyf-easycode/PromptsRules.md`。目标盘须支持硬链接。

```bash
python3 "<skill>/scripts/install.py" --project "<project>" --language zh
```

`<skill>` 为本技能绝对路径，`<project>` 为确认的目标项目。仅部署规则时用 `--rules-only`，不传语言参数：

```bash
python3 "<skill>/scripts/install.py" --project "<project>" --rules-only
```

仅规则模式只执行规则检查、复制和核对。

1. 沿用已确认语言，中文用 `zh`、英文用 `en`。未知可不传语言；需新建语言文件时再确认。
2. 网页按来源清单查全部文件和目录类型，不读内容；规则校验 UTF-8 和非空。网页齐全仍检查并补齐规则，两者齐全返回 `skipped`；额外文件不影响。
3. 新目录完整复制，已有目录及规则只补缺失文件，保留数据、语言、定制及额外文件。先查全部类型冲突，冲突不写入。每个文件先写临时副本并核对，再安全放入目标。不删除覆盖，替换须另获对应范围明确授权。
4. 脚本核对语言键无缺失、重复、多余，译文非空，占位符、格式及元数据正确；已有错误或语言冲突则报告并保留。
5. 其他语言由多子代理按互斥消息键并行翻译，只返回译文；主代理统一用词，确认无漏译且 `locale`、`name` 正确，再传 `--language-file "<译文文件>"`。
6. 脚本核对来源清单、复制内容和入口资源，输出路径、数量、检查结果及耗时，单独报告规则的复制或保留结果。错误须处理复查；已有差异不代表可覆盖。

```text
docs/xyf-easycode/html/
├── index.html
├── software_architecture.js
├── language.js
├── assert/
│   ├── language_zh.js
│   └── language_eng.js
├── module/
└── references/
    └── architecture-data.jsonc
```

交付规则路径及检查结果；部署网页时同时给出入口完整路径。网页跳过仅查清单和类型，规则仍校验；有浏览器能力可验加载，未打开须说明。入口可双击，无需 Node.js、构建或服务器。初始数据为空模板，不代表项目需求，不自动迁移旧配置。保存见[网页说明](html/README.md)。完成即结束，不自动设计或编码。
