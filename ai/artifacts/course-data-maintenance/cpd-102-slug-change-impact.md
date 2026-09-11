# 變更影響分析：`cpd-102` → `CPD26090103`

## 摘要

將課程「香港醫療體制發展、大灣區醫療概況與醫療保障」的編號從 `cpd-102` 改為 `CPD26090103`，涉及 3 個程式檔案中約 15 處文字修改，**屬於小規模變更**，但需注意資料庫遷移與 URL 過渡策略。

## 受影響的檔案

### 1. `prisma/seed.ts` — 13 處

| 行號 | 內容 | 變更說明 |
|------|------|----------|
| 39, 178, 180–187, 192, 349 | 註解與變數名稱（`cpd-102` / `cpd102`） | 更新文字與變數名 |
| 191 | `where: { slug: "cpd-102" }` | upsert 查詢條件 |
| 204 | `id: "cpd-102"` | 資料庫主鍵 |
| 205 | `slug: "cpd-102"` | 唯一識別碼 |
| 213 | `iaRefNumber: "REF-cpd-102"` | IA 參考編號 |
| 258–259 | FAQ 中文字回答內的 `REF-cpd-102` | 前端顯示文字 |
| 313 | `findUnique({ where: { slug: "cpd-102" } })` | 查詢 ScheduleTopic 關聯 |
| 316, 320 | 使用 `cpd102.id` 建立 ScheduleTopic 關聯 | 自動跟著 id 變更 |

### 2. `src/app/api/courses/[slug]/brochure/route.ts` — 1 處

| 行號 | 內容 | 變更說明 |
|------|------|----------|
| 36 | `if (slug === "cpd-102")` | 決定是否回傳特製的 PDF 講義。若新編號 `CPD26090103` 也需同樣行為，條件須更新；若不再需要，此處可改為更通用的邏輯 |

### 3. `ai/artifacts/enrollment/fee-calculation-spec.md` — 1 處

| 行號 | 內容 | 變更說明 |
|------|------|----------|
| 55 | 驗證 URL `/zh-hk/courses/cpd-102/enroll` | 文件中的手動驗證路徑 |

## 不受影響（但值得注意的）

| 項目 | 說明 |
|------|------|
| **動態路由** | `app/[locale]/courses/[slug]/page.tsx` 及 `enroll/page.tsx` 使用動態參數，不需修改 |
| **課程列表頁** | `courses/page.tsx` 從資料庫 `findMany()` 動態產生，不需修改 |
| **Prisma schema** | `slug` 欄位在 `Course` model 中是 `@unique` 字串，不需改 schema |
| **外部 API** | `GET /api/courses/[slug]` 等 API 路由使用動態 slug，不需修改 |
| **其他課程種子資料** | 不影響其他課程的 upsert 邏輯 |

## 需要留意的影響

| 項目 | 風險 | 說明 |
|------|------|------|
| **資料庫 FK 關聯** | 中 | 若 `id` 從 `"cpd-102"` 改為 `"CPD26090103"`，則 `Schedule`、`Faq`、`Review`、`Registrant`、`CourseInstructor` 等表的外鍵需一併更新。Prisma 的 `upsert` 在 `id` 變更時不會自動級聯更新關聯 |
| **URL 破鏈** | 低 | 舊 URL `/courses/cpd-102` 會 404。需考量是否設 redirect 或 SEO 301 |
| **IA 參考編號** | 低 | `REF-cpd-102` 變更為 `REF-CPD26090103` 時，需確認是否與保險業監管局的註冊資料一致 |
| **PDF 講義路由** | 低 | 需確認 `CPD26090103` 是否仍需要走特製 PDF 邏輯，或可改為根據 `category` 或 `iaRefNumber` 判別 |
| **已報名學員紀錄** | 中 | 若資料庫中有已存在的 registrant 記錄使用 `courseId: "cpd-102"`，變更 `id` 會斷開關聯 |

## 變更步驟建議

1. **修改 `prisma/seed.ts`** — 將所有 `cpd-102` 文字與 `cpd102` 變數替換為 `CPD26090103` / `cpd26090103`
2. **修改 `brochure/route.ts`** — 更新 slug 比對條件
3. **更新文件** — 修改 `fee-calculation-spec.md` 中的驗證 URL
4. **資料庫遷移** — 撰寫 migration 腳本更新已存在的 course 記錄及其 FK 關聯
5. **考量 redirect** — 若網站已上線，考慮新增舊 slug → 新 slug 的 301 redirect
6. **前端 IA 編號顯示** — 確認 `iaRefNumber` 的變更是否影響前端任何顯示邏輯（目前查無硬編碼）

## 結論

**規模：小。** 程式碼修改量約 15 處，集中在單一種子檔案。主要風險在於資料庫中已存在的 FK 關聯與對外 URL 的過渡策略，而非程式碼改動量。