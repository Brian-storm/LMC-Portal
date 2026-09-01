# 畫面規格 — Design Token 色票調整（Style Tile）

## Metadata

- 功能：UI 色票系統調整（T-UI-002）
- 畫面：全站所有頁面（style tile 展示 token 級變更）
- 狀態：mockup 已產出待核准

## 目的

將全站 CSS 變數中的 oklch 色票參數調整為更明亮、溫暖的調性，提升可讀性，解決現有 UI「太暗太沉悶」的問題。不偏離 institutional slate/emerald 品牌識別。

## 版面配置

- 非版面級變更 — 此為 style tile（視覺方向），影響所有頁面的色彩、對比、邊框、陰影
- 主要影響區域：background、卡片、邊框、按鈕、深色 CTA 區塊、文字對比

## 狀態

| 狀態 | 必要行為 | 空狀態／錯誤文案 | 驗證方式 |
|---|---|---|---|
| 預設 | 所有 CSS 變數套入 :root 區塊 | N/A | 螢幕截圖比對 |
| 行動裝置版 | N/A（響應式不受影響） | N/A | 螢幕截圖 |

## 互動

| 動作 | 觸發條件 | 結果 | 失敗情境 |
|---|---|---|---|
| 色票調整 | 人工選定變體後 | 更新 globals.css :root 變數 | 型別檢查/Lint/Build 失敗 |

## 設計系統對照

- 用到的既有 design token：所有 :root 區塊的 CSS 變數（primary, background, card, muted, border, accent, secondary, success 等）
- 用到的既有元件：全站所有元件（按鈕、卡片、導航、表單等），無新元件
- 本畫面新做的元件：無

## 視覺驗收標準

- 品牌 emerald 色調保留，不偏離 institutional 定位
- 背景不再冷白，加入輕微暖色調
- 卡片／邊框使用暖灰取代中性灰
- 文字對比度符合 WCAG AA（12px 以上清晰可讀）
- 深色區塊（Newsletter / Hero）使用品牌深翠綠而非 slate 灰
- 三個 HTML 變體皆以設計 craft 原則製作