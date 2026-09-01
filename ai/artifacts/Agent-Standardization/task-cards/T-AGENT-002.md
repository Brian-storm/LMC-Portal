# T-AGENT-002: Update All `.opencode/skills/*/SKILL.md` Files

## Metadata

- 任務：T-AGENT-002
- 上層 Epic：Agent-Standardization
- 上層 User Story：Fix OpenCode Skill References
- 分軌：不適用
- 前置任務（dependsOn）：T-AGENT-001
- 狀態：草稿
- 風險等級：低
- Agent owner：TBD

## 目標

修正所有 8 個 `.opencode/skills/<name>/SKILL.md` 檔案中對 `ai/process/`、`ai/templates/`、`ai/checklists/` 的相對路徑，改為可正確解析的路徑。

## 情境包（Context Pack）

- 相關檔案：
  - `.opencode/skills/design-craft/SKILL.md`
  - `.opencode/skills/implementation-plan/SKILL.md`
  - `.opencode/skills/project-kickoff/SKILL.md`
  - `.opencode/skills/project-search/SKILL.md`
  - `.opencode/skills/security-maintainability-review/SKILL.md`
  - `.opencode/skills/spec-interrogation/SKILL.md`
  - `.opencode/skills/test-verification/SKILL.md`
  - `.opencode/skills/ui-mockup-gate/SKILL.md`
- 既有模式：每個 SKILL.md 都有 `**Canonical rules**: `.github/skills/monstrare/ai/skills/<name>.md`` （這些路徑正確），但還有其他 `ai/` 相對路徑
- 允許變更的檔案：上述 8 個檔案
- 不得觸碰：技能檔案的邏輯內容、指令

## 需求

對每個 SKILL.md 做以下取代：

| 檔案 | 當前路徑 | 改為 |
|------|----------|------|
| design-craft | `ai/checklists/design-review-checklist.md` | `.github/skills/monstrare/ai/checklists/design-review-checklist.md` |
| implementation-plan | `ai/templates/task-card.md` | `.github/skills/monstrare/ai/templates/task-card.md` |
| implementation-plan | `ai/process/definition-of-ready.md` | `.github/skills/monstrare/ai/process/definition-of-ready.md` |
| project-kickoff | 無 `ai/` 裸路徑（已有完整 `.github/` 路徑） | — |
| project-search | `ai/process/context-protocol.md` | `.github/skills/monstrare/ai/process/context-protocol.md` |
| security-maintainability-review | `ai/checklists/security-checklist.md` | `.github/skills/monstrare/ai/checklists/security-checklist.md` |
| spec-interrogation | `ai/artifacts/<Epic>/feature-spec.md` | `ai/artifacts/<Epic>/feature-spec.md`（正確 — 專案工件） |
| spec-interrogation | `ai/templates/feature-spec.md` | `.github/skills/monstrare/ai/templates/feature-spec.md` |
| test-verification | `ai/process/definition-of-done.md` | `.github/skills/monstrare/ai/process/definition-of-done.md` |
| test-verification | `ai/checklists/testing-checklist.md` | `.github/skills/monstrare/ai/checklists/testing-checklist.md` |
| test-verification | `ai/checklists/design-review-checklist.md` | `.github/skills/monstrare/ai/checklists/design-review-checklist.md` |
| test-verification | `ai/templates/verification-report.md` | `.github/skills/monstrare/ai/templates/verification-report.md` |
| ui-mockup-gate | `ai/templates/screen-spec.md` | `.github/skills/monstrare/ai/templates/screen-spec.md` |
| ui-mockup-gate | `ai/templates/mockup-decision.md` | `.github/skills/monstrare/ai/templates/mockup-decision.md` |
| ui-mockup-gate | `ai/context/design-system.md` | `ai/context/design-system.md`（正確 — 專案根目錄） |

注意：`ai/artifacts/` 和 `ai/context/` 路徑在專案根目錄確實存在，不需要改。

## 驗收標準

- `.opencode/skills/` 下所有 SKILL.md 中不再有無法解析的 `ai/(process\|templates\|checklists)/` 裸路徑
- 每個改動後的路徑都指向實際存在的檔案

## 驗證契約

- 驗證指令：`rg '\\bai/(process|templates|checklists)\b' .opencode/skills/` → 應回傳空結果（排除 `ai/(context|artifacts)/` 的正確路徑）