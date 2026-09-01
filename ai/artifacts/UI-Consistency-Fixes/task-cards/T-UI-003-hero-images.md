# AI-Ready 任務卡

## Metadata

- 任務：替換與補充 Hero Carousel 圖片素材（T-UI-003）
- 上層規格：HERO-IMAGES
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為訪客，我希望 Hero Carousel 中的圖片與香港金融/保險培訓產業相關，視覺上更貼近品牌定位
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：就緒
- 風險等級：低
- Agent owner：待指定
- 人工核准者：待指定

## 目標

將 Hero Carousel 中 3 張通用 Unsplash 圖片替換為與 LMC 業務（香港金融/保險業 CPD 培訓、企業顧問）更相關的高品質圖片，維持現有版面與自動輪播機制。

## 情境包（Context Pack）

- 相關檔案：`src/components/home/HeroCarousel.tsx`（DEFAULT_SLIDES 中的 image URL）、`src/dictionaries/en.json`（heroCarousel 段落）
- 既有模式：3 張 slide 各有獨立的 Unsplash URL，圖片為 bg-cover 搭配深色 overlay
- 假設：Unsplash 為可接受的外部圖源，不需自備圖檔
- 未知事項：人工核准者偏好的圖片主題方向
- 允許變更的檔案：`src/components/home/HeroCarousel.tsx`（僅 DEFAULT_SLIDES 的 image URL）
- 不得觸碰：Carousel 動畫邏輯、dict 結構、slide 數量、CTA 連結

## 需求

建議圖片主題方向（請人工選擇或提供替代方案）：

1. **Slide 1 — 專業培訓場景**：現代化教室/培訓室中的專業人士，如 `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600`（專業培訓討論）
2. **Slide 1 替代 — 香港金融場景**：香港中環/金融區天際線，如 `https://images.unsplash.com/photo-1557072077-e1e6e92b0c8c?q=80&w=1600`
3. **Slide 2 — 線上學習/數位轉型**：專業人士使用平板/筆電學習，如 `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600`
4. **Slide 3 — 證書/認證/成就**：畢業帽或證書相關，如 `https://images.unsplash.com/photo-1523050854058-8df90110c7f1?q=80&w=1600`

## 驗收標準

- [ ] 3 張 slide 圖片皆已更換為建議的主題圖片
- [ ] 圖片載入後正確顯示（bg-cover、無破版）
- [ ] 所有 overlay 與文字依然清晰可讀
- [ ] 圖片回應式顯示正常（mobile/tablet/desktop）
- [ ] 輪播自動播放與指示器不受影響

## 實作備註

- 僅需修改 `src/components/home/HeroCarousel.tsx` 中 `DEFAULT_SLIDES` 的 `image` 欄位
- 每張圖片建議維持 `q=80&w=1600&auto=format&fit=crop` 參數以優化載入
- Unsplash 是外部 CDN，無版權問題但建議下載備份至 `/public/images/hero/` 目錄以確保穩定

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：提供首頁 Hero Carousel 三張 slide 的截圖
- 安全性檢查：N/A

## 完成證據

- 變更的檔案：`HeroCarousel.tsx`（僅 URL）
- 執行過的指令：npm run lint、npm run build
- 測試輸出：無
- 螢幕截圖：三張 slide 各一張桌面截圖
- 已知限制：若圖片 URL 失效需更換來源
- 後續任務：無