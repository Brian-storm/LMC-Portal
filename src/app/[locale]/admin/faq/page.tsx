"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { useToast } from "@/components/ui/toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import type { AdminDict } from "@/dictionaries/types";

interface FaqCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  nameZhCn: string | null;
  order: number;
}

interface FaqItem {
  id: string;
  categoryId: string;
  questionZh: string;
  questionEn: string;
  questionZhCn: string | null;
  isPublished: boolean;
  order: number;
}

interface FaqGrouped {
  category: FaqCategory;
  questions: FaqItem[];
}

// ── Sortable category section ──

function SortableCategorySection({
  group,
  isExpanded,
  locale,
  dict,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  children,
}: {
  group: FaqGrouped;
  isExpanded: boolean;
  locale: string;
  dict: AdminDict;
  onToggleExpand: (id: string) => void;
  onEditCategory: (id: string) => string;
  onDeleteCategory: (cat: FaqCategory) => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
  };

  const getCategoryName = (cat: FaqCategory) => {
    if (locale === "en") return cat.nameEn;
    if (locale === "zh-cn") return cat.nameZhCn || cat.nameZh;
    return cat.nameZh;
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-200"
    >
      <div className="flex items-center px-2 py-3 hover:bg-slate-50 transition-colors">
        <button
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleExpand(group.category.id)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="text-sm font-serif font-bold text-slate-900">
            {getCategoryName(group.category)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {dict.faq.questionsCount.replace("{count}", String(group.questions.length))}
          </span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={onEditCategory(group.category.id)}
            className="inline-flex items-center p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xs transition-colors"
            title={dict.faq.editCategory}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => onDeleteCategory(group.category)}
            className="inline-flex items-center p-1.5 text-slate-500 hover:text-destructive hover:bg-rose-50 rounded-xs transition-colors"
            title={dict.faq.deleteCategory}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {isExpanded && children}
    </section>
  );
}

// ── Sortable question row ──

