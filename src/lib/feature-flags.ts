import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * All known feature flags for the platform.
 * Add new flags here as the key name — the DB row is auto-created on first check.
 */
export const FEATURE_FLAGS = {
  ff_faq: "FAQ 系統（AF-001 ~ AF-004）",
  ff_chatbot: "網站聊天機器人（AF-005 ~ AF-007）",
  ff_whatsapp: "WhatsApp Business 整合（AF-008 ~ AF-009）",
  ff_certificates: "自動化證書系統（AF-010 ~ AF-012）",
  ff_alipay: "Alipay 金流整合（AF-013 ~ AF-015）",
  ff_email_system: "SES 郵件系統正式化（AF-016 ~ AF-018）",
  ff_data_import_export: "資料匯入匯出（AF-019 ~ AF-022）",
  ff_analytics_dashboard: "進階分析儀表板（AF-023）",
  ff_bulk_email: "批量電郵活動（AF-024 ~ AF-025）",
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

const flagCache = new Map<string, boolean>();

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  if (flagCache.has(key)) {
    return flagCache.get(key)!;
  }
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      await prisma.featureFlag.create({
        data: { key, enabled: false, description: FEATURE_FLAGS[key] },
      });
      flagCache.set(key, false);
      return false;
    }
    flagCache.set(key, flag.enabled);
    return flag.enabled;
  } catch {
    return false;
  }
}

export async function getAllFeatureFlags() {
  const rows = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  const existing = new Set(rows.map((r) => r.key));
  const missing = Object.entries(FEATURE_FLAGS)
    .filter(([k]) => !existing.has(k))
    .map(([key, description]) => ({ key, enabled: false, description }));
  if (missing.length > 0) {
    await prisma.featureFlag.createMany({ data: missing, skipDuplicates: true });
    rows.push(
      ...missing.map((m) => ({
        ...m,
        updatedAt: new Date(),
      })),
    );
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key));
}

export function clearFeatureFlagCache() {
  flagCache.clear();
}