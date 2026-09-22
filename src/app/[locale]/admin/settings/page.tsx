"use client";

import { useFeatureFlags } from "@/components/admin/FeatureFlagsContext";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useState } from "react";

export default function SettingsPage() {
  const dict = useAdminDict();
  const { flags, loading, error, toggle } = useFeatureFlags();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (key: string, enabled: boolean) => {
    setToggling(key);
    try {
      await toggle(key, enabled);
    } catch {
      // Error already logged in context
    } finally {
      setToggling(null);
    }
  };

  const settingsDict = (dict as Record<string, unknown>).settings as Record<string, string> | undefined;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <AdminPageHeader title={settingsDict?.title ?? "Settings"} />

      {loading && (
        <div className="text-xs text-slate-500 mt-4">{settingsDict?.loading ?? "Loading..."}</div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && flags.length === 0 && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xs text-xs text-slate-500">
          {settingsDict?.noFlags ?? "No feature flags found."}
        </div>
      )}

      {!loading && !error && flags.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
            {settingsDict?.sectionTitle ?? "Feature Flags"}
          </p>
          {flags.map((flag) => (
            <div
              key={flag.key}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xs"
            >
              <div className="min-w-0 mr-3">
                <div className="text-xs font-bold text-slate-800">{flag.key}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{flag.description}</div>
              </div>
              <button
                onClick={() => handleToggle(flag.key, !flag.enabled)}
                disabled={toggling === flag.key}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  flag.enabled ? "bg-emerald-600" : "bg-slate-300"
                } ${toggling === flag.key ? "opacity-50" : ""}`}
                role="switch"
                aria-checked={flag.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    flag.enabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}