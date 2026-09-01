# AI-Ready 任務卡

## Metadata

- 任務：Contact 頁面 UI 重新設計（字型、字級、地圖尺寸）（T-UI-006）
- 上層規格：CONTACT-REDESIGN
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為訪客，我希望聯絡頁面易於閱讀，字體大小舒適，地圖顯示完整
- 分軌：前端
- 前置任務（dependsOn）：T-UI-005（Breadcrumbs，Contact 頁需加入 Breadcrumbs）
- 狀態：就緒
- 風險等級：低
- Agent owner：待指定
- 人工核准者：待指定

## 目標

重新設計 Contact 頁面的字型、字級排版與 Google Maps iframe 尺寸，使其符合全站設計系統規範，閱讀體驗更舒適。

## 情境包（Context Pack）

- 相關檔案：`src/app/[locale]/contact/page.tsx`、`src/dictionaries/en.json`（contactPage 段落）、`src/dictionaries/zh-hk.json`、`src/dictionaries/zh-cn.json`
- 既有模式：目前使用 `font-mono`（等寬字體）搭配 `text-xs`（12px）顯示地址、電話等資訊，字級過小；地圖 iframe 為 `height="320"` 矩形
- 假設：品牌字體 Montserrat + sans-serif fallback 為標準字體；地圖尺寸需在 grid 中合理分配
- 未知事項：人工希望地圖與資訊區的比例
- 允許變更的檔案：`src/app/[locale]/contact/page.tsx`、三語系 JSON（contactPage 部分，若有文案調整）
- 不得觸碰：聯絡資訊的結構、圖標選擇、整體功能

## 需求

1. **字型調整**：移除 `font-mono` 類別，所有地址/電話/營業時間改為 `font-sans`（Montserrat / Arial），與全站一致
2. **字級放大**：
   - 地址資訊：`text-xs` → `text-sm` (14px)
   - 電話/電郵/WhatsApp：`text-xs` → `text-sm` (14px)
   - 營業時間：`text-[11px]` → `text-xs` (12px)
   - 頁面標題：維持 `text-2xl sm:text-3xl`
3. **側邊資訊卡文字行距**：增加 `leading-relaxed` 或 `leading-6`
4. **Google Maps 改為正方形**：將 iframe 從 `height="320"` 改為 `aspect-square` (1:1 比例)，或設定 `min-h-[320px]` 搭配 aspect-ratio
   - 在 grid 中左欄 (md:col-span-3) 使用 `aspect-square` 確保地圖顯示為正方形區塊
5. **加入 Breadcrumbs**（依賴 T-UI-005）：在頁面頂部 Navbar 下方插入 `<Breadcrumbs>` 元件

## 驗收標準

- [ ] 所有文字使用 `font-sans`，無 `font-mono`
- [ ] 字級符合需求規格（14px / 12px）
- [ ] 地圖 iframe 呈現為正方形比例
- [ ] Breadcrumbs 正確顯示（Home > Contact Us）
- [ ] 三種語系排版一致
- [ ] 頁面整體視覺不再擁擠，行距舒適

## 實作備註

- Contact 頁目前為 server component，import Breadcrumbs 時需傳入 `currentLocale` 與 `dict.breadcrumbs`
- 地圖若使用 `aspect-square`，需包裝在一個 container div 中，iframe 設 `w-full h-full`
- 地圖嵌入網址保持不變，僅改尺寸
- 注意 responsive：mobile 上地圖可能改為 4:3 而非 1:1，需用 Tailwind 的 `aspect-[4/3] md:aspect-square`

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：Contact 頁面 desktop + mobile 各一張
- 安全性檢查：N/A

## 完成證據

- 變更的檔案：`src/app/[locale]/contact/page.tsx`
- 執行過的指令：npm run typecheck、npm run lint、npm run build
- 測試輸出：無
- 螢幕截圖：Contact 頁面截圖（桌面 + 手機）
- 已知限制：地圖 URL 為 mock 座標，尚未填入真實 LMC 辦公室經緯度
- 後續任務：T-CONTACT-MAP-COORD（填入真實地圖座標）