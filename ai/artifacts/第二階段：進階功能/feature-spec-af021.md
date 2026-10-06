# 功能規格書

## Metadata

- 功能：匯入學員個人資料 — Preview-then-Confirm（AF-021）
- 負責人：待補
- 狀態：草稿（stateless / atomic flow 與 Variant C 欄位對映體驗已確認；高風險架構審查待核准）
- 風險等級：高

## 問題

管理員需要以 CSV 或 Excel 批次建立學員個人資料，並在資料寫入前看見欄位錯誤與重複資料。匯入對象是 `User` 個人資料，不是課程報名、付款或 `Registrant` 記錄。

## 使用者

- 具 ADMIN 權限的管理員。

## 目標

- 接受 CSV / XLSX 學員名冊；提供範本下載，但不要求上傳來源標題完全符合範本。
- 讓管理員將來源標題對映到學員欄位；支援不同標題名稱，不只支援欄位重排。
- 只有整份檔案所有資料列有效時才允許確認。
- 確認時重新上傳並重新驗證檔案，再以單一資料庫交易建立全部使用者。
- `User` 是學員個人資料及身份證件欄位的唯一權威來源。
- 提供可下載的列/欄錯誤明細，協助管理員修正被拒絕的檔案。

## 非目標

- 不建立課程報名或付款資料。
- 不以此流程更新既有使用者；已存在的 email、身份證件號碼或 IA 牌照衝突視為驗證錯誤。
- 不保存上傳檔案或預覽資料於伺服器端暫存區、程序記憶體或資料庫。
- 不接受部分成功匯入。

## 使用者故事（User Stories）

| 故事 | 身為／我想要／以便 | 驗收標準 |
|---|---|---|
| 預覽學員檔案 | 管理員想在寫入前檢查資料，以便修正錯誤 | 預覽最多 20 列並顯示欄位與檔案結構錯誤；完整錯誤明細可下載；預覽不寫資料庫 |
| 對映來源欄位 | 管理員想把上傳檔案的欄位對映到學員資料欄位，以便使用不同來源格式而不誤植資料 | 可自動對映唯一精確標題；未對映必填欄位需管理員選擇；錯誤/重複對映不能進入確認 |
| 原子式匯入 | 管理員想一次匯入完整有效檔案，以便避免不完整名冊 | 任一列無效或任何資料庫寫入失敗時，整份檔案均不寫入 |
| 下載範本 | 管理員想取得正確欄位範本，以便準備可解析檔案 | CSV 與 XLSX 範本使用同一組欄位標題 |

## 使用者旅程

```text
身為管理員
我想上傳、檢視來源欄位、對映並預覽學員資料檔
以便只有完整有效的名冊會建立成 User 記錄
```

## 功能需求

- WHEN 上傳 CSV 或 XLSX THE SYSTEM SHALL 檢查副檔名與 10MB 大小上限。
- WHEN 檔案開頭含空白列 THE SYSTEM SHALL 跳過連續空白列，並將第一個非空白列視為來源標題候選列；不得越過非空白 preamble 猜測後續標題。
- WHEN 管理員初次上傳可解析檔案 THE SYSTEM SHALL 顯示來源欄名與最多 3 列樣本值供 ADMIN 判斷；重複欄名須可依欄位位置區分。
- WHEN 來源欄名唯一且正規化後與目標欄名相同 THE SYSTEM SHALL 自動對映；不得使用模糊匹配推測欄位。
- WHEN 必填目標欄位未對映 THE SYSTEM SHALL 要求管理員選取來源欄位；若來源欄位被對映到多個目標欄位，THE SYSTEM SHALL 顯示對映錯誤並阻止預覽確認。
- WHEN optional target field 沒有對映 THE SYSTEM SHALL 將該值視為空值，並沿用既有業務驗證與寫入規則。
- WHEN 管理員提交欄位對映 THE SYSTEM SHALL 重新上傳檔案並由伺服器依來源欄位位置套用對映及驗證所有資料列。
- WHEN 找不到來源標題候選列或解析器無法解析檔案 THE SYSTEM SHALL 回傳可讀的結構錯誤，且不得建立可確認的預覽。
- WHEN 檔案有任何無效資料列 THE SYSTEM SHALL 顯示錯誤並停用確認；不得只匯入有效列。
- WHEN 管理員確認 THE SYSTEM SHALL 再次接收同一份檔案、重新解析及驗證，然後以單一 Prisma transaction 建立全部 User。
- WHEN 任一寫入失敗 THE SYSTEM SHALL 回滾整個交易並回報失敗；不得回報部分匯入成功。
- WHEN 匯入 ID 文件資料 THE SYSTEM SHALL 寫入 `User.idDocType` / `User.idDocNumber`；不得以 `Registrant` 上的同名欄位覆蓋或取代 User 值。
- WHEN email、身份證件號碼或 IA 牌照與現有資料或同一檔案中的其他列重複 THE SYSTEM SHALL 將整個檔案標記為無效。

## 畫面

| 畫面 | 狀態 | 備註 |
|---|---|---|
| `/admin/import/registrants` | 上傳、欄位對映、資料預覽、確認中、成功、檔案錯誤、欄位對映錯誤、列驗證錯誤、交易失敗、權限不足、行動裝置版 | 單頁四步驟；無效對映或資料不得確認 |

