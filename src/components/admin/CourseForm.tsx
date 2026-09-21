"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { courseCreateSchema } from "@/lib/validation/course";
import type { CourseCreateInput } from "@/lib/validation/course";

export type CourseFormMode = "create" | "edit";

interface CourseData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameCn: string | null;
  slug: string;
  category: string;
  iaRefNumber: string | null;
  cpdHours: number;
  price: number;
  unitPrice: number | null;
  capacity: number;
  registrationStatus: "OPEN" | "FEW_SEATS" | "FULL" | "CLOSED";
  deliveryMode: string | null;
  language: string | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  descriptionCn: string | null;
  generalInstructorId: string | null;
  organizerZh: string | null;
  organizerEn: string | null;
  feeDescriptionZh: string | null;
  feeDescriptionEn: string | null;
  feeDescriptionCn: string | null;
}

interface CourseFormProps {
  mode: CourseFormMode;
  initialData?: CourseData | null;
  onSuccess?: () => void;
}

type FormErrors = Partial<Record<string, string>>;

export default function CourseForm({ mode, initialData, onSuccess }: CourseFormProps) {
  const dict = useAdminDict();
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    nameZh: "",
    nameEn: "",
    nameCn: "",
    slug: "",
    category: "",
    iaRefNumber: "",
    cpdHours: 0,
    price: 0,
    unitPrice: "",
    capacity: 0,
    deliveryMode: "",
    language: "",
    registrationStatus: "OPEN" as CourseData["registrationStatus"],
    descriptionZh: "",
    descriptionEn: "",
    descriptionCn: "",
    generalInstructorId: "",
    organizerZh: "",
    organizerEn: "",
    feeDescriptionZh: "",
    feeDescriptionEn: "",
    feeDescriptionCn: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form with initial data in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        nameZh: initialData.nameZh,
        nameEn: initialData.nameEn,
        nameCn: initialData.nameCn ?? "",
        slug: initialData.slug,
        category: initialData.category,
        iaRefNumber: initialData.iaRefNumber ?? "",
        cpdHours: initialData.cpdHours,
        price: initialData.price,
        unitPrice: initialData.unitPrice !== null ? String(initialData.unitPrice) : "",
        capacity: initialData.capacity,
        deliveryMode: initialData.deliveryMode ?? "",
        language: initialData.language ?? "",
        registrationStatus: initialData.registrationStatus,
        descriptionZh: initialData.descriptionZh ?? "",
        descriptionEn: initialData.descriptionEn ?? "",
        descriptionCn: initialData.descriptionCn ?? "",
        generalInstructorId: initialData.generalInstructorId ?? "",
        organizerZh: initialData.organizerZh ?? "",
        organizerEn: initialData.organizerEn ?? "",
        feeDescriptionZh: initialData.feeDescriptionZh ?? "",
        feeDescriptionEn: initialData.feeDescriptionEn ?? "",
        feeDescriptionCn: initialData.feeDescriptionCn ?? "",
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

  const buildPayload = (): CourseCreateInput => {
    // Auto-generate slug from nameEn in create mode if empty
    let slug = form.slug.trim();
    if (!slug && !isEdit) {
      slug = form.nameEn
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    return {
    nameZh: form.nameZh,
    nameEn: form.nameEn,
    nameCn: form.nameCn || undefined,
    slug,
    category: form.category,
    iaRefNumber: form.iaRefNumber || undefined,
    cpdHours: form.cpdHours,
    price: form.price,
    unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
    capacity: form.capacity,
    registrationStatus: form.registrationStatus,
    deliveryMode: form.deliveryMode || undefined,
    language: form.language || undefined,
    descriptionZh: form.descriptionZh || undefined,
    descriptionEn: form.descriptionEn || undefined,
    descriptionCn: form.descriptionCn || undefined,
    generalInstructorId: form.generalInstructorId || undefined,
    organizerZh: form.organizerZh || undefined,
    organizerEn: form.organizerEn || undefined,
    feeDescriptionZh: form.feeDescriptionZh || undefined,
    feeDescriptionEn: form.feeDescriptionEn || undefined,
    feeDescriptionCn: form.feeDescriptionCn || undefined,
  };
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = buildPayload();
    const parsed = courseCreateSchema.safeParse(payload);
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
        ? `/api/admin/courses/${initialData!.id}`
        : "/api/admin/courses";
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
        title: isEdit ? dict.toastCourseUpdated : dict.toastCourseCreated,
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/admin/courses`);
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
      {/* ── Section: Basic Information ── */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.sectionBasicInfo}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formNameZh} <span className="text-destructive">*</span></label>
            <input type="text" value={form.nameZh} onChange={(e) => handleChange("nameZh", e.target.value)} className={inputClass} />
            {errors.nameZh && <p className={errorClass}>{errors.nameZh}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formNameEn} <span className="text-destructive">*</span></label>
            <input type="text" value={form.nameEn} onChange={(e) => handleChange("nameEn", e.target.value)} className={inputClass} />
            {errors.nameEn && <p className={errorClass}>{errors.nameEn}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formNameCn}</label>
            <input type="text" value={form.nameCn} onChange={(e) => handleChange("nameCn", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formSlug} <span className="text-destructive">*</span></label>
            <input type="text" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className={inputClass} placeholder={dict.formSlug} />
            {errors.slug && <p className={errorClass}>{errors.slug}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formCategory} <span className="text-destructive">*</span></label>
            <input type="text" value={form.category} onChange={(e) => handleChange("category", e.target.value)} className={inputClass} />
            {errors.category && <p className={errorClass}>{errors.category}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formIaRef}</label>
            <input type="text" value={form.iaRefNumber} onChange={(e) => handleChange("iaRefNumber", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Section: Course Details ── */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.sectionDetails}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formCpdHours} <span className="text-destructive">*</span></label>
            <input type="number" min="0" value={form.cpdHours} onChange={(e) => handleChange("cpdHours", Number(e.target.value))} className={inputClass} />
            {errors.cpdHours && <p className={errorClass}>{errors.cpdHours}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formPrice} <span className="text-destructive">*</span></label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => handleChange("price", Number(e.target.value))} className={inputClass} />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formUnitPrice}</label>
            <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => handleChange("unitPrice", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formCapacity} <span className="text-destructive">*</span></label>
            <input type="number" min="0" value={form.capacity} onChange={(e) => handleChange("capacity", Number(e.target.value))} className={inputClass} />
            {errors.capacity && <p className={errorClass}>{errors.capacity}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formDeliveryMode}</label>
            <input type="text" value={form.deliveryMode} onChange={(e) => handleChange("deliveryMode", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formLanguage}</label>
            <input type="text" value={form.language} onChange={(e) => handleChange("language", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formStatus}</label>
            <select value={form.registrationStatus} onChange={(e) => handleChange("registrationStatus", e.target.value)} className={inputClass}>
              <option value="OPEN">{dict.open}</option>
              <option value="FEW_SEATS">{dict.fewSeats}</option>
              <option value="FULL">{dict.full}</option>
              <option value="CLOSED">{dict.closed}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section: Descriptions ── */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.sectionDescriptions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formDescriptionZh}</label>
            <textarea rows={4} value={form.descriptionZh} onChange={(e) => handleChange("descriptionZh", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formDescriptionEn}</label>
            <textarea rows={4} value={form.descriptionEn} onChange={(e) => handleChange("descriptionEn", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formDescriptionCn}</label>
            <textarea rows={4} value={form.descriptionCn} onChange={(e) => handleChange("descriptionCn", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Section: Organization ── */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.sectionOrganization}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formGeneralInstructor}</label>
            <input type="text" value={form.generalInstructorId} onChange={(e) => handleChange("generalInstructorId", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formOrganizerZh}</label>
            <input type="text" value={form.organizerZh} onChange={(e) => handleChange("organizerZh", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formOrganizerEn}</label>
            <input type="text" value={form.organizerEn} onChange={(e) => handleChange("organizerEn", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Section: Fee Description ── */}
      <div className={sectionClass}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{dict.sectionFeeDescription}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formFeeDescriptionZh}</label>
            <textarea rows={3} value={form.feeDescriptionZh} onChange={(e) => handleChange("feeDescriptionZh", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formFeeDescriptionEn}</label>
            <textarea rows={3} value={form.feeDescriptionEn} onChange={(e) => handleChange("feeDescriptionEn", e.target.value)} className={inputClass} />
          </div>
          <div className={fieldRow}>
            <label className={labelClass}>{dict.formFeeDescriptionCn}</label>
            <textarea rows={3} value={form.feeDescriptionCn} onChange={(e) => handleChange("feeDescriptionCn", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="ml-1.5">
            {isEdit
              ? (submitting ? dict.updating : dict.update)
              : (submitting ? dict.creating : dict.create)}
          </span>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {dict.cancel}
        </Button>
      </div>
    </form>
  );
}