function SortableQuestionRow({
  question,
  locale,
  dict,
  onTogglePublished,
  onEditQuestion,
  onDeleteQuestion,
  togglingId,
}: {
  question: FaqItem;
  locale: string;
  dict: AdminDict;
  onTogglePublished: (q: FaqItem) => void;
  onEditQuestion: (id: string) => string;
  onDeleteQuestion: (q: FaqItem) => void;
  togglingId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-slate-50/80">
      <td className="py-2.5 px-4 text-slate-700 max-w-md truncate">
        <span className="inline-flex items-center gap-1">
          <span
            className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3 h-3" />
          </span>
          {locale === "en"
            ? question.questionEn
            : locale === "zh-cn"
              ? (question.questionZhCn || question.questionZh)
              : question.questionZh}
        </span>
      </td>
      <td className="py-2.5 px-4">
        <button
          onClick={() => onTogglePublished(question)}
          disabled={togglingId === question.id}
          className={`relative inline-flex items-center h-5 w-9 rounded-full border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
            question.isPublished
              ? "bg-emerald-600 border-emerald-600"
              : "bg-slate-300 border-slate-300"
          }`}
        >
          <span
            className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
              question.isPublished ? "translate-x-[18px]" : "translate-x-[1px]"
            }`}
          />
        </button>
        <span className="ml-1.5 text-[10px] font-medium text-slate-600">
          {togglingId === question.id ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin inline" />
          ) : question.isPublished ? (
            dict.faq.isPublished
          ) : (
            dict.faq.unpublished
          )}
        </span>
      </td>
      <td className="py-2.5 px-4 text-right whitespace-nowrap space-x-1">
        <Link
          href={onEditQuestion(question.id)}
          className="inline-flex items-center p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xs transition-colors"
          title={dict.faq.editQuestion}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onDeleteQuestion(question)}
          className="inline-flex items-center p-1.5 text-slate-500 hover:text-destructive hover:bg-rose-50 rounded-xs transition-colors"
          title={dict.faq.deleteQuestion}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

export default function AdminFaqPage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { addToast } = useToast();

  const [groups, setGroups] = useState<FaqGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // DnD active item for overlay
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Delete state
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<FaqCategory | null>(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle state
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // Reorder saving state
  const [savingReorder, setSavingReorder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, faqRes] = await Promise.all([
        fetch("/api/admin/faq/categories"),
        fetch("/api/admin/faq?limit=500"),
      ]);
      if (!catRes.ok) throw new Error("Failed to load categories");
      if (!faqRes.ok) throw new Error("Failed to load questions");

      const catData = await catRes.json();
      const faqData = await faqRes.json();

      const categories: FaqCategory[] = catData.categories || [];
      const questions: FaqItem[] = faqData.generalFaqs || [];

      const grouped: FaqGrouped[] = categories.map((cat) => ({
        category: cat,
        questions: questions
          .filter((q) => q.categoryId === cat.id)
          .sort((a, b) => a.order - b.order),
      }));

      setGroups(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleTogglePublished = async (question: FaqItem) => {
    setTogglingId(question.id);
    try {
      const res = await fetch(`/api/admin/faq/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !question.isPublished }),
      });
      if (!res.ok) throw new Error(`Failed to toggle: ${res.status}`);

      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          questions: g.questions.map((q) =>
            q.id === question.id ? { ...q, isPublished: !q.isPublished } : q
          ),
        }))
      );
      addToast({ title: dict.faq.toastTogglePublished, variant: "success" });
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faq/categories/${deleteCategoryTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setGroups((prev) => prev.filter((g) => g.category.id !== deleteCategoryTarget.id));
      addToast({ title: dict.faq.toastCategoryDeleted, variant: "success" });
      setDeleteCategoryTarget(null);
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faq/${deleteQuestionTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          questions: g.questions.filter((q) => q.id !== deleteQuestionTarget.id),
        }))
      );
      addToast({ title: dict.faq.toastQuestionDeleted, variant: "success" });
      setDeleteQuestionTarget(null);
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Category drag end ──

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groups.findIndex((g) => g.category.id === active.id);
    const newIndex = groups.findIndex((g) => g.category.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(groups, oldIndex, newIndex);
    setGroups(reordered);

    setSavingReorder(true);
    try {
      const updates = reordered.map((g, i) =>
        fetch(`/api/admin/faq/categories/${g.category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i + 1 }),
        })
      );
      await Promise.all(updates);
      addToast({ title: dict.faq.toastCategoryUpdated, variant: "success" });
    } catch (err) {
      setGroups(groups);
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Reorder failed",
        variant: "danger",
      });
    } finally {
      setSavingReorder(false);
      setActiveCategoryId(null);
    }
  };

  // ── Question drag end (within a category) ──

  const handleQuestionDragEnd = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const groupIndex = groups.findIndex((g) => g.category.id === categoryId);
    if (groupIndex === -1) return;

    const questions = groups[groupIndex].questions;
    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);

    setGroups((prev) =>
      prev.map((g) =>
        g.category.id === categoryId ? { ...g, questions: reorderedQuestions } : g
      )
    );

    setSavingReorder(true);
    try {
      const updates = reorderedQuestions.map((q, i) =>
        fetch(`/api/admin/faq/${q.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i + 1 }),
        })
      );
      await Promise.all(updates);
      addToast({ title: dict.faq.toastQuestionUpdated, variant: "success" });
    } catch (err) {
      setGroups(groups);
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Reorder failed",
        variant: "danger",
      });
    } finally {
      setSavingReorder(false);
    }
  };

  const getCategoryName = (cat: FaqCategory) => {
    if (locale === "en") return cat.nameEn;
    if (locale === "zh-cn") return cat.nameZhCn || cat.nameZh;
    return cat.nameZh;
  };

  const activeCategory = activeCategoryId
    ? groups.find((g) => g.category.id === activeCategoryId)
    : null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-slate-700">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs text-primary hover:underline mt-2"
            >
              {dict.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title={dict.faq.faq}
        cta={
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/admin/faq/categories/new`}
              className="inline-flex items-center space-x-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-bold px-3 py-2 rounded-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{dict.faq.newCategory}</span>
            </Link>
            <Link
              href={`/${locale}/admin/faq/new`}
              className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{dict.faq.newQuestion}</span>
            </Link>
            {savingReorder && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving order...
              </span>
            )}
          </div>
        }
      />

      {groups.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">{dict.faq.noCategories}</p>
          <Link
            href={`/${locale}/admin/faq/categories/new`}
            className="inline-flex items-center space-x-1 text-primary text-xs font-bold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{dict.faq.newCategory}</span>
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveCategoryId(e.active.id as string)}
          onDragEnd={handleCategoryDragEnd}
          onDragCancel={() => setActiveCategoryId(null)}
        >
          <SortableContext
            items={groups.map((g) => g.category.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {groups.map((group) => {
                const isExpanded = expandedIds.has(group.category.id);
                return (
                  <SortableCategorySection
                    key={group.category.id}
                    group={group}
                    isExpanded={isExpanded}
                    locale={locale}
                    dict={dict}
                    onToggleExpand={toggleExpand}
                    onEditCategory={(id) => `/${locale}/admin/faq/categories/${id}/edit`}
                    onDeleteCategory={setDeleteCategoryTarget}
                  >
                    {isExpanded && (
                      <div className="border-t border-slate-200">
                        {group.questions.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            {dict.faq.noQuestions}
                          </div>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleQuestionDragEnd(e, group.category.id)}
                          >
                            <SortableContext
                              items={group.questions.map((q) => q.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                                    <th className="py-2 px-4">{dict.faq.questionZh}</th>
                                    <th className="py-2 px-4 w-32">{dict.faq.isPublished}</th>
                                    <th className="py-2 px-4 text-right w-20">{dict.actions}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {group.questions.map((question) => (
                                    <SortableQuestionRow
                                      key={question.id}
                                      question={question}
                                      locale={locale}
                                      dict={dict}
                                      onTogglePublished={handleTogglePublished}
                                      onEditQuestion={(id) => `/${locale}/admin/faq/${id}/edit`}
                                      onDeleteQuestion={setDeleteQuestionTarget}
                                      togglingId={togglingId}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                    )}
                  </SortableCategorySection>
                );
              })}
            </div>
          </SortableContext>

          {/* Category drag overlay */}
          <DragOverlay>
            {activeCategory ? (
              <div className="bg-white border border-slate-300 shadow-lg px-4 py-3 rounded-xs flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-serif font-bold text-slate-900">
                  {getCategoryName(activeCategory.category)}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Delete category confirmation */}
      <ConfirmActionDialog
        open={!!deleteCategoryTarget}
        onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null); }}
        title={dict.faq.deleteCategory}
        description={dict.faq.deleteCategoryWarning}
        confirmLabel={dict.faq.deleteCategory}
        cancelLabel={dict.cancel}
        onConfirm={handleDeleteCategory}
        loading={deleting}
        variant="destructive"
        confirmIcon={<Trash2 className="w-3.5 h-3.5" />}
        disabled={!deleteCategoryTarget}
      >
        {deleteCategoryTarget && (
          <div className="bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{dict.faq.categoryNameZh}:</span>
              <span className="font-bold text-slate-800">
                {getCategoryName(deleteCategoryTarget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{dict.faq.questionsCount.replace("{count}", "")}:</span>
              <span className="font-bold text-slate-800">
                {groups.find((g) => g.category.id === deleteCategoryTarget.id)?.questions.length ?? 0}
              </span>
            </div>
          </div>
        )}
      </ConfirmActionDialog>

      {/* Delete question confirmation */}
      <ConfirmActionDialog
        open={!!deleteQuestionTarget}
        onOpenChange={(open) => { if (!open) setDeleteQuestionTarget(null); }}
        title={dict.faq.deleteQuestion}
        description={dict.faq.deleteQuestionWarning}
        confirmLabel={dict.faq.deleteQuestion}
        cancelLabel={dict.cancel}
        onConfirm={handleDeleteQuestion}
        loading={deleting}
        variant="destructive"
        confirmIcon={<Trash2 className="w-3.5 h-3.5" />}
        disabled={!deleteQuestionTarget}
      >
        {deleteQuestionTarget && (
          <div className="bg-slate-50 border border-slate-200 p-3 text-xs">
            <p className="text-slate-500">{dict.faq.questionZh}:</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {locale === "en"
                ? deleteQuestionTarget.questionEn
                : locale === "zh-cn"
                  ? (deleteQuestionTarget.questionZhCn || deleteQuestionTarget.questionZh)
                  : deleteQuestionTarget.questionZh}
            </p>
          </div>
        )}
      </ConfirmActionDialog>
    </div>
  );
}