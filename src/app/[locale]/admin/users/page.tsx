"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Search,
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  nameEn: string;
  nameZh: string;
  email: string;
  phone: string;
  iaLicense: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Admin access required");
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch on mount and when debouncedSearch/page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(debouncedSearch, page);
  }, [debouncedSearch, page, fetchUsers]);

  const handleSearchClear = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA");
  };

  const getName = (user: AdminUser) => {
    if (locale === "zh-hk" || locale === "zh-cn") return user.nameZh || user.nameEn;
    return user.nameEn || user.nameZh;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-primary">{ dict.users }</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {dict.userCount.replace("{count}", String(pagination?.total ?? 0))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xs bg-white focus:outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button
            onClick={handleSearchClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users table */}
      <section className="bg-white border border-slate-200">
        {/* Loading state */}
        {loading && (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-28 bg-slate-200 rounded-xs" />
                <div className="h-4 w-36 bg-slate-200 rounded-xs" />
                <div className="h-4 w-24 bg-slate-200 rounded-xs" />
                <div className="h-4 w-16 bg-slate-200 rounded-xs" />
                <div className="h-4 w-20 bg-slate-200 rounded-xs" />
              </div>
            ))}
            <div className="text-center pt-2 text-slate-400">
              <Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1.5" />
              { dict.loading }
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="font-bold text-destructive">{ dict.error }</p>
            <p className="text-xs text-slate-500">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchUsers(debouncedSearch, page)}>
              { dict.retry }
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && users.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">
              {debouncedSearch ? dict.noData : dict.noData}
            </p>
            <p className="text-xs text-slate-500">
              {debouncedSearch ? dict.searchPlaceholder : dict.emptyAllHint}
            </p>
          </div>
        )}

        {/* Data table */}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">{ dict.name }</th>
                  <th className="py-2.5 px-3">{ dict.email }</th>
                  <th className="py-2.5 px-3">{ dict.phone }</th>
                  <th className="py-2.5 px-3">{ dict.iaLicense }</th>
                  <th className="py-2.5 px-3">{ dict.registeredDate }</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-serif font-bold text-slate-900">{getName(user)}</div>
                      {user.nameZh && user.nameEn && user.nameZh !== user.nameEn && (
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {locale === "zh-hk" || locale === "zh-cn" ? user.nameEn : user.nameZh}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{user.email}</td>
                    <td className="py-3 px-3 text-slate-700">{user.phone}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {user.iaLicense ?? "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
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
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const start = Math.max(1, pagination.page - 2);
                const pageNum = start + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="xs"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}