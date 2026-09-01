# Mockup 決策 — Portal/Dashboard Layout

## Metadata

- 功能：學生/客戶入口儀表板 (Sidebar + Dashboard Cards + Enrolments List)
- 畫面：Portal Dashboard Layout
- 決策負責人：Human (via opencode)
- 狀態：已選定

## 變體

| 變體 | 說明 | 檔案 |
|---|---|---|
| A | **Sidebar Left + Content** — 深色 sidebar (sidebar-bg: var(--sidebar)) 左側固定 + 頂部 subbar (user info) + 內容區。儀表板: 4-KPI row → CPD progress bar → 雙欄 (recent enrolments table + upcoming/actions sidebar cards)。 | `portal-layout-variant-a.html` |
| B | **Collapsible Sidebar + Grid-First** — 頂部導航欄整合 tabs + icon-only collapsed sidebar (56px)。儀表板: 4-KPI border-top cards → 3 欄 (2-span table + progress + timeline + actions)。 | `portal-layout-variant-b.html` |

## 設計系統對照

- 重用的 token／元件：`--sidebar-bg`, `--sidebar-fg`, `--primary`, `--accent`, `--border`, `--surface`, `--surface2`, `--destructive`, badge variants, button variants, table component, progress bar pattern
- 新做並登記回 inventory 的元件：無

## 比較矩陣

| 維度 | Variant A (Sidebar Left) | Variant B (Grid-First) |
|---|---|---|
| **導覽清晰度** | 高 — 完整 sidebar menu | 中等 — tabs + icon-only |
| **空間利用** | 中等 | 高 |
| **資訊密度** | 高 | 最高 |
| **實作成本** | 低（現有） | 中等 |
| **品牌一致性** | 高 | 高 |

## 選定的變體

- 變體：**Variant A — Sidebar Left + Content**
- 為何選這個：現有 portal layout 已完整實作，零遷移成本。深色 sidebar 導覽對 IA compliance 資料最為友善。
- 實作前要求的修改：無

## 人工核准

- 核准者：Human
- 日期：2026-09-01
- 備註：Dark sidebar (220px) + subbar + content area with KPI row and dual-column layout。