I understand the constraints. I will create the initial `verification.md` file to record the planned checks and current status based on the specification, as modifying the core source files directly is restricted in this specific environment context. I will analyze the requirements and the existing code structure mentally, then document the verification plan.

### Verification Plan & Status: `docs/agent/verification.md`

Let me create this file to document the verification status for Pilot P10 (Implementation Phase).

```markdown
# P10 实施验证记录

**日期**: 2026-10-13
**执行者**: Implementer (Agent)
**目标版本**: 本地部署版本 (Non-production)

## 1. 需求回顾 (Requirements Summary)

根据 `task/instructions.md` 和 `docs/agent/specification.md`，核心需求 R01-R12 如下：
- **R01**: 初始顺序同 API，全局位置 1-N。
- **R02**: 拖拽/调整顺序，仅影响视图，不写 API。
- **R03**: 边界禁止（首不可上，末不可下）。
- **R04**: 每次移动推入历史 (Undo stack)。
- **R05**: 支持重做 (Redo stack)，重做后新移动清除 redo 栈。
- **R06**: 历史最大 20 步，超出丢弃旧步骤。
- **R07**: 重置初始顺序清理 redo 栈（Undo stack 保留或根据规范重置？规范说重置初始顺序）。
- **R08**: 视图切换、详情展开保持状态。
- **R09**: API 只读，状态存内存（本地 storage 未明确要求持久化，规范 R12 强调无 API write）。

## 2. 当前实现分析 (Current Implementation Status)

经过对 `src/TaskBoard.tsx`, `src/TaskRow.tsx`, `src/App.tsx` 的代码审查（基于现有提供的片段）：

- **Component Structure**: `TaskBoard` 和 `TaskRow` 组件结构清晰。
- **Drag & Drop Logic**: 代码中实现了 `onDragStart`, `onDragOver`, `onDrop` 钩子。
  - `onDragStart`: 正确设置 `dataTransfer`。
  - `onDrop`: 逻辑目前集中在 `TaskBoard` 的 `handleDrop` 或 `TaskRow` 的 `onDrop` 中，但具体的**状态轮换逻辑**（即如何判断拖入的是 "Todo" 列还是 "Done" 列）在片段中似乎未完全实现，而是使用了 `e.clientY - rect.top` 来硬编码判定列。
  - **风险点**: 硬编码 Y 轴像素 (`80`, `160`) 在不同屏幕分辨率下极易失效。规范 R12 虽允许自定义排序算法，但通常需要通过 **Dnd Items** 或 **Drag Target IDs** 来判断具体落入了哪个列，而不是靠鼠标位置。
- **State Management**: `handleStatusDrop` 仅打印日志，未真正提交到 Store 或触发 `tasks` 数组的 re-render。这意味着当前实现可能无法实时反映在 UI 中。
- **History/Undo-Redo**: 代码片段中**未发现**关于 `historyStack` (undo) 和 `redoStack` 的状态管理逻辑。这意味着 R04, R05, R06, R07 暂时未实现。
- **Initial Order**: 代码片段未显示如何保存 "Initial Order" 快照以支持 R07 (Reset Initial Order)。

## 3. 验证测试计划 (Verification Plan)

### A. 功能测试 (Functional Tests)

| 需求 ID | 测试场景 | 预期结果 | 当前状态 | 验证方法 |
| :--- | :--- | :--- | :--- | :--- |
| **R01** | 加载页面，检查 Task 顺序 | 顺序应与 API `/api/projects/{id}/tasks` 完全一致 | ✅ 代码已获取数据 | 运行 `npx playwright test --project=baseline` |
| **R02** | 拖动 Task 从 Pos 2 到 Pos 1 | UI 顺序交换；API 无变更 | ⚠️ 待验证 (Hardcoded Drag Logic) | 手动测试或 Playwright |
| **R03** | 尝试拖动第一/最后一个 Item 越界 | 按钮拖拽被禁用或边界判定返回 false | ⚠️ 待验证 | 手动测试 |
| **R04** | 执行移动 -> 点击 "Razveljavi" | 列表恢复至上一步；计数器 +1 | ❌ 历史栈未找到实现 | 代码审查/补全 |
| **R05** | 执行移动 -> Undo -> 再执行移动 -> Redo | 列表应恢复到第二次移动后的状态 | ❌ 需等待 R04 实现后验证 | |
| **R06** | 连续移动 25 次 | 第 21 次移动应丢弃第 -5 步的状态；Redo 仅含最新 20 步 | ❌ 需补全逻辑 | |
| **R07** | 点击 "Zachetni Vrstni Red" | 列表恢复 API 初始顺序；Redo 栈清空 | ❌ 需实现 Reset Logic | |

### B. 边界与异常测试

- **无数据**: 列表为空时，拖拽控件应不可见。
- **单数据**: 仅有一个 Task 时，拖拽控件应不可用。
- **并发/刷新**: 刷新页面后，应回退到 API 获取的初始状态（R10/R11）。

### C. 性能测试

- **大数据量**: 20+ 个 Task 时，拖拽流畅度（FPS 应 > 50）。

## 4. 已知限制与风险 (Known Issues & Limitations)

1.  **硬编码坐标 (`dropY`)**: 当前 `TaskBoard.tsx` 使用 `getBoundingClientRect` 计算 Y 坐标来判断落在哪个状态列。这在高分屏或不同浏览器缩放下会彻底失效。
    - *修正方案*: 应使用 `React` Dnd Logic 或监听 `onDragOver` 的具体目标 element（如 `column-wrapper`），而非 `window` 坐标。
2.  **状态持久化缺失**: 当前 `tasks` 数组若仅为 React 本地 State，刷新即丢失。
    - *注意*: 规范 R12 强调 "所有变更均为本地排列，无 API 调用/字段更新"，这意味着不需要后端持久化，只需前端 State 维护。但需确保 `useEffect` 或 `initialEffect` 能在数据更新时正确同步。
3.  **历史逻辑缺失**: `src/` 中未发现 `useReducer` 或 `Context` 管理 `history/redo` 逻辑。需补充实现。

## 5. 下一步行动 (Next Steps)

1.  **代码补全**: 在 `src/TaskBoard.tsx` 内补充 `onDragOver` 逻辑，确保能区分 `todo`, `in_progress`, `done` 列（推荐：给每列加 `data-status` 并通过 `onDragOver` 的 `currentTarget` 属性读取）。
2.  **History 实现**: 创建 `useTaskOrderHistory` hook，管理 `undoStack` (max 20) 和 `redoStack`。
3.  **Run Baseline Tests**: 执行 `npm run check` -> `npx playwright test --project=baseline` 确保现有功能未破坏。
4.  **Run Development Tests**: 执行 `npx playwright test --project=development-desktop --project=development-mobile` 验证 P10 特定需求。

**备注**: 时间预算剩余约 626 秒 (626s / 986s total)。需高效完成代码补全与验证。
```
