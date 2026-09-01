# Mockup 決策 — Public-Facing Layout

## Metadata

- 功能：公開頁面版面 (Home, Course Catalog, Course Detail, Enrollment, Login)
- 畫面：Public Interface Layout
- 決策負責人：Human (via opencode)
- 狀態：已選定（保留現有實作）

## 變體

| 變體 | 說明 | 檔案 |
|---|---|---|
| A | **Stacked Sections** — 垂直堆疊區塊：Navbar → Hero → Credentials → Feature Cards。課程目錄 sidebar filter + 垂直列表。Detail 兩欄。Enrollment step wizard。Login 置中卡片。 | `public-layout-variant-a.html` |
| B | **Card-First Modular** — Split hero, 2-col card grid, tabbed detail, horizontal wizard + summary sidebar, split login。 | `public-layout-variant-b.html` |

## 設計系統對照

- 重用的 token／元件：`--primary`, `--accent`, `--border`, `--surface`, `--surface2`, `--secondary`, `--muted-fg`, badge variants, button variants, course-card, navbar, `rounded-xs`
- 新做並登記回 inventory 的元件：無

## 比較矩陣

| 維度 | Variant A (Stacked) | Variant B (Card-First) |
|---|---|---|
| **資訊密度** | 中等 | 較低 |
| **瀏覽體驗** | 垂直滾動自然 | 水平分割利用寬螢幕 |
| **行動裝置適應** | 好 | 中等 |
| **實作成本** | 低（現有） | 中等 |
| **品牌一致性** | 高 | 中等 |

## 選定的變體

- 變體：**保留現有實作（等同 Variant A）**
- 為何選這個：現有 demo 實作已符合 Variant A stacked sections 風格，無需 mockup 階段變更。Navbar + Hero + Credentials + Feature Cards + Course Catalog (sidebar + list) + Detail (two-column) + Step Wizard + Centered Login 均已就位。
- 實作前要求的修改：無

## 人工核准

- 核准者：Human
- 日期：2026-09-01
- 備註：現有 public-facing 頁面保留不變。