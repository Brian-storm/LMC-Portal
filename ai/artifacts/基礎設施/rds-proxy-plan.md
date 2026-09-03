# RDS Proxy 實作計畫

## 背景

AWS Amplify SSR (Lambda) 無法直接連線至 RDS PostgreSQL，因為 Lambda 的動態 IP 不在 RDS Security Group 的白名單中。初期測試時使用 `0.0.0.0/0`（強制 SSL）作為過渡方案，但正式環境應避免資料庫直接暴露於公網。

RDS Proxy 提供 AWS 原生的連線代理層，讓 Lambda 透過私有網路存取 RDS，無需公開 Security Group。

---

## 優點與缺點

### 優點

| 項目 | 說明 |
| --- | --- |
| **無需公開 Security Group** | RDS Proxy 位於 VPC 內部，RDS 只需允許 Proxy 的 Security Group 連線，無需 `0.0.0.0/0` |
| **IAM 認證** | Lambda 透過 IAM Role 認證連線到 Proxy，無需在環境變數中儲存資料庫密碼 |
| **連線池管理** | Proxy 自動管理連線池，避免 Lambda 並行請求時耗盡 RDS 連線數（MaxConnections） |
| **故障轉移** | 若 RDS 發生容錯移轉，Proxy 自動連接到新的主要執行個體，應用層無需重試邏輯 |
| **CloudWatch 監控** | Proxy 提供專屬的連線監控指標（DBProxy 連線數、延遲等） |
| **低延遲** | Proxy 位於同一個 AWS 區域內，額外延遲極低（通常 <1ms） |

### 缺點

| 項目 | 說明 |
| --- | --- |
| **額外費用** | RDS Proxy 按小時計費（約 $0.015/hr × 24 × 30 ≈ $10.8/月） |
| **啟動冷延遲** | 首次連線或 Proxy 閒置後喚醒需 5–15 秒 |
| **Prisma 相容性** | Prisma 6.x 支援 `pgbouncer` 連線模式，但需設定 `connectionLimit=1` 以配合 Proxy 的連線管理 |
| **僅限 VPC** | Proxy 必須部署在 VPC 內部；若 Amplify 無 VPC 功能，則需建立 VPC 並設定 VPC peering |
| **IAM 憑證輪換** | 若使用 IAM 認證，需確保 Lambda 執行角色有對應的 `rds-db:connect` 權限 |

---

## 架構圖

```text
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│   Amplify SSR       │ ────> │   RDS Proxy          │ ────> │   RDS PostgreSQL │
│   (Lambda)          │       │   (VPC 內部)          │       │   (db.t4g.micro) │
│   IAM Role          │       │   Security Group:     │       │   Security Group:│
│   └ rds-db:connect  │       │   amplify-rds-sg      │       │   Proxy SG only  │
└─────────────────────┘       └──────────────────────┘       └──────────────────┘
```

流量路徑：
1. Amplify Lambda 使用 IAM Role 向 Proxy 發起 TLS 連線
2. Proxy 作為 PostgreSQL 的連線代理，將連線轉送至 RDS
3. RDS 的 Security Group 僅允許來自 Proxy 的連線（無 `0.0.0.0/0`）

---

## 實作步驟

### Step 1：建立 RDS Proxy

在 AWS Console 或 CLI 建立 Proxy：

```bash
aws rds create-db-proxy \
  --db-proxy-name lmc-cpd-proxy \
  --engine-family POSTGRESQL \
  --auth '[{"authScheme":"SECRETS","secretArn":"arn:aws:secretsmanager:...","iamAuth":"DISABLED"}]' \
  --role-arn arn:aws:iam::...:role/rds-proxy-role \
  --vpc-subnet-ids subnet-xxxx subnet-yyyy \
  --vpc-security-group-id sg-xxxx \
  --require-tls
```

**說明：**
- `--auth`：指定認證方式，可以使用 Secrets Manager 或 IAM
- `--role-arn`：Proxy 使用的 IAM Role（需有 `secretsmanager:GetSecretValue` 權限）
- `--vpc-subnet-ids`：至少兩個不同可用區的子網路
- `--vpc-security-group-id`：Proxy 的 Security Group（用於連線 RDS）

### Step 2：建立 Proxy 的 Security Group

建立一個新的 Security Group（例如 `rds-proxy-sg`），並在 RDS 的 Security Group 中加入一條規則：

| Type | Protocol | Port | Source | Description |
| --- | --- | --- | --- | --- |
| PostgreSQL | TCP | 5432 | `sg-xxxx`（rds-proxy-sg 的 ID） | Allow RDS Proxy |

