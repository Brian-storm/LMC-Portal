"use client";

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface AdminFilterTabsProps {
  tabs: Tab[];
  selected: string;
  onChange: (value: string) => void;
}

export default function AdminFilterTabs({ tabs, selected, onChange }: AdminFilterTabsProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors ${
            selected === tab.value
              ? "bg-primary text-primary-foreground"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-[10px] opacity-70">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}