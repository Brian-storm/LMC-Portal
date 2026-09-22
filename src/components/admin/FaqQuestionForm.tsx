"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { generalFaqCreateSchema } from "@/lib/validation/faq";
import type { GeneralFaqCreateInput } from "@/lib/validation/faq";

export type FaqQuestionFormMode = "create" | "edit";

interface FaqCategoryOption {
  id: string;
  nameZh: string;
  nameEn: string;
  nameZhCn: string | null;
}

interface FaqQuestionData {
  id: string;
  categoryId: string;
  questionZh: string;
  questionEn: string;
  questionZhCn: string | null;
  answerZh: string;
  answerEn: string;
  answerZhCn: string | null;
  isPublished: boolean;
}

interface FaqQuestionFormProps {
  mode: FaqQuestionFormMode;
  categories: FaqCategoryOption[];
  initialData?: FaqQuestionData | null;
  onSuccess?: () => void;
}

type FormErrors = Partial<Record<string, string>>;

export default function FaqQuestionForm({ mode, categories, initialData, onSuccess }: FaqQuestionFormProps) {
  const dict = useAdminDict();
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    categoryId: "",
    questionZh: "",
    questionEn: "",
    questionZhCn: "",
    answerZh: "",
    answerEn: "",
    answerZhCn: "",
    isPublished: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        categoryId: initialData.categoryId,
        questionZh: initialData.questionZh,
        questionEn: initialData.questionEn,
        questionZhCn: initialData.questionZhCn ?? "",
        answerZh: initialData.answerZh,
        answerEn: initialData.answerEn,
        answerZhCn: initialData.answerZhCn ?? "",
        isPublished: initialData.isPublished,
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (field: string, value: string | boolean) => {
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

    const payload: GeneralFaqCreateInput = {
      categoryId: form.categoryId,
      questionZh: form.questionZh,
      questionEn: form.questionEn,
      questionZhCn: form.questionZhCn || undefined,
      answerZh: form.answerZh,
      answerEn: form.answerEn,
      answerZhCn: form.answerZhCn || undefined,
      isPublished: form.isPublished,
    };

    const parsed = generalFaqCreateSchema.safeParse(payload);
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
        ? `/api/admin/faq/${initialData!.id}`
        : "/api/admin/faq";
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
        title: isEdit ? dict.faq.toastQuestionUpdated : dict.faq.toastQuestionCreated,
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
  const sectionClass = "border-b border-slate-200 pb-5 mb-5";

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Category selector */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.faq.questionCategory}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.questionCategory} <span className="text-destructive">*</span></label>
            <select value={form.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} className={inputClass}>
              <option value="">{dict.faq.selectCategory || "Select category..."}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn} / {cat.nameZh}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.isPublished}</label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange("isPublished", e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-xs text-slate-600">
                {form.isPublished ? dict.faq.isPublished : dict.faq.unpublished}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Question fields */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.faq.questionZh}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.questionZh} <span className="text-destructive">*</span></label>
            <input type="text" value={form.questionZh} onChange={(e) => handleChange("questionZh", e.target.value)} className={inputClass} />
            {errors.questionZh && <p className={errorClass}>{errors.questionZh}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.questionEn} <span className="text-destructive">*</span></label>
            <input type="text" value={form.questionEn} onChange={(e) => handleChange("questionEn", e.target.value)} className={inputClass} />
            {errors.questionEn && <p className={errorClass}>{errors.questionEn}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.questionZhCn}</label>
            <input type="text" value={form.questionZhCn} onChange={(e) => handleChange("questionZhCn", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Answer fields */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.faq.answerZh}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.answerZh} <span className="text-destructive">*</span></label>
            <textarea rows={4} value={form.answerZh} onChange={(e) => handleChange("answerZh", e.target.value)} className={inputClass} />
            {errors.answerZh && <p className={errorClass}>{errors.answerZh}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.answerEn} <span className="text-destructive">*</span></label>
            <textarea rows={4} value={form.answerEn} onChange={(e) => handleChange("answerEn", e.target.value)} className={inputClass} />
            {errors.answerEn && <p className={errorClass}>{errors.answerEn}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.faq.answerZhCn}</label>
            <textarea rows={4} value={form.answerZhCn} onChange={(e) => handleChange("answerZhCn", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="ml-1.5">
            {isEdit
              ? (submitting ? dict.updating : dict.faq.saveQuestion)
              : (submitting ? dict.creating : dict.faq.saveQuestion)}
          </span>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {dict.cancel}
        </Button>
      </div>
    </form>
  );
}