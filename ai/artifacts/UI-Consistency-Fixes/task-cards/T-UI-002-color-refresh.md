# AI-Ready 任務卡

## Metadata

- 任務：調整 UI 色票系統提升可讀性與舒適度（T-UI-002）
- 上層規格：COLOR-REFRESH
- 上層 Epic：UI-Consistency-Fixes
- 上層 User Story：作為讀者，我希望頁面色彩不晦暗沉悶，閱讀起來舒適且資訊層次分明
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：mockup 已核准，待實作
- 風險等級：中
- Agent owner：待指定
- 人工核准者：User

## 目標

在不偏離 institutional slate/emerald 品牌調性的前提下，採用 **Variant C (Rich Jewel · Bold Personality)** 調整 CSS 變數中的色票參數。Variant C 為高飽和深翠綠 primary、暖 parchment 背景、較濃的邊框與陰影，視覺個性最強。

## 情境包（Context Pack）

- 相關檔案：`src/app/globals.css`（所有 :root 與 .dark 的 oklch 色票）、`src/components/home/NewsletterForm.tsx`（深色區塊）、`src/components/home/HeroCarousel.tsx`（dark overlay）
- 既有模式：全站色彩透過 globals.css 的 CSS 變數驅動；shadcn/ui 元件使用 `oklch()` 色票；主色 deep emerald `#1b4332` 對應 `oklch(0.28 0.05 160)`；accent 為暖金色 `oklch(0.72 0.11 85)`
- 假設：品牌色 deep emerald (#1b4332) 不可取代，但可調整其明度與彩度
- 未知事項：已解決（人工已選擇 Variant C）
- 相關 Mockup：`ai/artifacts/UI-Consistency-Fixes/mockups/style-tile-variant-c.html`
- Mockup 決策：`ai/artifacts/UI-Consistency-Fixes/mockup-decision-color-refresh.md`
- 允許變更的檔案：`src/app/globals.css`（僅 :root 區塊的色票變數）
- 不得觸碰：.dark 模式色票、元件庫結構、版面佈局

## 需求

1. **主色 (primary) 微調**：現有 `oklch(0.28 0.05 160)` 偏暗。提高明度至 ~0.32 並略增加彩度至 ~0.07，保留 emerald 調性但更醒目
2. **背景色 (background) 加暖**：現有 `oklch(0.985 0.003 140)` 偏冷白。加入極淡暖色調 (如 hue 往 80-90 微調)，讓白底更柔和
3. **卡片陰影與邊框**：新增 card-border 與 shadow 的暖灰色調，取代純中性灰
4. **accent 加強使用**：確保 accent（暖金）作為 CTA、標籤、高亮元素的主要點綴色，在頁面中有足夠出現頻率
5. **文字對比**：secondary/foreground 的對比度應符合 WCAG AA，確保 12px 字級仍可清楚閱讀
6. **Newsletter / Hero dark 區塊**：深色背景區（slate-900）改為較柔和的深翠綠（接近 #1b4332 但稍亮），取代純黑灰調

## 驗收標準

- [ ] 頁面整體不再感覺晦暗沉悶，文字可讀性提升
- [ ] 品牌 emerald 識別度保留，色票變更不偏離 institutional 調性
- [ ] 三種語言頁面呈現一致
- [ ] WCAG AA 對比度通過（可用瀏覽器 devtools 驗證）
- [ ] 沒有 CSS 回歸問題（按鈕、卡片、導航等正常顯示）

## 實作備註

- 使用 Variant C (Rich Jewel) 的 oklch 值（詳見 `mockups/style-tile-variant-c.html` 的 :root 區塊），**保留現有 `--radius: 0.625rem` 不改成 0.375rem**
- 精確調整清單（僅調整 :root 區）：
  - `--primary`: `0.28 0.05 160` → `0.35 0.09 148`
  - `--background`: `0.985 0.003 140` → `0.97 0.01 75`
  - `--card`: `1 0 0` → `0.99 0.008 80`
  - `--muted`: `0.94 0.01 140` → `0.91 0.02 75`
  - `--border`, `--input`: `0.90 0.01 140` → `0.85 0.025 75`
  - `--secondary`: `0.48 0.03 160` → `0.50 0.05 150`
  - `--card-foreground`, `--foreground`: `0.18 0.01 140` → `0.16 0.02 145`
  - `--muted-foreground`: `0.48 0.03 160` → `0.48 0.04 150`
  - `--accent`: `0.72 0.11 85` → `0.76 0.14 78`
  - `--success`: `0.55 0.10 155` → `0.57 0.14 145`
  - `--warning`: `0.75 0.12 82` → `0.78 0.14 75`
  - `--info`: `0.65 0.08 230` → `0.67 0.09 230`
  - `--destructive`: `0.577 0.245 27.325` → `0.62 0.22 27`
  - `--ring`: 維持不變
  - `--navbar-bg`: 維持不變（與 background 一致即可）
  - Newsletter 背景：`bg-slate-900` → `bg-[#1b4332]`（品牌深翠綠）
  - Hero overlay: `bg-slate-950/70` → `bg-emerald-950/60`
  - 按鈕 hover 加微 `translateY(-1px)` 效果（選擇性，可加在實作中）
- 保留 .dark 區塊不變
- 修改後執行 `npm run build` 確保無編譯錯誤

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：`npm run typecheck`
- Lint：`npm run lint`
- Build：`npm run build`
- 螢幕截圖：提供 before/after 首頁截圖（至少 3 個區塊：導航、Hero、Course Cards）
- 安全性檢查：N/A

## 完成證據

- 變更的檔案：`globals.css`、可能修改 HeroCarousel.tsx / NewsletterForm.tsx 中的 hardcoded bg 類別
- 執行過的指令：npm run typecheck、npm run lint、npm run build
- 測試輸出：無
- 螢幕截圖：before/after 對比截圖
- 已知限制：色票調整為一次性視覺判斷，後續可依回饋微調
- 後續任務：無