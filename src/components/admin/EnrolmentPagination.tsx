"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination } from "./types";
import type { AdminDict } from "@/dictionaries/types";

interface EnrolmentPaginationProps {
  pagination: Pagination;
  page: number;
  dict: AdminDict;
  onPageChange: (newPage: number) => void;
}

export default function EnrolmentPagination({ pagination, page, dict, onPageChange }: EnrolmentPaginationProps) {
  return (
    <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between text-xs text-slate-500">
      <span>
        {dict.pageOf.replace("{page}", String(pagination.page)).replace("{total}", String(pagination.totalPages))}
        &nbsp;
        {dict.totalCountSuffix.replace("{total}", String(pagination.total))}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={page >= pagination.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}