### Step 3：建立 Secrets Manager 密碼（可選）

若使用 Secrets Manager 儲存資料庫密碼：

```bash
aws secretsmanager create-secret \
  --name lmc-cpd-db-credential \
  --secret-string '{"username":"postgres","password":"qiHmc2SskwvSQGN"}'
```

### Step 4：更新 Prisma 連線字串

將 `.env` 中的 `DATABASE_URL` 指向 Proxy 端點，而非直接指向 RDS：

```bash
# 原本（直接連線 RDS）
DATABASE_URL="postgresql://postgres:qiHmc2SskwvSQGN@lmc-cpd-database....rds.amazonaws.com:5432/postgres?sslmode=require"

# 改為（透過 Proxy）
DATABASE_URL="postgresql://postgres:qiHmc2SskwvSQGN@lmc-cpd-proxy.proxy-xxxx.ap-east-1.rds.amazonaws.com:5432/postgres?sslmoderedirect=true"
```

**注意：** Prisma 的連線池管理需配合 Proxy：
- 在 `prisma/schema.prisma` 中設定 `connectionLimit = 1`
- 或使用 `?pgbouncer=true` 連線參數（Prisma 6.x 支援）

### Step 5：更新 Amplify IAM Role

確保 Amplify 的 IAM 執行角色具有 `rds-db:connect` 權限（若使用 IAM 認證）：

```json
{
  "Effect": "Allow",
  "Action": "rds-db:connect",
  "Resource": "arn:aws:rds-db:ap-east-1:ACCOUNT_ID:dbuser:*/postgres"
}
```

### Step 6：更新 Amplify 環境變數

在 Amplify Console → Environment Variables 中更新 `DATABASE_URL` 為 Proxy 端點，並移除 `0.0.0.0/0` 的 Security Group 規則。

---

## 驗證方式

部署後檢查以下項目：

1. RDS 執行個體是否只有來自 Proxy 的連線（無 `0.0.0.0/0` 規則）
2. `GET /api/health` 是否回傳 `{"status":"ok","database":"connected"}`
3. 課程目錄頁是否能正常載入資料
4. CloudWatch Logs 中無 `Can't reach database server` 錯誤

---

## 已知風險與替代方案

| 風險 | 因應方式 |
| --- | --- |
| Amplify SSR 無原生 VPC 支援 | 需手動設定 VPC peering 或使用 Transit Gateway；或改用 AWS Lambda Function URL 搭配 VPC |
| Prisma 連線池不匹配 | 設定 `connectionLimit=1` 及 `?pgbonger=true` |
| Proxy 費用增加 | 若預算有限，可維持 `0.0.0.0/0` + SSL 方案，搭配 Fail2Ban 或 AWS WAF |
| Proxy 閒置冷啟動延遲 | 設定 `IdleClientTimeout` 為 30 分鐘，減少 Proxy 進入閒置狀態的頻率 |

---

## 過渡方案（若 RDS Proxy 暫不可行）

若因費用或時間限制暫不採用 RDS Proxy：

- 維持 `0.0.0.0/0` 規則，但限縮來源 IP 為 Amplify 的公告 IP 範圍（定期更新）
- 確保 `sslmode=require` 強制啟用（已設定）
- 使用強密碼（已設定：`qiHmc2SskwvSQGN`）
- 啟用 RDS 的 `log_connections` 參數，監控異常連線嘗試

---

## VPC 連線失敗紀錄

### 嘗試方式

嘗試透過 Security Group ID 作為 RDS Inbound Rule 的來源，將 Lambda 限定在 VPC 內部連線。

### 阻礙

- **Amplify Console 無 VPC 設定選項**— Amplify Gen 1 Hosting (Next.js SSR) 的 Web Compute 模式不直接暴露 VPC 設定介面
- **Security Group ID 規則錯誤**— AWS 不允許在既有的 IPv4 CIDR 規則中直接指定 Security Group ID；必須分開為獨立的規則，且規則的來源必須指向 Lambda 的 Security Group，但 Amplify 不提供此選項
- **無 dedicated Amplify SSR IP ranges**— AWS IP ranges 中 `ap-east-1` 的 `LAMBDA` 服務無公開的 CIDR，無法透過 IP whitelist 精準控管

### 結論

在不使用 VPC 的情況下，RDS Proxy 是唯一能讓資料庫保持私有、同時讓 Lambda 安全連線的方案。若 RDS Proxy 因費用或時間因素暫不導入，`0.0.0.0/0` + SSL + 強密碼是目前可行的過渡方案。