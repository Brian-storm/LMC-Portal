# Mockup 決策 — Admin Layout

## Metadata

- 功能：管理後台 (KPIs + Audit Table + Course Management)
- 畫面：Admin Dashboard Layout
- 決策負責人：Human (via opencode)
- 狀態：已選定

## 變體

| 變體 | 說明 | 檔案 |
|---|---|---|
| A | **Top KPIs + Full-Width Tables** — 頂部導航 bar 含 tabs (Dashboard/Courses/Enrolments/Reports)。KPI 橫排 4 卡 (icon + value)。全寬 audit table (搜尋/過濾/匯出/行內操作)。全寬 course management table。行內操作按鈕 (Verify/View/Edit)。 | `admin-layout-variant-a.html` |
| B | **Split View: Side Nav + Table + Detail Panel** — 左側 sidebar nav (Overview/Management/Reporting)。KPI 橫幅 banner (中置數字)。Enrolment 分割視圖: 左側 table (可按 status chip 過濾) + 右側 detail panel (選中項目顯示完整資訊 + Verify/Reject 操作)。Course management 含 enrolled count + status chips 過濾。 | `admin-layout-variant-b.html` |

## 設計系統對照

- 重用的 token／元件：`--primary`, `--accent`, `--border`, `--surface`, `--surface2`, `--destructive`, `--secondary`, badge variants (success/warning/danger), button variants (btn/btn-outline/btn-sm), table component, kpi-card pattern, monospace font for reference codes
- 新做並登記回 inventory 的元件：無

## 比較矩陣

| 維度 | Variant A (Top KPIs + Tables) | Variant B (Split View) |
|---|---|---|
| **資料操作效率** | 中等 — 全寬 table 適合批量瀏覽，但需打開 modal/dialog 查看詳情 | 高 — split view 免切換即可查看詳情，單頁完成 Verify/Reject |
| **資訊密度** | 高 — 全寬 table 顯示最多 columns | 中等 — table 僅顯示關鍵 columns，詳情在右側 panel |
| **導覽清晰度** | 好 — 頂部 tabs 直覺 | 高 — sidebar nav 可擴展更多管理區塊 |
| **實作成本** | 低 — 現有 admin page.tsx 已接近此設計 | 中等 — split view + detail panel + chip filter 需新建 |
| **可擴充性** | 中等 — 頂部 tabs 有限空間 (最多 5-6 個) | 高 — sidebar nav 可無限擴展，支援巢狀選單 |
| **批次處理** | 好 — 全寬 table 容易實作多選/批次操作 | 中等 — split view 偏向單筆操作 |

## 推薦

**推薦 Variant A** — 現有 admin page 已實作此佈局，適合批次審核的工作流程。Split view (Variant B) 的優點可在未來透過行內展開或側邊抽屜實現。

## 選定的變體

- 變體：**Variant B — Split View (Side Nav + Table + Detail Panel)**
- 為何選這個：Split view 無須切換即可查看詳情並執行 Verify/Reject，sidebar nav 可擴展更多管理區塊，chip filters 提升批次篩選效率。
- 實作前要求的修改：無

## 人工核准

- 核准者：Human
- 日期：2026-09-01
- 備註：選定 Split View 模式。Left sidebar nav (Overview/Management/Reporting) + right content with table + detail panel。