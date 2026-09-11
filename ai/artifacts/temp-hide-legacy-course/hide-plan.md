# 暫時隱藏 Legacy 傳承規劃課程 (cpd-101) 計劃

## 現況

| slug | 名稱 (zh) | 價格 | status | 行為 |
|---|---|---|---|---|
| `cpd-101` | 傳承規劃證書課程 | HK$2,800 | `FEW_SEATS` | ⛔ 要隱藏 |
| `cpd-102` | 香港醫療體制發展…證書課程 | HK$1,500 | `OPEN` | ✅ 保留 |

資料流程：

```
courses/page.tsx (server) ──fetch──→ GET /api/courses ──prisma──→ DB ({ isOpen: true })
                                         │
CoursesView (client) ──fetch──→ GET /api/courses (same)
                                         │
CourseDetailView ──fetch──→ GET /api/courses/[slug] ── 有 !course.isOpen 404 check
                                         │
EnrollmentWizard ──fetch──→ GET /api/courses/[slug] (same detail endpoint)
```

---

## 方案 A：資料庫層面 — 設 `isOpen = false`（最乾淨，但有副作用）

**作法**：用 Prisma Studio 或 migration 將 `cpd-101` 的 `isOpen` 設為 `false`。

**影響範圍**：
| 位置 | 行為 |
|---|---|
| `GET /api/courses` | ✅ 已內建 `where: { isOpen: true }`，自動排除 |
| `GET /api/courses/[slug]` | ✅ 已內建 `if (!course.isOpen) return 404`，回傳 404 |
| 課程列表頁 | ✅ 完全看不到 |
| 課程詳情頁 `/courses/cpd-101` | ✅ Client 端會顯示「Course not found」錯誤 |
| 報名頁 `/courses/cpd-101/enroll` | ✅ Client 端會顯示「Course not found」錯誤 |

**復原方式**：設回 `isOpen = true`。

**優點**：動一串全身，不需要改程式碼。
**缺點**：需有 DB 連線權限；報名頁會跳出錯誤訊息（使用者體驗不佳）；不是純 frontend 操作。

---

## 方案 B：API 路由層面 — 在 `GET /api/courses` 排除特定 slug（推薦）

**作法**：在 `src/app/api/courses/route.ts` 的 `where` 物件內加一行：

```typescript
const where: Prisma.CourseWhereInput = {
  isOpen: true,
  // TODO: 暫時排除 legacy 課程 — 復原後刪除此行
  NOT: { slug: "cpd-101" },
};
```

**影響範圍**：
| 位置 | 行為 |
|---|---|
| 課程列表頁 | ✅ 完全排除，cards 不出現 |
| 詳情頁 `/courses/cpd-101` | ⚠️ 仍可直接輸入 URL 造訪（獨立 API 無過濾） |
| 報名頁 `/courses/cpd-101/enroll` | ⚠️ 仍可造訪 |
| 管理者後台 | ⚠️ 不受影響（admin 頁面可能是獨立 API） |

**需額外處理**：如果想連詳情頁也封鎖，需同步修改 `src/app/api/courses/[slug]/route.ts`，對 slug `cpd-101` 回傳 404：

```typescript
// TODO: 暫時排除 legacy 課程
if (slug === "cpd-101") {
  return NextResponse.json({ error: "Course not found" }, { status: 404 });
}
```

同理，報名頁因為依賴同一個 detail API，也會跟著被封鎖（顯示「Course not found」）。

**優點**：前後端分離，改動最少。
**缺點**：需改兩處 API route；詳情頁/報名頁的錯誤訊息對使用者不友善。

---

## 方案 C：Client 端過濾（最輕量，Frontend-only）

**作法**：在 `src/components/courses/CoursesView.tsx` 的 `fetchCourses` callback 以及初始資料處理處過濾掉 `cpd-101`。

1. 在 `CoursesView` 的 `useState(initialCourses)` 之後或 useEffect 中過濾：

```typescript
// 只保留醫療課程 — cpd-101 是 legacy，暫時隱藏
const activeCourses = useMemo(
  () => courses.filter((c) => c.slug !== "cpd-101"),
  [courses],
);
```

然後將 `activeCourses` 傳入 `filteredCourses` 的 upstream。

2. 修改「現行課程登記冊」bar：
   - 移除 `{dict.totalListings}` 那行文字（右側總數）
   - 將 `{dict.activeRegister}` 改為直接顯示「現行課程」