## 資料與 API

- 輸入：初次檢視來源欄位時，`POST /api/admin/import/registrants/preview` 接受 `multipart/form-data` 的 `file` 欄位；提交對映預覽及 confirm 時，瀏覽器重新上傳 `file` 與以來源欄位 index 表示的 mapping；不使用 `importId`。
- 標題：依 AF-019 原始表格 parser 取得來源 index、標題、值及列號；第一個非空白列為唯一標題候選，允許任何標題文字與重複標題，不得越過非空白列猜測。
- 欄位對映：自動對映只接受唯一的正規化精確標題；其餘由管理員選擇。nameZh、nameEn、email、phone、idDocNumber 是必填目標欄位；idDocType、iaLicense、organization 可留空。每個來源欄最多對映一個目標欄位；額外來源欄可保持未對映。新使用者的 role 固定為 `STUDENT`。
- 輸出：未提供 mapping 的 preview 回傳來源欄 index、標題與最多 3 列樣本；提供 mapping 後的 preview 回傳列預覽、有效/錯誤筆數與結構錯誤；confirm 僅回傳整批成功或整批失敗結果。
- 驗證：必填欄位、email、電話、ID 類型、HKID 格式、資料庫既有重複及檔案內重複。
- 錯誤：結構錯誤或任何列錯誤均阻止確認；確認期間任一資料庫錯誤使交易回滾。
- 暫存：伺服器不保存檔案、解析列或預覽 session；瀏覽器保留原始 `File` 與 mapping state，mapping preview 與 confirm 都重新上傳檔案並在交易前重驗。

## 安全性與隱私

- 身分驗證：所有端點要求有效 session。
- 權限：僅 ADMIN 可預覽、確認及下載範本。
- 敏感資料：檔案包含姓名、email、電話及身份證件資料；只在請求處理期間使用，不寫入暫存檔或伺服器 session。
- 樣本資料：只回傳最多 3 列供 ADMIN 辨識欄位；來源對映至 `email`、`phone` 或 `idDocNumber` 後在畫面遮罩值。mapping/sample 均不作為最終業務驗證依據。
- 濫用情境：伺服器重新檢查副檔名、大小、欄位 index、target key、欄位對映唯一性及資料內容；不得信任瀏覽器 mapping/sample；confirm 必須重新解析及驗證。

## 驗收標準

1. CSV 與 XLSX 跳過開頭全空白列，第一個非空白列作為來源標題；任意來源標題都可檢視，不會猜測後續標題列。
2. 唯一精確匹配的標題自動對映；未匹配/重複標題可按來源 index 手動選擇，duplicate source label 可區分。
3. 所有必填目標欄位各自對映一個來源欄；來源欄不得重複對映，optional target fields 可留空，額外來源欄可以忽略。
4. 缺欄、重複指派、未知 target key 或超出來源範圍的 index 阻止 mapped preview/confirm，並提供可讀錯誤。
5. 欄位對映畫面最多顯示 3 列樣本；來源欄位對映至 email、phone 或身份證件號碼後遮罩其值；資料預覽仍最多顯示 20 列。
6. 任一列無效時，整份檔案不可匯入；確認按鈕停用。
7. mapping preview 與 confirm 都重新上傳、重新解析及重新驗證檔案，不依賴伺服器端 preview store 或 `importId`。
8. 所有列有效時，所有 User 在單一交易中建立；任一寫入失敗時資料庫沒有任何本批新增記錄。
9. `User` 是身份證件資料來源；匯入只建立 User，不建立 Registrant。
10. 資料庫既有重複與檔案內重複均會阻止整批匯入。
11. 範本下載提供 CSV 與 XLSX，副檔名及 10MB 上限檢查有效。
12. API 要求 ADMIN；preview 與 confirm 之間資料變更時，confirm 重新驗證並拒絕衝突。
13. Preview 提供 CSV 錯誤明細下載，包含原始列號、欄位及錯誤原因。
14. 所有新增/修改的 UI 文案使用 en、zh-hk、zh-cn dictionaries。
15. 整合測試證明交易失敗會完整回滾；`npm run typecheck` 與 `npm run lint` 通過。

## 驗證計畫

- 單元測試：AF-019 覆蓋原始欄位 index、重複標題、前置空白列及來源列號；AF-021 覆蓋 auto/manual mapping、mapping uniqueness、檔案內重複與 User 欄位 mapping。
- 整合測試：CSV / XLSX preview 與 confirm、ADMIN 權限、重複資料、全批回滾及 confirm 重驗。
- E2E：上傳不同標題格式檔案 → 對映欄位 → 預覽 → 確認 → 驗證所有 User 建立；含錯誤 mapping 或無效列的檔案不寫入任何 User。
- 視覺：欄位對映、重複/未對映錯誤、資料列錯誤、確認載入、成功與交易失敗狀態截圖。
- 手動：使用重複/不同語系標題、空白前置列、空標題欄、格式錯誤檔案驗證清楚錯誤訊息與 mapping 行為。
