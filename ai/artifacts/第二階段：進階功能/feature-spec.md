# 功能規格書

## Metadata

- 功能：資料匯入匯出共用函式庫 — CSV + Excel 工具（AF-019）
- 負責人：待補
- 狀態：已實作（AF-019 raw-table parser；AF-021 mapping flow continues in its own task cards）
- 風險等級：高（parser 接受外部 CSV/XLSX 檔案）

## 問題

目前平台缺少統一的資料匯入匯出工具。後續功能（匯出報名/付款 AF-020、匯入學員 AF-021、匯出課程 AF-022）都需要底層的 CSV 與 Excel 讀寫能力。若各卡片各自實作，會產生重複程式碼、格式不一致、維護困難。

## 使用者

- 開發者（AF-020～AF-022 的實作者）
- 間接：管理員（透過後續功能使用匯入匯出）

## 目標

- 提供一套共用的 CSV 與 Excel 工具函式，供所有匯入匯出功能使用
- 提供原始表格解析結果，讓呼叫方依其業務 schema 對映來源欄位，不要求上傳標題必須等於匯出範本標題
- CSV 工具支援 UTF-8 BOM、雙引號跳脫，相容 Excel 中文
- Excel 工具使用 exceljs，支援樣式、合併儲存格、多工作表
- 提供統一的型別定義與介面契約（DataExporter / DataImporter）
- 提供共用 helper：欄位對映、日期格式化、檔案下載 Response、大檔案串流

## 非目標

- 不包含任何業務邏輯的匯入/匯出（報名、付款、學員、課程等）
- 不做 UI 表單或管理頁面
- 不做檔案上傳 endpoint 或暫存機制
- 不做權限檢查（由呼叫方負責）
- 不做 Prisma 或資料庫直接互動

## 使用者故事（User Stories）

| 故事 | 身為／我想要／以便 | 驗收標準 |
|---|---|---|
| CSV 匯出 | 開發者想將資料陣列轉為 CSV 字串，以便使用者下載 | 產生的 CSV 含 UTF-8 BOM，值內含逗號/換行/雙引號時正確跳脫 |
| CSV 匯入 | 開發者想取得 CSV 的來源標題、來源列與原始列號，以便呼叫方對映欄位並批次處理 | 正確解析標準 CSV，保留來源欄位位置與列號，回傳格式錯誤 |
| Excel 匯出 | 開發者想將資料陣列寫入 .xlsx buffer，以便使用者下載 | 產生的 .xlsx 可在 Excel 中開啟，欄位寬度與格式正確 |
| Excel 匯入 | 開發者想取得 .xlsx buffer 的來源標題、來源列與原始列號，以便呼叫方對映欄位並批次處理 | 正確解析指定工作表，保留來源欄位位置與列號，回傳格式錯誤 |

## 使用者旅程

```text
身為開發者（實作 AF-020）
我想要呼叫 exportCsv(registrants, columns) 取得 CSV 字串
以便包裝成 Response 讓管理員下載報名資料報表
```

```text
身為開發者（實作 AF-021）
我想要取得學員檔案的原始來源欄與資料列
以便在 AF-021 中讓管理員將不同來源標題對映到學員欄位
```

## 功能需求

- WHEN 呼叫 `exportCsv(items, columns)` THE SYSTEM SHALL 回傳含 UTF-8 BOM 的 CSV 字串
- WHEN CSV 值包含逗號、雙引號或換行 THE SYSTEM SHALL 以雙引號包裹並跳脫內部雙引號
- WHEN 呼叫 CSV 匯入解析 THE SYSTEM SHALL 回傳來源欄位位置、原始標題、資料列值及來源列號，不自行推測業務欄位
- WHEN 呼叫 `exportExcel(items, columns)` THE SYSTEM SHALL 回傳 Buffer（.xlsx）
- WHEN 呼叫 Excel 匯入解析 THE SYSTEM SHALL 回傳來源欄位位置、原始標題、資料列值及來源列號，不自行推測業務欄位
- WHEN CSV 或 Excel 檔案開頭有全空白列 THE SYSTEM SHALL 略過這些列，並將第一個非空白列作為來源標題列
- WHEN 標題列之後的資料列全空白 THE SYSTEM SHALL 不回傳該列，並保留後續資料列的原始列號
- WHEN 來源標題有重複文字 THE SYSTEM SHALL 依來源欄位位置保留各欄，不能只以標題文字作為識別
- WHEN 第一個非空白列是標題候選列 THE SYSTEM SHALL 保留其原始欄名與欄位位置，不要求它符合任何呼叫方的 expected header
- WHEN CSV 或 Excel 檔案只有空白列或沒有標題列 THE SYSTEM SHALL 回傳明確的標題錯誤
- WHEN 指定 `sheetName` THE SYSTEM SHALL 使用該名稱建立工作表，否則使用預設名稱
- WHEN 指定 `ExportColumn.format` THE SYSTEM SHALL 在 Excel 中套用對應的格式字串（如 `yyyy-mm-dd`）
- WHEN 呼叫 `downloadCsvResponse(csv, filename)` THE SYSTEM SHALL 回傳含正確 `Content-Disposition` 的 Response
- WHEN 呼叫 `downloadExcelResponse(buffer, filename)` THE SYSTEM SHALL 回傳含正確 `Content-Disposition` 與 `Content-Type` 的 Response

