# T-AGENT-004: Final Verification Pass

## Metadata

- 任務：T-AGENT-004
- 上層 Epic：Agent-Standardization
- 分軌：不適用
- 前置任務（dependsOn）：T-AGENT-001, T-AGENT-002, T-AGENT-003
- 狀態：草稿
- 風險等級：低
- Agent owner：TBD

## 目標

對所有改動後的檔案進行最終驗證：確認不再有裸 `ai/` 路徑殘留、所有路徑指向實際存在的檔案。

## 需求

1. 執行以下驗證命令並記錄結果：

```bash
# 1. 檢查裸 ai/ 路徑殘留（應為空）
rg '\bai/(process|templates|skills|checklists)\b' .github/skills/monstrare/ .opencode/skills/ tools/kanban/ AGENTS.md

# 2. 檢查新路徑是否指向實際檔案
rg '\.github/skills/monstrare/ai/' .github/skills/monstrare/AGENTS.md .opencode/skills/ | ForEach-Object {
  $path = $_ -replace '.*\.github/', '.github/'
  if (-not (Test-Path $path)) { "MISSING: $path" }
}
```

2. 對照 architecture-notes.md 的檔案清單，確認所有 15 個檔案都已處理
3. 確認 `ai/artifacts/`、`ai/context/`、`ai/` 專案根目錄路徑不受影響

## 驗收標準

- `rg` 檢查回傳零結果
- 所有改動後路徑指向存在檔案
- 15 個檔案全部對應完成

## 驗證契約

- 上述 rg 命令輸出結果截圖/文字記錄
- 確認所有新路徑指向存在檔案