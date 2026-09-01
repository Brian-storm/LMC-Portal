# AI-Ready 任務卡

## Metadata

- 任務：修正 Footer 導航連結路徑（T-UI-001）
- 上層規格：FOOTER-NAV-FIX
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為訪客，我希望 Footer 中的連結能正確導向對應頁面，而不是失效或指向錯誤的路由
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：就緒
- 風險等級：低
- Agent owner：待指定
- 人工核准者：待指定

## 目標

修正 Footer 中所有錯誤的連結路徑，讓每個導航項目指向真實存在的頁面路由。

## 情境包（Context Pack）

- 相關檔案：`src/components/Footer.tsx`、`src/dictionaries/en.json`（footer 段落）、`src/dictionaries/types.ts`
- 既有模式：Footer 使用 `Link` 元件搭配 `/${currentLocale}/path` 格式；所有 UI 字串來自 dict 物件
- 假設：public pages 的 locale 路由模式為 `/${locale}/<page>`；portal/dashboard 路由為 `/${locale}/dashboard`
- 未知事項：無
- 允許變更的檔案：`src/components/Footer.tsx`、`src/dictionaries/en.json`、`src/dictionaries/zh-hk.json`、`src/dictionaries/zh-cn.json`
- 不得觸碰：Footer 的版面結構、顏色、間距不應在此卡更動

## 需求

1. Courses 欄位中 4 個連結全都指向 `/${currentLocale}/courses` —— 應全部統一指向課程列表頁（維持不變，但確認這是正確的目標）
2. Portals 欄位：
   - portal1（"Student Portal" / "學員入口"）：目前指向 `/${locale}/portal` → 應改為 `/${locale}/dashboard`
   - portal2（"Admin Portal" / "管理後台"）：目前指向 `/${locale}/portal/admin` → 應改為 `/${locale}/admin`
   - portal3（"About Us" / "關於我們"）：維持 `/${locale}/about`（正確）
   - portal4（"FAQ" / "常見問題"）：目前指向 `/${locale}/faq` → FAQ 頁面不存在，移除該項目或改為指向 Contact 頁 `/${locale}/contact`
3. 底部法律條款欄：
   - disclaimer 連結指向 `/${locale}/disclaimer` → 該頁不存在。若無對應頁面，移除該連結或併入 Terms
4. 確認所有 Footer href 都有正確的 locale prefixed 格式

## 驗收標準

- [ ] Footer 中每一個導航連結點擊後都能到達正確的頁面（無 404）
- [ ] 學生入口連結導向 `/dashboard`，管理後台導向 `/admin`
- [ ] FAQ 項目已移除或改為有效的 Contact 頁面
- [ ] 免責聲明連結已處理（移除或指向有效頁面）
- [ ] 三種語系的 Footer 字串（en/zh-hk/zh-cn）都已同步更新

## 實作備註

- 注意 mobile drawer 中的 footer links 也要檢查（Footer.tsx 本身只有桌面版，但確認無 mobile 版本複製）
- FAQ 與 Disclaimer 若無對應頁面，建議直接從 dict 中移除該項目，並從 JSX 中刪除對應的 `<li>` 節點

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：完成後提供 Footer 截圖，所有可見連結已修正
- 安全性檢查：N/A（僅前端路由變更）

## 完成證據

- 變更的檔案：Footer.tsx + 3 個字典 JSON
- 執行過的指令：npm run typecheck、npm run lint
- 測試輸出：無
- 螢幕截圖：Footer 截圖
- 已知限制：無
- 後續任務：無