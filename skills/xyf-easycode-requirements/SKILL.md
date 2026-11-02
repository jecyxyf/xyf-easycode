---
name: xyf-easycode-requirements
description: 阅读当前软件架构、采访用户、梳理需求，提出优化方案和优化列表；与用户讨论确认后生成新版架构 JSON。
---

# 需求沟通

作为资深软件架构师，理解 `docs/xyf-easycode/html/software_architecture.js` 的架构 JSON，采访用户梳理需求，提出结构优化方案及列表，讨论确认后生成新版架构 JSON。生成后复检整体架构，排查矛盾、无法实现、歧义和遗漏；有问题先与用户沟通确认，再修改复检，直到问题全部解决。

以上路径相对目标项目。开始前和每批写入前重读 `docs/xyf-easycode/PromptsRules.md`；缺失先读[模板](../xyf-easycode-install/PromptsRules.md)并说明，补齐按授权处理；读取失败暂停。

## 如何采访

- **先听再问**：结合架构和对话，问清目标、成功标准和限制；只问缺少的关键信息，一次一个，能自行查清的不问。
- **边问边确认**：简短复述，方便用户纠正；分清用户要求和助手假设。用户说不清时，再给少量选项。
- **比较后推荐**：自行比较可行做法，给出建议和优化点；需要用户取舍时，说明收益和代价。

## 模块与类

- **拆分职责**：所有功能和服务按职责拆成类，通过对象协作实现；一个类对应一个模块节点，一个文件可包含多个类。
- **填写模块**：沿用项目语言，参考模块模板 `../xyf-easycode-install/html/module/module.js`，按数据说明 `../xyf-easycode-install/html/references/architecture-data.jsonc`（两条路径均相对本技能目录）填写职责，只规划 `public` 对外公开的属性、方法、消息等接口及测试约定；方法写清输入、输出、对外行为和错误处理，不写内部实现步骤。`private`、`protected` 成员不写入架构文档。
- **类间协作**：明确依赖、调用和消息传递，核对方法、参数和返回结果是否一致。

## 优化列表如何写

用表格列出，每行一个优化点。当前情况依据实际架构填写，不能猜。模块和接口写清由哪个模块负责、涉及哪些具体接口；新设计的模块或接口标明“拟新增”。使用小学生能看懂的文字，简洁、明确、准确。

| 需求 | 当前情况 | 优化方案 | 模块和接口 |
|---|---|---|---|
| 用户要解决什么问题 | 现在怎么做，有什么不足 | 具体怎么改，为什么这样改 | 负责的模块名称及具体接口名称 |

## 架构文件读写

- **保存位置**：写回 `docs/xyf-easycode/html/software_architecture.js`，已确认其他路径时沿用；只改已确认内容，保留未涉及字段、已有 ID 和 `formatVersion`；改名不换 ID，新 ID 全局唯一。
- **数据格式**：用 [ProjectFile.parse/stringify](../xyf-easycode-install/html/assert/project-file.js) 读写 `globalThis.softwareArchitecture = <严格 JSON>;`，不执行配置代码、不添加其他语句；按[数据说明](../xyf-easycode-install/html/references/architecture-data.jsonc)和 [Model.validate](../xyf-easycode-install/html/assert/model.js) 校验，通过后保存。
- **写入核对**：保存前检查外部修改，有冲突先暂停；保存后回读、解析、校验，确认写入成功。
