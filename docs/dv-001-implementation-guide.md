# DV-001：Local Docker PostgreSQL 開發資料庫 — 實作紀錄

這份文件說明 DV-001 做了哪些變更、為什麼這樣做，以及每個步驟的用意。適合不熟悉 Docker 或 Prisma 的開發者閱讀。

---

## 問題背景

這個專案使用 PostgreSQL 資料庫。原本 `.env.example` 裡面的 `DATABASE_URL` 直接指向 production 的 AWS RDS（正式資料庫），意思是：

- 開發時只要跑 `npx prisma migrate dev`，就會**直接改到正式資料庫的結構**
- 萬一寫了壞的 migration，production 的資料可能會毀掉
- 開發者也需要連接到 AWS RDS 才能工作，但並非人人都有權限

**目標：** 建立一個本地專用的 PostgreSQL，開發時連本地資料庫，production 連線留給正式環境用。

---

## 變更 1：新增 `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16            # 使用 PostgreSQL 16 版映像檔
    container_name: lmc-cpd-postgres
    ports:
      - "5432:5432"               # 本機 5432 埠 → 容器 5432 埠
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: lmc_cpd        # 自動建立名為 lmc_cpd 的資料庫
    volumes:
      - postgres_data:/var/lib/postgresql/data  # 資料持久化（容器重啟後資料還在）
```

**什麼是 Docker Compose？**  
一個工具，用 YAML 描述「需要哪些服務」。這裡只定義了一個 PostgreSQL 容器。執行 `docker compose up -d` 就會下載 PostgreSQL 映像檔並啟動，像在電腦裡開了一台專屬的資料庫伺服器。

**為什麼用 Docker 而不是本機安裝 PostgreSQL？**  
- 不需要在自己的電腦安裝 PostgreSQL（避免版本衝突）
- 跟其他專案隔離
- 刪掉容器 = 清空資料庫，不會殘留

---

## 變更 2：更新 `package.json` — 新增 npm scripts

```json
"db:start": "docker compose up -d",
"db:stop": "docker compose down",
"db:reset": "docker compose down -v && docker compose up -d",
"db:migrate": "npx prisma migrate dev"
```

| 指令 | 作用 |
|---|---|
| `npm run db:start` | 啟動 PostgreSQL 容器（背景執行） |
| `npm run db:stop` | 停止容器（資料保留） |
| `npm run db:reset` | 刪除容器 + 清除所有資料 → 重新啟動（從零開始） |
| `npm run db:migrate` | 執行 Prisma migration（建立／更新資料表） |

**為什麼要寫成 npm script？**  
開發者不需要記 Docker 指令，只要 `npm run db:start` 就好。這也確保團隊成員用同一組指令。

---

## 變更 3：更新 `.env.example`

**Before：**
```
# DATABASE_URL=postgresql://postgres:password@localhost:5432/lmc_cpd  ← 註解掉
...
DATABASE_URL="postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/..."  ← active
```

**After：**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/lmc_cpd   ← active
...
# DATABASE_URL="postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/..." ← 註解掉
```

**為什麼要交換？**  
因為 `.env.example` 是開發者複製成 `.env` 的樣板。預設應該連本地資料庫，這樣新加入的開發者不會意外操作到 production RDS。等到真的要上 production 時，再把 RDS 那行打開。

---

## 變更 4：更新 `AGENTS.md`

在 Commands 段落加入 DB 相關指令說明，讓開發者（或 AI agent）一看就知道有哪些可用指令。

---

## 補充：Seed 資料庫（填入測試資料）

Migration 只建立「空的資料表結構」，資料表裡面是空的。**Seed** 才是填入測試資料（課程、講師、學員帳號等）。

**原始指令：**
```bash
npx tsx prisma/seed.ts
```

- `npx` — 執行 npm 套件裡的指令，不需要全域安裝
- `tsx` — TypeScript Execute，讓 Node.js 可以直接執行 `.ts` 檔（不用先編譯）
- `prisma/seed.ts` — 就是 seed 程式本體

**package.json 捷徑（Prisma 自動偵測）：**

在 `package.json` 裡面有一行：
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

這讓 Prisma 知道 seed 指令是什麼。所以你也可以用：
```bash
npx prisma db seed
```

Prisma 會自動讀 `package.json` 裡的設定來執行 seed。

**差別在哪？**
| 方式 | 指令 | 什麼時候用 |
|---|---|---|
| 直接執行 | `npx tsx prisma/seed.ts` | 隨時想跑就跑 |
| Prisma 捷徑 | `npx prisma db seed` | 跑完 migrate 後順便 seed（自動偵測） |

做完 migration 後建議跑一次 seed，這樣開發時才有資料可以看。

---

## 驗證

執行 `npm run lint` 和 `npm run typecheck` 都無錯誤，確認改動沒有破壞程式碼品質。

---

## 總結：做完 DV-001 後你的開發流程

1. `cp .env.example .env`（第一次，建立自己的環境變數檔）
2. `npm run db:start`（啟動本地 PostgreSQL）
3. `npm run db:migrate`（建立資料表）
4. `npm run dev`（啟動開發伺服器）
5. 開發完 `npm run db:stop`（關閉資料庫）

之後所有 `prisma migrate dev` 都只影響本地資料庫，production RDS 完全不受干擾。