## 畫面

此卡片為純後端工具庫，無畫面。

## 資料與 API

### DataExporter 介面

```typescript
interface DataExporter<T extends Record<string, unknown>> {
  export(items: T[], columns: ExportColumn<T>[]): string | Buffer;
}
```

### DataImporter 介面

```typescript
interface DataImporter<T extends Record<string, unknown>> {
  import(raw: string | Buffer, columns: ExportColumn<T>[]): ImportResult<T>;
}
```

`DataImporter` remains a convenience for callers whose input headers already match their declared columns. Callers that need administrator-controlled mapping use the raw-table contract below and map by source-column index.

### 原始匯入表格

- 每個來源欄位至少包含 0-based 欄位位置與原始標題文字；相同標題文字仍是不同來源欄位。
- 每個來源資料列包含 1-based 原始列號與依欄位位置排列的原始值。
- 標題後的全空白資料列不回傳；後續列號仍反映原始檔案位置。
- 標題偵測只跳過開頭全空白列，不掃描後續列猜測標題。
- 業務呼叫方負責將來源欄位位置對映到業務欄位，並驗證該對映。

### ExportColumn

| 屬性 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `key` | `keyof T` | 是 | 物件欄位鍵名 |
| `header` | `string` | 是 | 匯出標題文字 |
| `width` | `number` | 否 | Excel 欄寬 |
| `format` | `string` | 否 | Excel 格式字串 |

### ImportResult

| 屬性 | 型別 | 說明 |
|---|---|---|
| `success` | `boolean` | 是否完全成功 |
| `imported` | `number` | 成功匯入筆數 |
| `errors` | `ImportError[]` | 錯誤清單 |

### ImportError

| 屬性 | 型別 | 說明 |
|---|---|---|
| `row` | `number` | 錯誤行號（1-based） |
| `field` | `string` | 錯誤欄位 |
| `message` | `string` | 錯誤描述 |

- 輸入：CSV 字串 或 .xlsx Buffer
- 輸出：CSV 字串 或 .xlsx Buffer、ImportResult
- 驗證：AF-019 parser 負責原始表格與來源列結構；AF-021 等業務呼叫方負責來源欄位對映、欄位商業規則與型別驗證
- 錯誤：回傳 ImportResult.errors，不拋例外（呼叫方可自行決定是否拋出）

## 安全性與隱私

- 身分驗證：不處理（由呼叫方負責）
- 權限：不處理（由呼叫方負責）
- 敏感資料：CSV/Excel 內容由呼叫方傳入，工具本身不存取資料庫
- 濫用情境：大檔案串流 helper 應避免記憶體爆掉，但此卡僅提供工具，不限制檔案大小

## 驗收標準

1. CSV export produces valid UTF-8 BOM CSV with correct escaping
2. CSV import returns source column indices/labels, raw row values and source row numbers; only leading fully blank rows are skipped
3. Excel export produces valid .xlsx file that opens in Excel
4. Excel import returns source column indices/labels, raw row values and source row numbers; only leading fully blank rows are skipped
5. ExportColumn[] → CSV string and Excel buffer both work
6. ImportResult returns correct counts and error details
7. Repeated source header labels remain distinguishable by their source indices in both formats
8. npm run typecheck && npm run lint pass

## 驗證計畫

- 單元測試：CSV/XLSX fixtures cover leading/data blank rows, arbitrary and duplicate labels, source indices, original row numbers, first-nonblank candidate behavior, and all-blank files
- 整合測試：不適用（純工具函式）
- E2E：不適用
- 視覺：不適用
- 手動：執行 node 腳本產生 .csv 與 .xlsx，在 Excel 中開啟驗證
