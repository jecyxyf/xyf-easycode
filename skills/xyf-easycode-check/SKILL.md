---
name: xyf-easycode-check
description: 对照软件架构审查代码及测试内容，输出缺失、不符合项和依据，按授权保存审查报告；不改业务代码或架构，不运行程序或测试。
---

# 内容审查

## 工作内容

读取 `docs/xyf-easycode/html/software_architecture.js` 的架构 JSON，对照源码列缺失、差异及依据。文档相对项目；源码按 `repository.path`、逐行 `codeLocation` 定位，根目录不明先核实；技能链接相对本目录。

审查过程只读，不修改业务代码、架构或状态，不运行程序、测试或构建；仅按授权保存审查报告。[review-agent](../review-agent/SKILL.md) 负责审查改动引入的实际缺陷。

确定项目后先读 `docs/xyf-easycode/PromptsRules.md`；缺失先读[模板](../xyf-easycode-install/PromptsRules.md)并说明，交给 [install](../xyf-easycode-install/SKILL.md) 按授权补齐；读取失败暂停。

## 如何审查

1. **读取依据**：JS 用 [ProjectFile.parse](../xyf-easycode-install/html/assert/project-file.js) 读取，不执行配置代码；JSON 用 `JSON.parse`。按[数据说明](../xyf-easycode-install/html/references/architecture-data.jsonc)和 [Model.validate](../xyf-easycode-install/html/assert/model.js) 校验。架构读失败报未完成，不补设计。`unknowns` 所列问题和 `inputsConfirmed/outputsConfirmed` 为 false 的部分标未核实，不据此判代码错误。
2. **确定范围**：记录架构及源码版本、未提交修改和审查范围。由 [code](../xyf-easycode-code/SKILL.md) 调用时检查本批及受影响部分；单独调用按指定范围，未指定检查全部，不只看改动行。
3. **逐项对照**：按模块及成员 ID 列出检查项，检查以下内容。

| 内容 | 审查要求 |
|---|---|
| 模块和类 | `purpose/requirements` 规定的职责、功能限制、类名、语言、文件位置是否落实 |
| 属性和数据 | 参数核对名称、类型、说明、`required/defaultValue`；`structures[].fields` 核对名称、类型和说明；未写或空默认值不补值 |
| 方法和接口 | `interfaces` 的用途、输入输出是否一致；按 `flow` 的顺序和条件逐步核对，按 `errors` 核对错误处理 |
| 调用和事件 | 按 `requirements/dependencies` 和方法 `flow` 核对调用、数据传递及 `events` 的方向、参数和流程；`relations` 仅辅助定位，不作硬性要求 |
| 测试内容 | `tests.steps/expected` 是否落实为正常、边界和出错用例，步骤、断言和预期是否明确；位置应在 `docs/xyf-easycode/tests/`，既有旧测试保留 |
| 代码注释 | 按 [code 约定](../xyf-easycode-code/SKILL.md#2-写代码和测试)核对高密度注释：每5行代码内至少1行注释，覆盖完整、内容符合实现、语言与架构网页一致；缺失、错误或语言不符列为不符合 |

4. **查找证据**：沿入口、注册、调用和数据传递找到实现，记录文件路径和行号。源码、类或方法未找到时列为缺失；不能只凭名称、注释、图上状态或测试通过判定符合。
5. **查全再结论**：补查遗漏、冲突和受影响部分；疑点查不清列为未核实，需要改架构交给 [requirements](../xyf-easycode-requirements/SKILL.md) 确认。要求、代码、依赖、配置或范围变化后复查相关结论。

## 审查报告如何写

先列项目、架构文件完整路径、架构及源码版本、已查范围和未查部分，再逐项填写：

| 模块 | 接口 | 架构要求 | 实现依据 | 结论 | 问题 |
|---|---|---|---|---|---|
| 名称及 ID | 名称及 ID；无则写模块整体 | 具体规定 | 代码路径及行号 | 符合／不符合／未核实 | 缺失、差异或缺少的依据；无则写无 |

总体结论为“通过”“有差异”或“未完成”。范围查全且没有未解决差异或未核实项才通过；无差异仍说明覆盖和证据，不把静态审查当作运行结果。由 code 调用或单独使用，均交付报告完整路径和结论。

- **保存位置**：保存到 `docs/xyf-easycode/reports/<审查ID>.md`。审查 ID 用本地时间 `yyyy_mm_dd_hh_mm_ss_ms`，24 小时制、毫秒 3 位；重名重新取，不覆盖已有报告。
- **写入授权**：保存前说明目录、文件和范围；沿用有效授权，未授权等用户单独回复“执行”再创建目录和写入报告。仅写本次报告，不改其他文件。
- **保存交付**：保存后回读核对报告内容，交付完整路径、总体结论及未完成项；未保存不得声称已保存。
