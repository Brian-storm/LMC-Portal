# AI-Ready 任務卡

## Metadata

- 任務：重新設計 Newsletter 訂閱區塊為「課程諮詢 / 與我們聯絡」CTA（T-UI-004）
- 上層規格：NEWSLETTER-REDESIGN
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為訪客，我沒有訂閱電子報的需求，但我希望有一個直接的方式預約課程諮詢或留下查詢
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：低
- Agent owner：待指定
- 人工核准者：待指定

## 目標

將首頁現有的「Subscribe to Consultancy Bulletins」訂閱區塊重新設計為一個「課程諮詢 / 預約免費諮詢」的 CTA 區塊，移除電子報訂閱概念，改為引導使用者填寫查詢表單或預約通話。

## 情境包（Context Pack）

- 相關檔案：`src/components/home/NewsletterForm.tsx`、`src/dictionaries/en.json`（newsletterForm 段落）、`src/dictionaries/zh-hk.json`、`src/dictionaries/zh-cn.json`、`src/dictionaries/types.ts`
- 既有模式：NewsletterForm 為 client component，包含 name + email 雙欄位、提交後模擬成功狀態；背景為深色全寬區塊
- 假設：表單提交目前為模擬（setTimeout），後續由後端 API 接手；版面仍為全寬深色區塊
- 未知事項：人工是否希望保留 name/email 輸入欄位，或改為「立即諮詢」按鈕直接跳轉聯絡頁
- 允許變更的檔案：`src/components/home/NewsletterForm.tsx`、`src/dictionaries/*.json`（newsletterForm 區段）、`src/dictionaries/types.ts`
- 不得觸碰：HomePage.tsx 的組合方式、其他 homepage 區塊

## 需求

1. **重新命名與定位**：從 "Subscribe to Consultancy Bulletins" 改為 "免費課程諮詢" / "Book a Free Consultation"
2. **文案更新**：
   - tag："Stay Informed" → "Get Started" / "開始諮詢"
   - title："Subscribe to Consultancy Bulletins" → "預約免費課程諮詢" / "Book a Free Consultation"
   - description：改為描述一對一諮詢服務，例如 "Our team will help you find the right CPD courses for your career development."
3. **表單選項**（二選一，請人工決定）：
   - **方案 A**：保留 name + email 欄位，submit 後顯示「我們將尽快與您聯繫」成功訊息
   - **方案 B**：移除表單，改為大型 CTA 按鈕「立即諮詢」直接導向 `/${locale}/contact` 頁
4. **視覺調整**：深色背景從 slate-900 改為深翠綠（與品牌色一致），CTA 按鈕改為暖金色 accent
5. **字典同步**：更新 en/zh-hk/zh-cn 的 newsletterForm dict 鍵值，或重新命名該區段
6. **類型更新**：如有必要，更新 `types.ts` 中的 `NewsletterFormDict` 型別

## 驗收標準

- [ ] 首頁原訂閱區塊已變更為「課程諮詢」主題
- [ ] 所有 UI 字串來自 dict，無 hardcoded 文案
- [ ] 三種語系均已同步翻譯
- [ ] 表單提交（若保留）正確顯示成功狀態
- [ ] CTA 按鈕（方案 B）正確導向 contact 頁面
- [ ] 動線流暢：諮詢 → 填寫 → 聯繫

## 實作備註

- 若採方案 A（保留表單），建議將 placeholder 改為「姓名 / Name」與「電郵 / Email」，成功訊息改為「感謝您的查詢，我們將在 1-2 個工作日內與您聯繫」
- 若採方案 B（CTA 按鈕），可改為一個精簡的深色區塊 + 大按鈕
- Hero 與 Newsletter 之間可以考慮加入一個過渡漸層
- 此變更需要同步更新 3 個語系的 JSON + types.ts

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：提供首頁諮詢區塊的截圖（三種語言各一張）
- 安全性檢查：N/A

## 完成證據

- 變更的檔案：NewsletterForm.tsx、en.json、zh-hk.json、zh-cn.json、types.ts
- 執行過的指令：npm run typecheck、npm run lint、npm run build
- 測試輸出：無
- 螢幕截圖：三種語言的首頁諮詢區塊截圖
- 已知限制：表單提交仍是模擬，後續需實作 API 串接
- 後續任務：T-API-CONSULT-FORM（串接諮詢表單後端 API）