# T-AGENT-001: Update Monstrare AGENTS.md & READMEs

## Metadata

- 任務：T-AGENT-001
- 上層 Epic：Agent-Standardization
- 上層 User Story：Fix Monstrare Kit Path References
- 分軌：不適用
- 前置任務（dependsOn）：無
- 狀態：草稿
- 風險等級：低
- Agent owner：TBD

## 目標

將 `.github/skills/monstrare/AGENTS.md`、`README.md`、`README.zh-TW.md`、`CLAUDE.md` 中所有裸 `ai/` 路徑改為從專案根目錄可正確解析的絕對路徑。

## 情境包（Context Pack）

- 相關檔案：
  - `.github/skills/monstrare/AGENTS.md`
  - `.github/skills/monstrare/README.md`
  - `.github/skills/monstrare/README.zh-TW.md`
  - `.github/skills/monstrare/CLAUDE.md`
- 既有模式：AGENTS.md 引用 `ai/process/workflow.md`，預設從專案根目錄解析但檔案實際在 `.github/skills/monstrare/ai/`
- 假設：opencode 從專案根目錄解析 AGENTS.md 中的相對路徑
- 允許變更的檔案：上述 4 個檔案
- 不得觸碰：`.github/skills/monstrare/ai/` 下的任何檔案（Monstrare 套件內容）

## 需求

1. AGENTS.md 中所有 `ai/` 開頭的路徑 → 改為 `.github/skills/monstrare/ai/` 開頭
2. README.md 中所有 `ai/` 路徑 → 比照處理
3. README.zh-TW.md 中所有 `ai/` 路徑 → 比照處理
4. CLAUDE.md 中所有 `ai/` 路徑 → 比照處理
5. 涉及技能的路徑（如 `ai/skills/design-craft.md`）改為指向 `.opencode/skills/<name>/SKILL.md`

## 具體對照表

### AGENTS.md (Line 4, 10-15)

| 當前 | 改為 |
|------|------|
| `` `ai/process/workflow.md` `` | `` `ai/process/workflow.md` (in Monstrare kit, resolved from `.github/skills/monstrare/`) `` OR explicit path |
| `ai/process/definition-of-ready.md` | `.github/skills/monstrare/ai/process/definition-of-ready.md` |
| `ai/process/definition-of-done.md` | `.github/skills/monstrare/ai/process/definition-of-done.md` |
| `ai/templates/screen-spec.md` | `.github/skills/monstrare/ai/templates/screen-spec.md` |
| `ai/templates/mockup-decision.md` | `.github/skills/monstrare/ai/templates/mockup-decision.md` |
| `ai/artifacts/<Epic>/` | `ai/artifacts/<Epic>/` (這條正確 — 專案根目錄) |
| `ai/context/design-system.md` | `ai/context/design-system.md` (這條正確) |
| `ai/artifacts/README.md` | `.github/skills/monstrare/ai/artifacts/README.md` |
| `ai/skills/design-craft.md` | `.opencode/skills/design-craft/SKILL.md` |
| `ai/checklists/design-review-checklist.md` | `.github/skills/monstrare/ai/checklists/design-review-checklist.md` |
| `ai/skills/project-kickoff.md` | `.opencode/skills/project-kickoff/SKILL.md` |

## 驗收標準

- AGENTS.md 中不再有裸 `ai/(process\|templates\|skills\|checklists)/` 路徑
- 所有改動後的路徑指向實際存在的檔案

## 驗證契約

- 型別檢查：不適用（純文字 md）
- Lint：不適用
- 驗證指令：`rg '\\bai/(process|templates|skills|checklists)\b' .github/skills/monstrare/AGENTS.md .github/skills/monstrare/README.md .github/skills/monstrare/README.zh-TW.md .github/skills/monstrare/CLAUDE.md` → 應為空