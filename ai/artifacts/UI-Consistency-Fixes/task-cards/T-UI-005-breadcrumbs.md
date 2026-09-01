# AI-Ready 任務卡

## Metadata

- 任務：在所有公開頁面加入麵包屑導航（T-UI-005）
- 上層規格：BREADCRUMBS-IMPL
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為訪客，我希望在每個頁面的頂部看到麵包屑導航，清楚了解目前所在位置並能快速返回上層頁面
- 分軌：前端
- 前置任務（dependsOn）：T-UI-001（Footer 修正，確保導覽層級正確）
- 狀態：就緒
- 風險等級：低
- Agent owner：待指定
- 人工核准者：待指定

## 目標

在公開頁面（Courses 列表、課程詳細、About、Contact、Privacy、Terms）的頂部加入 Breadcrumbs 元件，提供一致的導航路徑。

## 情境包（Context Pack）

- 相關檔案：`src/components/common/Breadcrumbs.tsx`（已存在）、`src/app/[locale]/courses/page.tsx`、`src/app/[locale]/courses/[slug]/page.tsx`、`src/app/[locale]/about/page.tsx`、`src/app/[locale]/contact/page.tsx`、`src/app/[locale]/privacy/page.tsx`、`src/app/[locale]/terms/page.tsx`、`src/dictionaries/en.json`（breadcrumbs 段落）、`src/dictionaries/types.ts`
- 既有模式：Breadcrumbs 元件已存在（Home icon + ChevronRight divider），接受 `items` 陣列與 `dict` prop；目前未在任何頁面使用
- 假設：所有公開頁面都是 server component，直接 import Breadcrumbs
- 未知事項：Layout breadcrumbs vs page-level breadcrumbs 的選擇
- 允許變更的檔案：以下頁面 + Breadcrumbs 元件（如需要調整）
- 不得觸碰：admin/portal 等經過認證的頁面（另案處理）

## 需求

1. **Courses 列表頁** (`/courses`)：Home > Courses
2. **課程詳細頁** (`/courses/[slug]`)：Home > Courses > [課程名稱]
3. **About 頁** (`/about`)：Home > About Us
4. **Contact 頁** (`/contact`)：Home > Contact Us
5. **Privacy 頁** (`/privacy`)：Home > Privacy Policy
6. **Terms 頁** (`/terms`)：Home > Terms & Conditions
7. **Breadcrumbs 位置**：頁面頂部、Navbar 下方、頁面標題上方，與現有 py-2.5 px-4 + border-b 樣式一致
8. **字典整合**：所有 breadcrumb label 字串應來自 dict.breadcrumbs，而非 hardcoded

## 驗收標準

- [ ] 6 個公開頁面都有 Breadcrumbs
- [ ] Breadcrumbs 顯示正確的導航層級
- [ ] 最後一項為當前頁面（不可點擊），樣式為 font-medium text-slate-800
- [ ] 中間項目可點擊回到上層頁面
- [ ] 三種語系的 breadcrumb labels 正確顯示
- [ ] Breadcrumbs 不影響頁面其他元件的版面與功能

## 實作備註

- 建議在每個 page.tsx 中直接 import 並渲染 Breadcrumbs，而非放入 layout
- Breadcrumbs 已在 `src/components/common/Breadcrumbs.tsx` 準備就緒，無需重寫
- dict.breadcrumbs 中需有對應的 key（如 courses、about、contact、privacy、terms 等），請確認 en.json 已涵蓋
- 建立一個輔助函數或直接傳入 items array

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：6 個頁面各一張桌面截圖，顯示 Breadcrumbs 正確渲染
- 安全性檢查：N/A

## 完成證據

- 變更的檔案：courses/page.tsx、courses/[slug]/page.tsx、about/page.tsx、contact/page.tsx、privacy/page.tsx、terms/page.tsx、Breadcrumbs.tsx（如調整）、en.json（如有新增 dict key）
- 執行過的指令：npm run typecheck、npm run lint、npm run build
- 測試輸出：無
- 螢幕截圖：6 頁 Breadcrumbs 截圖
- 已知限制：無
- 後續任務：可延伸至 dashboard/admin 頁面