"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { generalFaqCategoryCreateSchema } from "@/lib/validation/faq";
import type { GeneralFaqCategoryCreateInput } from "@/lib/validation/faq";

export type FaqCategoryFormMode = "create" | "edit";

interface FaqCategoryData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameZhCn: string | null;
  order: number;
}

interface FaqCategoryFormProps {
  mode: FaqCategoryFormMode;
  initialData?: FaqCategoryData | null;
  onSuccess?: () => void;
}

type FormErrors = Partial<Record<string, string>>;

export default function FaqCategoryForm({ mode, initialData, onSuccess }: FaqCategoryFormProps) {
  const dict = useAdminDict();
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    nameZh: "",
    nameEn: "",
    nameZhCn: "",
    order: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        nameZh: initialData.nameZh,
        nameEn: initialData.nameEn,
        nameZhCn: initialData.nameZhCn ?? "",
        order: initialData.order,
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: GeneralFaqCategoryCreateInput = {
      nameZh: form.nameZh,
      nameEn: form.nameEn,
      nameZhCn: form.nameZhCn || undefined,
      order: form.order,
    };

    const parsed = generalFaqCategoryCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const mapped: FormErrors = {};
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs.length > 0) {
          mapped[key] = msgs[0];
        }
      }
      setErrors(mapped);
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/faq/categories/${initialData!.id}`
        : "/api/admin/faq/categories";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }

      addToast({
        title: isEdit ? dict.faq.toastCategoryUpdated : dict.faq.toastCategoryCreated,
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/admin/faq`);
      }
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary transition-colors";
  const labelClass = "text-xs font-bold text-slate-700 block mb-0.5";
  const errorClass = "text-[10px] text-destructive mt-0.5";
  const fieldRow = "flex flex-col gap-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={fieldRow}>
          <label className={labelClass}>{dict.faq.categoryNameZh} <span className="text-destructive">*</span></label>
          <input type="text" value={form.nameZh} onChange={(e) => handleChange("nameZh", e.target.value)} className={inputClass} />
          {errors.nameZh && <p className={errorClass}>{errors.nameZh}</p>}
        </div>
        <div className={fieldRow}>
          <label className={labelClass}>{dict.faq.categoryNameEn} <span className="text-destructive">*</span></label>
          <input type="text" value={form.nameEn} onChange={(e) => handleChange("nameEn", e.target.value)} className={inputClass} />
          {errors.nameEn && <p className={errorClass}>{errors.nameEn}</p>}
        </div>
        <div className={fieldRow}>
          <label className={labelClass}>{dict.faq.categoryNameZhCn}</label>
          <input type="text" value={form.nameZhCn} onChange={(e) => handleChange("nameZhCn", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div className={fieldRow}>
          <label className={labelClass}>{dict.faq.categoryOrder}</label>
          <input type="number" min="0" value={form.order} onChange={(e) => handleChange("order", Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-5">
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="ml-1.5">
            {isEdit
              ? (submitting ? dict.updating : dict.faq.saveCategory)
              : (submitting ? dict.creating : dict.faq.saveCategory)}
          </span>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {dict.cancel}
        </Button>
      </div>
    </form>
  );
}