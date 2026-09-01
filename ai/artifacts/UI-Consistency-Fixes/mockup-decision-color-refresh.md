# Mockup 決策 — Design Token 色票調整

## Metadata

- 功能：UI 色票系統調整（T-UI-002）
- 畫面：全站 style tile
- 決策負責人：待指定
- 狀態：待定

## 變體

| 變體 | 說明 | 優點 | 風險 |
|---|---|---|---|
| **A · Warm Emerald** | 暖色背景 (oklch 80 hue)、高彩度 primary (0.07)、暖灰邊框、最高對比 | 最平衡的改善；閱讀舒適度提升明顯；深色區塊使用品牌深翠綠；accent 暖金出現頻率足夠 | 變動幅度中等，需注意原有 brand 色的識別度是否偏移 |
| **B · Cool Slate** | 冷色調背景 (oklch 180 hue)、較低彩度 primary (0.04)、純白卡片、最低視覺噪音 | 變動最小，風險最低；維持現有冷調性但更輕盈；border 最淡 (0.92) | 改善幅度可能不夠明顯；用戶抱怨「太暗」的問題可能未完全解決 |
| **C · Rich Jewel** | 暖 parchment 背景 (oklch 75 hue)、高彩度 primary (0.09)、最濃邊框 (0.85)、最大 shadow | 視覺個性最強；品牌印象最深刻；深色區塊最高飽和度 | 彩度偏高可能較快視覺疲勞；部分用戶可能覺得「太濃」 |

## 設計系統對照

- 重用的 token／元件：全站既有 CSS 變數（100% reuse），無新 token 或元件
- 新做並登記回 inventory 的元件：無

## 選定的變體

- 變體：**C · Rich Jewel · Bold Personality**
- 為何選這個：人工偏好高飽和度的品牌呈現，視覺個性強、印象深刻
- 實作前要求的修改：
  1. 保留現有 `--radius: 0.625rem`（不改成變體 C 的 0.375rem，因為非色彩變更）
  2. Hero overlay 與 Newsletter 深色區塊使用品牌深翠綠代替 slate-950/900
  3. 按鈕 hover 加微 translateY(-1px) 效果（提升互動回饋）

## 人工核准

請開啟以下三個 HTML 檔案在瀏覽器中比較，選擇您偏好的方向：

1. `ai/artifacts/UI-Consistency-Fixes/mockups/style-tile-variant-a.html` — **Warm Emerald · High Contrast**（推薦）
2. `ai/artifacts/UI-Consistency-Fixes/mockups/style-tile-variant-b.html` — **Cool Slate · Airy Minimal**
3. `ai/artifacts/UI-Consistency-Fixes/mockups/style-tile-variant-c.html` — **Rich Jewel · Bold Personality**

─
- 核准者：User (verbal approval)
- 日期：2026-09-01
- 備註：選擇 Variant C，保留現有 radius 不變；Hero/Newsletter 深色區塊改品牌深翠綠