# P04 实现规范：双键稳定排序

## 问题与上下文

P04 旨在为任务管理应用 Folio 实现稳定的双键排序功能，满足 R01-R12 规范需求。

初始情况下，项目内的任务列表按传入顺序展示。新需求要求用户能指定：
- 主键（original, title, assignee, status, dueDate）及升/降序
- 次键（none, title, assignee, status, dueDate）及升/降序

排序逻辑必须保持稳定性，不修改原始数据，仅通过 UI 渲染态展示排序结果。这涉及前端排序算法实现和状态管理调整。

## 输入、操作与输出

### 数据字段
```typescript
interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}
```

**排序字段：**
- `original`：任务 ID (id)
- `title`：任务标题
- `assignee`：负责人
- `status`：状态
- `dueDate`：截止日期 (YYYY-MM-DD 格式)

**操作动作：**
- 选择主键 + 方向 -> 设定主排序规则
- 选择次键 + 方向 -> 设定次排序规则
- 点击「Izvorni vrstni red」 -> 恢复原始顺序

**成功状态：**
- UI 显示按规则排序的任务列表
- 任务保留 `data-task-id` 原始标识
- 不触发任何写入 API 调用

**失败状态：**
- 无效键名 / 方向 -> 当前选中项保留，不排序错误提示

## 需求与规则

| 需求 | 规则或验收条件 | 验证方法 |
| --- | --- | --- |
| R01 | 默认主键 `original`，主方向 `asc`，次键 `none`，次方向 `asc`。保持原始传入顺序。 | 初始加载检查 |
| R02 | `title`/`assignee` 比较采用标准化字符串处理：<br>1. NFD 正规化<br>2. 移除 U+0300–U+036F 重音符号<br>3. 转小写<br>4. UTF-16 码点字典序 | 测试用例：Črt vs crt, 空格处理 |
| R03 | `status` 枚举顺序：`todo` < `in_progress` < `done`。<br>`dueDate` 按 YYYY-MM-DD 字符串升序比较 (2026-09-21 < 2026-09-22)。 | 排序验证 |
| R04 | `asc`/`desc` 仅反转当前键比较结果，不颠倒次键/原始顺序。等值项保持相对顺序。 | 切换方向验证 |
| R05 | 次键仅在**主键比较相等**时生效。次键可独立选择方向。 | 主键不同任务次键不触发排序 |
| R06 | 主键 + 次键完全相等时，保持原始索引顺序。若主键选 `original`，无论其他键如何，始终保持原始顺序。 | 重复任务验证 |
| R07 | 表格三列（任务、状态、负责人）内部顺序与列表排序结果一致。 | 三列对齐检查 |
| R08 | 视图切换（表/板）、打开/关闭详情页不重置排序设置。 | 跨操作保持状态 |
| R09 | 切换项目重置所有 4 个排序控件为默认值。刷新页面恢复默认。 | 项目切换验证 |
| R10 | 「初始化顺序」按钮重置 4 个控件。空项目/单任务项目在所有配置下正常显示。 | 边界场景 |
| R11 | 排序为纯投影：不修改 `Task` 对象，不修改 API 记录，不触发 `PATCH` 请求。 | 监听 API 写操作 |
| R12 | 每个 ID 始终显示一次，跳转详情页正确。外观兼容 Folio 基础样式。 | `data-task-id` 唯一性检查 |

## 实现与追溯

| 需求 | 条件 | 测试场景 | 文件与代码 | 输出与证据 |
| --- | --- | --- | --- | --- |
| R01 | `useTaskSort()` hook 初始 `primary: 'original', direction: 'asc', secondary: null` | 初始加载 | `src/hooks/useTaskSort.ts` (待实现) | Playwright 初始 ID 顺序匹配 |
| R02 | 比较函数 `normalize(s)` 移除重音并转小写 | Unicode 任务标题 | `src/utils/sort.ts` | `tests/agent/sort.spec.ts` |
| R03 | `statusOrder: [todo, 'in_progress', 'done']` 数组查找顺序 | 状态切换 | `src/utils/sort.ts` | 状态顺序验证 |
| R04 | 排序方向仅应用于当前激活键的比较逻辑 | 方向切换 | `src/hooks/useTaskSort.ts` | 切换后顺序反转 |
| R05 | 排序函数仅比较 `primary`，相等时比较 `secondary` | 主键不同时次键不启用 | `tests/agent/primary.spec.ts` | 次键错误排序验证 |
| R06 | `stableSort` 实现需保留原始索引 | 重复主键 + 次键 | `src/utils/sort.ts` | ID 重复测试用例 |
| R07 | 渲染时 `tasksSorted` 遍历结果映射到三列 | UI 渲染一致 | `src/TaskBoard.tsx` / `src/App.tsx` | 表格三列对齐检查 |
| R08 | `persistSortState()` 保存在 session/local 但不写入存储 | 刷新/切换保持 | `src/hooks/useTaskSort.ts` | 刷新后状态保持 |
| R09 | `projectChange()` 调用 `resetSort()` | 项目切换 | `src/hooks/useTaskSort.ts` | 项目切换后重置 |
| R10 | 按钮调用 `resetSort()`。边界案例测试空列表 | 重置按钮 | `src/components/TaskViewControls.tsx` (待实现) | 空项目加载 |
| R11 | 避免调用 `updateTask`。排序变更仅在本地 | API 拦截检查 | `src/hooks/useTaskSort.ts` | Network tab 无 PATCH |
| R12 | `key={task.id}` 渲染，连接任务详情弹窗 | ID 唯一性 | `src/TaskBoard.tsx` / `src/App.tsx` | 列表与详情对应 |

## 开放问题与限制

1. **性能约束**：任务数量多时的排序性能未实测（待工程实现）。
2. **日期缺失**：假设 `dueDate` 始终有效 YYYY-MM-DD 格式。
3. **API 扩展**：本需求不修改 `/api/tasks` 接口，不增加新字段。
4. **测试环境**：`tests/development/` 中的测试数据需兼容新排序（已有排序相关测试 D01-D04 预计可延伸）。

## 备注

- 原始测试用例 `tests/development/task-board.spec.ts` 中的 `D01-D04` 将验证排序功能符合预期。
- `shared/types.ts` 定义的数据模型保持不变。
- `src/` 中现有组件需集成新 `useTaskSort` 逻辑。
