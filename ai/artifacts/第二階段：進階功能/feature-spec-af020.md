# 功能規格書

## Metadata

- 功能：匯出學員報名資料 + 付款報表（AF-020）
- 負責人：待補
- 狀態：草稿
- 風險等級：低

## 問題

管理員需要將報名資料與付款記錄匯出為 CSV 或 Excel，以便在本地端進行離線分析、稽核或呈報。

## 使用者

- 管理員（admin role）

## 目標

- 提供兩個匯出 API：報名資料匯出、付款報表匯出
- 支援 CSV 與 Excel 兩種格式
- 支援多種過濾參數（狀態、課程、日期區間、搜尋關鍵字）
- Admin UI 提供一鍵下載按鈕
- 大資料量（>10000 筆）顯示提示資訊

## 非目標

- 不做背景匯出 + email 通知（留待 MVP 後優化）
- 不做匯入（那是 AF-021）
- 不做批次操作（已在 Enrolment 頁面實作）

## 使用者故事（User Stories）

| 故事 | 身為／我想要／以便 | 驗收標準 |
|---|---|---|
| 匯出報名資料 | 管理員想將報名資料匯出為 CSV/Excel，以便離線分析 | 按下按鈕即下載含正確欄位的檔案 |
| 匯出付款報表 | 管理員想將付款記錄匯出為 CSV/Excel，以便財務稽核 | 按下按鈕即下載含交易編號、金額、狀態的檔案 |
| 過濾匯出 | 管理員想只匯出特定狀態或課程的資料，以便聚焦 | 所有 filter params 正確套用 |

## 使用者旅程

```text
身為管理員
我想要在 Enrolments 頁面點擊「匯出 CSV」按鈕
以便將所有報名資料匯出到 Excel 進行離線分析
```

## 功能需求

- WHEN `GET /api/admin/enrolments/export?format=csv` THE SYSTEM SHALL 回傳含 UTF-8 BOM 的 CSV 檔案
- WHEN `GET /api/admin/enrolments/export?format=xlsx` THE SYSTEM SHALL 回傳 .xlsx 檔案
- WHEN 加上 `status=VERIFIED` THE SYSTEM SHALL 只包含已審核的報名
- WHEN 單一報名有 group 成員 THE SYSTEM SHALL 展開為多行（每人一行）
- WHEN `GET /api/admin/payments/export?format=csv` THE SYSTEM SHALL 回傳付款報表 CSV
- WHEN 資料量大於 10000 筆 THE SYSTEM SHALL 回傳提示「資料過大，請縮小查詢範圍」

## 畫面

### Enrolments 頁面
- 右上角新增「匯出 CSV」「匯出 Excel」按鈕
- 按鈕位於 page header 右側，與 batch toolbar 同區

### Payments 頁面（新增）
- 簡易付款記錄列表
- 右上角「匯出 CSV」「匯出 Excel」按鈕
- 側邊導航新增 Payments 連結

## 資料與 API

### GET /api/admin/enrolments/export
- Query params: `format` (csv|xlsx, default csv), `status`, `courseId`, `startDate`, `endDate`, `search`
- 欄位：Registrant ID、學員姓名、Email、IA 牌照、身份證件類型/號碼、課程名稱、課程參考編號、報名類型、團體 ID、付款方式、金額、付款狀態、提交日期、收據編號
- 回傳：Content-Disposition: attachment 的檔案

### GET /api/admin/payments/export
- Query params: `format` (csv|xlsx, default csv), `status`, `paymentMethod`, `startDate`, `endDate`
- 欄位：Registrant ID（作為匯出識別碼）、學員、Email、課程及課程參考編號、付款方式、金額、付款狀態、收據編號、提交日期、第三方付款標記、付款人姓名
- 回傳：Content-Disposition: attachment 的檔案

### Database mapping and source of truth

- This is a denormalized reporting projection, not a raw table dump.
- `Registrant` supplies enrolment/payment fields (`id`, `enrollmentType`, `groupId`, `paymentMethod`, `fee`, `paymentStatus`, `receiptNumber`, `submittedAt`, `isThirdPartyPay`, `payerFullName`). There is no separate Payment model in the current schema; the exported “transaction” identifier is `Registrant.id`.
- `User` supplies canonical learner identity/profile fields (`nameZh` / `nameEn`, `email`, `iaLicense`, `idDocType`, `idDocNumber`). `User` is the source of truth for ID-document fields; same-named fields on `Registrant` are not used by these exports.
- `Course` supplies course name and IA reference.
- The current schema has no Alipay trade number, payment timestamp, or refund timestamp fields. Those are not part of this export contract; adding them requires a separate schema and API change.

## 安全性與隱私

- 身分驗證：session.auth() + ADMIN role check
- 權限：僅 ADMIN 可存取
- 敏感資料：包含學員姓名、Email、IA 牌照等個人資料

## 驗收標準

1. GET /api/admin/enrolments/export?format=csv downloads valid CSV file
2. GET /api/admin/enrolments/export?format=xlsx downloads valid Excel file
3. GET /api/admin/payments/export?format=csv downloads valid CSV file
4. All filter params (status, courseId, date range, and search where supported) applied correctly in export
5. Admin Enrolments page has Export CSV + Export Excel buttons
6. Admin Payments page has Export CSV + Export Excel buttons
7. Download triggers immediate file download with correct filename
8. Large dataset (>10000 rows) shows appropriate handling message
9. Identity-document fields in both exports come from `User`, not duplicate fields on `Registrant`
10. Export documentation does not promise payment provider IDs or payment/refund timestamps absent from the schema
11. npm run typecheck && npm run lint pass

## 驗證計畫

- 手動：瀏覽各 admin 頁面 → 點擊匯出按鈕 → 確認檔案下載
- typecheck + lint
