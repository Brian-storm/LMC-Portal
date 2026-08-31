# Mockup 決策 — Style Tile

## Metadata

- 功能：視覺風格方向 (Style Tiles)
- 畫面：全站視覺基調（色彩、字型、圓角、陰影、密度）
- 決策負責人：Human (via opencode)
- 狀態：已選定

## 變體總覽

| 變體 | 說明 | 檔案 |
|---|---|---|
| A | **Institutional Slate/Emerald（現狀）** — 深翠綠權威、琥珀點綴、高密度緊湊、邊框+陰影疊加。 | `ai/artifacts/專案設置/mockups/style-tile-a.html` |
| B | **Lighter, Airier** — 淺翠綠柔和、大量留白、純陰影層次、圓角 8px+、14px 正文。 | `ai/artifacts/專案設置/mockups/style-tile-b.html` |
| C | **Higher Contrast, Authoritative** — 近黑石板色、零圓角、2px 粗邊框、背景色區塊分層、800+ 字重標題。 | `ai/artifacts/專案設置/mockups/style-tile-c.html` |

## 設計 Token 對照

| Token | Variant A (Current) | Variant B (Airier) | Variant C (Authority) |
|---|---|---|---|
| Primary | `oklch(0.28 0.05 160)` | `oklch(0.40 0.06 158)` | `oklch(0.18 0.045 160)` |
| Background | `oklch(0.985 0.003 140)` | `oklch(0.99 0.002 150)` | `oklch(0.972 0.004 140)` |
| Foreground | `oklch(0.18 0.01 140)` | `oklch(0.22 0.015 155)` | `oklch(0.10 0.008 140)` |
| Accent | `oklch(0.72 0.11 85)` | `oklch(0.78 0.10 80)` | `oklch(0.78 0.14 85)` |
| Border | `oklch(0.90 0.01 140)` (1px) | `oklch(0.93 0.005 150)` (1px) | `oklch(0.82 0.015 140)` (2px) |
| Radius | `2px` (sharp) | `8px` (rounded) | `0px` (zero) |
| Shadow | Border + Shadow stacked | Shadow-only, 4 tiers | None — bg layers |
| Body size | `12px` | `14px` | `12px` |
| Heading weight | `700` | `700` | `800` |
| Density | Compact (12px card) | Spacious (24px card) | Structured (16px card) |
| Letter-spacing | `0.06em` on labels | Relaxed, minimal tracking | `0.08–0.12em` on labels |

## 比較矩陣

| 維度 | Variant A (Current) | Variant B (Airier) | Variant C (Authority) |
|---|---|---|---|
| **清晰度 (Clarity)** | 🟡 中等 — 緊湊資訊密度利於掃讀，但 12px 正文對部分用戶偏小 | 🟢 高 — 14px 正文 + 大量留白提升可讀性，資訊層次明確 | 🟡 中等 — 強對比利於快速辨識，但零圓角 + 全大寫標籤可能降低掃讀效率 |
| **權威感 (Authority)** | 🟢 高 — 深翠綠 + 琥珀點綴 + 緊湊邊框，具備法定機構的沉重感 | 🟡 中等偏低 — 柔和色調 + 圓角削弱權威感，偏向現代 SaaS 而非政府機構 | 🟢 最高 — 近黑石板色 + 零圓角 + 粗邊框，極強正式感，接近政府文件排版 |
| **無障礙 (Accessibility)** | 🟡 中等 — 對比度可達 WCAG AA，但 12px 正文較小；依賴顏色傳達狀態資訊 | 🟢 高 — 14px 正文 + clear focus ring + 較大觸控區域；淺色模式下背景/前景對比稍弱 (L=0.22 vs L=0.99) | 🟢 最高對比 — FG L=0.10 vs BG L=0.972，對比度 > 10:1；但 0px 圓角可能影響部分使用者對互動元素的辨識 |
| **實作成本 (Implementation Effort)** | 🟢 最低 — 現有 globals.css token 無需變更，僅需形式化；所有元件已依此風格建立 | 🟡 中等 — 需全站調整 token 值 (primary/border/radius/shadow)；密度的調整需逐一元件確認 | 🟡 中等 — 需全站調整 token 值 (primary L=0.18, border 2px, radius=0)；零圓角需要重新審查所有元件的視覺一致性 |

## 各變體優缺點

### Variant A: Institutional Slate/Emerald (Current)

**優點：**
- 零實作成本 — 所有現有元件已符合此風格
- 已在 `globals.css` 中完整定義 design token
- 深翠綠 + 琥珀配色已建立品牌辨識度
- 邊框+陰影疊加提供豐富深度資訊
- 緊湊密度適合 CPD 課程卡這類資訊密集的內容

**風險：**
- 邊框+陰影疊加違反 design-craft 深度原則（應三選一）
- 12px 正文對無障礙規範略小
- `rounded-xs` (2px) 在部分瀏覽器可能顯得參差不齊
- 部分 hex 值散落元件中 (如 `#1b4332`)，尚未完全統一為 token

### Variant B: Lighter, Airier

**優點：**
- 符合 design-craft 原則：陰影-only 深度、4px 間距網格、14px 正文
- 較高的無障礙表現：大字級 + clear focus ring + 充足留白
- 現代 SaaS 審美，參考 Linear/Vercel 等頂級產品
- 圓角 + 柔和色調降低視覺疲勞

**風險：**
- 可能削弱「法定培訓機構」的權威感
- 需全站 token 重建，為期較長
- 留白增加導致資訊密度降低，課程列表可能需要重新排版
- 與現有 CPD 課程卡的「法定註冊格式」定位衝突

### Variant C: Higher Contrast, Authoritative

**優點：**
- 最高權威感：零圓角、粗邊框、近黑文字，接近政府公文
- 最高對比度 (FG L=0.10)，極佳無障礙表現
- 背景色區塊分層替代陰影，結構清晰
- 強字重層級 (400→500→700→800) 資訊層次分明

**風險：**
- 零圓角可能顯得過於冰冷、缺乏親和力
- 2px 粗邊框 + 背景分層在行動裝置可能顯得擁擠
- 全大寫標籤 + 寬字距可能降低中文可讀性
- 視覺風格與現有 `globals.css` 差異最大，實作成本最高
- 可能讓 CPD 學習平台看起來像稅務/監管網站

## 設計系統對照

- 重用的 token／元件：所有變體均基於 oklch 色彩空間、Montserrat 字型、Tailwind CSS v4 + shadcn/ui 元件庫。Variant A 直接使用現有 token。
- 新做並登記回 inventory 的元件：無（style tile 階段僅展示風格方向，不涉及新元件）

## 選定的變體

- 變體：**Variant A — Institutional Slate/Emerald (Current)**
- 為何選這個：零遷移成本、品牌辨識度已建立、符合法定培訓機構定位、globals.css design token 已完整定義。
- 實作前要求的修改：無。後續 tasks (PS-009+) 可選擇性吸收 Variant B 的無障礙改善 (正文 13px、統一深度策略、16px padding)。

## 人工核准

- 核准者：Human
- 日期：2026-09-01
- 備註：風格方向確認為 Institutional Slate/Emerald。Deep emerald primary (#1b4332 equivalent), amber accent, compact density, border+shadow stacked depth。