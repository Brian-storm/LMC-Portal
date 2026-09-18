"use client";

import { createContext, useContext } from "react";
import type { AdminDict } from "@/dictionaries/types";

const AdminDictContext = createContext<AdminDict | null>(null);

export function AdminDictProvider({
  children,
  dict,
}: {
  children: React.ReactNode;
  dict: AdminDict;
}) {
  return (
    <AdminDictContext.Provider value={dict}>
      {children}
    </AdminDictContext.Provider>
  );
}

export function useAdminDict(): AdminDict {
  const dict = useContext(AdminDictContext);
  if (!dict) {
    throw new Error("useAdminDict must be used within an AdminDictProvider");
  }
  return dict;
}