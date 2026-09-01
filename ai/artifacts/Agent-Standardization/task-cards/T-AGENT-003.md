# T-AGENT-003: Update Supplementary Files (tools/kanban, .codex/.claude stubs, Monstrare skill stubs)

## Metadata

- 任務：T-AGENT-003
- 上層 Epic：Agent-Standardization
- 上層 User Story：Clean Up Remaining Broken References
- 分軌：不適用
- 前置任務（dependsOn）：T-AGENT-002
- 狀態：草稿
- 風險等級：低
- Agent owner：TBD

## 目標

修復 Monstrare 工具檔案（`tools/kanban/`）以及 `.codex/.claude` 技能 stub 檔案中所有對 `ai/` 的殘留路徑。

## 情境包（Context Pack）

- 相關檔案：
  - `.github/skills/monstrare/tools/kanban/README.md`（3 處 `ai/process/kanban.md`、`ai/skills/`、`ai/templates/`）
  - `.github/skills/monstrare/tools/kanban/screen-spec.md`（1 處 `ai/process/kanban.md`）
  - `.github/skills/monstrare/tools/kanban/mockup-decision.md`（1 處 `ai/process/kanban.md`）
  - `.github/skills/monstrare/.codex/skills/*/SKILL.md`（每個引用 `ai/skills/xxx.md`）
  - `.github/skills/monstrare/.claude/skills/*/SKILL.md`（同上）
  - `.github/skills/monstrare/.claude/agents/ux-reviewer.md`（1 處 `ai/skills/` + `ai/checklists/`）
  - `tools/kanban/README.md`（專案根目錄的 mirror — 應與 Monstrare 版本同步修復）
- 允許變更的檔案：上述所有檔案

## 需求

### 3.1 `tools/kanban/README.md`（專案根目錄版 + Monstrare 套件版）

`ai/process/kanban.md` → `.github/skills/monstrare/ai/process/kanban.md`
`ai/skills/project-kickoff.md` → `.opencode/skills/project-kickoff/SKILL.md`
`ai/templates/kanban-card.md` → `.github/skills/monstrare/ai/templates/kanban-card.md`

### 3.2 `screen-spec.md` / `mockup-decision.md`

同上 `ai/process/kanban.md` 取代規則

### 3.3 `.codex/skills/<name>/SKILL.md` 和 `.claude/skills/<name>/SKILL.md`

這些 stub 目前引用 `ai/skills/<name>.md`。改為：
`.codex/skills/<name>/SKILL.md` 中的引用 → `.github/skills/monstrare/ai/skills/<name>.md`（若 stub 仍需要保留跨工具相容性）
或者移除這些 stub（若不再需要 Claude Code / Codex 相容性）

### 3.4 `.claude/agents/ux-reviewer.md`

`ai/skills/design-craft.md` → `.opencode/skills/design-craft/SKILL.md`
`ai/checklists/design-review-checklist.md` → `.github/skills/monstrare/ai/checklists/design-review-checklist.md`

## 驗收標準

- 所有 `ai/(process\|templates\|skills\|checklists)/` 裸路徑在 `.github/skills/monstrare/` 和 `tools/kanban/` 下均已修正
- 與任務卡的驗證指令一致

## 驗證契約

- 驗證指令：`rg '\\bai/(process|templates|skills|checklists)\b' .github/skills/monstrare/ tools/kanban/` → 應為空