3. 字典檔更新（三語）：

| locale | `activeRegister` 新值 | 移除 |
|---|---|---|
| zh-hk.json | `"現行課程"` | `totalListings` key 可保留（反正不用） |
| en.json | `"Active Course"` | 同上 |
| zh-cn.json | `"现行课程"` | 同上 |

**影響範圍**：
| 位置 | 行為 |
|---|---|
| 課程列表頁 | ✅ 卡片不出現，bar 文字變更，無總數 |
| 詳情頁 `/courses/cpd-101` | ❌ 仍可造訪 |
| 報名頁 `/courses/cpd-101/enroll` | ❌ 仍可造訪 |

**優點**：只改 frontend，最快；不需 DB 或 API 變更；復原只需 revert 或刪除過濾。
**缺點**：直接 URL 仍可訪問詳情頁與報名頁（但使用者無法從列表點進去）。

---

## 方案 D：Client 端 + URL 阻擋（最完整 Frontend-only）

**作法**：方案 C 的基礎上，在 `CourseDetailView` 和 `EnrollmentWizard` 中也加上 slug 檢查，若為 `cpd-101` 則顯示「課程暫停開課」訊息而非實際內容。

在 `CourseDetailView.tsx` （初始載入後判斷 slug）：

```typescript
// TODO: 暫時隱藏 legacy 課程
if (slug === "cpd-101" || !course) {
  return (
    <div className="...">
      <h2>此課程目前暫停開課</h2>
      <Link href={`/${locale}/courses`}>瀏覽其他課程</Link>
    </div>
  );
}
```

在 `EnrollmentWizard.tsx` 已有 `courseError` 處理，只需在 slug 匹配時主動 set error：

```typescript
useEffect(() => {
  // TODO: 暫時隱藏 legacy 課程
  if (slug === "cpd-101") {
    setCourseError(dict.courseUnavailable);
    setCourseLoading(false);
    return;
  }
  // ... 原本的 fetch
}, [slug]);
```

**影響範圍**：全面 — 列表、詳情、報名頁全部阻擋。友善訊息而非 404。

**優點**：對使用者友善；復原容易；無後端變更。
**缺點**：需改 3 個 component 檔案。

---

## 方案 E：Menu 隱藏（社交工程層級）

**作法**：不修改任何商業邏輯，僅移除 `CourseCard` 中指向 legacy 課程的那張卡片。在 `CourseList.tsx` 的 `courses.map()` 中加入：

```typescript
// TODO: 暫時隱藏 legacy 課程
{courses
  .filter((c) => c.slug !== "cpd-101")
  .map((course) => (...))
}
```

**影響範圍**：
| 位置 | 行為 |
|---|---|
| 課程列表 | ✅ 卡片不出現 |
| 列表 bar 總數 | ⚠️ `totalCount` 仍包含 legacy（需額外 `totalCount - 1`） |
| 詳情頁/報名頁 | ❌ 仍可造訪 |

**優點**：極簡，只改 `CourseList.tsx` 一行 filter。
**缺點**：半套；總數會多 1；詳情頁仍可進。

---

## 推薦方案：方案 D

組合：

```
[Component]            [File]                           [Change]
──────────────────────────────────────────────────────────────────────
CoursesView            src/components/courses/          加 filter 排除 slug
                       CoursesView.tsx                  + 改 totalCount 傳入值
CourseList             src/components/courses/          移除 totalListings 文字
                       CourseList.tsx                   改 activeRegister 為 "現行課程"
CourseDetailView       src/components/courses/          開頭 slug 檢查 → 顯示暫停訊息
                       CourseDetailView.tsx
EnrollmentWizard       src/components/enrollment/       開頭 slug 檢查 → 顯示暫停訊息
                       EnrollmentWizard.tsx
字典                   zh-hk.json / en.json             改 activeRegister 值
                       / zh-cn.json                     (或直接 hardcode props)
```

### Rollback plan

移除所有加 `TODO: 暫時` 的程式片段 + revert 字典檔變更。預估 5 分鐘。

### 未解決風險

- admin 後台的課程管理頁仍可看到 `cpd-101`
- portal 學員 dashboard 若已報名 legacy 課程，不受影響
- 直接 URL `http://localhost:3000/zh-hk/courses/cpd-101` 若方案 D 的 protect 沒加，仍可造訪