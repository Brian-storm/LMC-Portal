"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AdminDict } from "@/dictionaries/types";
import { useToast } from "@/components/ui/toast";

interface UserProfile {
  id: string;
  role: string;
  nameZh: string;
  nameEn: string;
  email: string;
  phone: string;
  iaLicense: string | null;
  idDocNumber: string | null;
  idDocType: string | null;
  organization: string | null;
  isMember: boolean;
  memberId: string | null;
  createdAt: string;
}

interface UserEditDialogProps {
  userId: string | null;
  dict: AdminDict;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserEditDialog({ userId, dict, onClose, onSaved }: UserEditDialogProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [iaLicense, setIaLicense] = useState("");
  const [idDocNumber, setIdDocNumber] = useState("");
  const [idDocType, setIdDocType] = useState("");
  const [organization, setOrganization] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [memberId, setMemberId] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const open = !!userId;

  // Fetch user data when userId changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function fetchUser() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found");
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          const u = data.user as UserProfile;
          setUser(u);
          setNameZh(u.nameZh);
          setNameEn(u.nameEn);
          setEmail(u.email);
          setPhone(u.phone);
          setIaLicense(u.iaLicense ?? "");
          setIdDocNumber(u.idDocNumber ?? "");
          setIdDocType(u.idDocType ?? "");
          setOrganization(u.organization ?? "");
          setIsMember(u.isMember);
          setMemberId(u.memberId ?? "");
          setErrors({});
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nameZh.trim()) errs.nameZh = dict.userEdit.nameZh.error;
    if (!nameEn.trim()) errs.nameEn = dict.userEdit.nameEn.error;
    if (!email.trim()) {
      errs.email = dict.userEdit.email.error;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = dict.userEdit.email.error;
    }
    if (!phone.trim()) {
      errs.phone = dict.userEdit.phone.error;
    } else if (!/^[\d\s\-+()]{6,20}$/.test(phone)) {
      errs.phone = dict.userEdit.phone.error;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !userId) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        nameZh: nameZh.trim(),
        nameEn: nameEn.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (iaLicense.trim()) body.iaLicense = iaLicense.trim();
      else body.iaLicense = null;
      if (idDocNumber.trim()) body.idDocNumber = idDocNumber.trim();
      else body.idDocNumber = null;
      if (idDocType) body.idDocType = idDocType;
      else body.idDocType = null;
      if (organization.trim()) body.organization = organization.trim();
      else body.organization = null;
      body.isMember = isMember;
      if (isMember && memberId.trim()) body.memberId = memberId.trim();
      else body.memberId = null;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }

      addToast({ title: dict.userEdit.saveSuccess, variant: "success" });
      onSaved();
      onClose();
    } catch (err) {
      addToast({
        title: dict.userEdit.saveError,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setErrors({});
      onClose();
    }
  };

  const ue = dict.userEdit;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ue.title}</DialogTitle>
          <DialogDescription>
            {user && (
              <span className="text-xs text-slate-500">
                ID: {user.id}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {loading && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-slate-500">{ue.loading}</p>
          </div>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="py-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-xs text-slate-700">{loadError}</p>
            <p className="text-[10px] text-slate-400">{ue.loadingError}</p>
          </div>
        )}

        {/* Form */}
        {!loading && !loadError && user && (
          <div className="space-y-4 py-2">
            {/* Read-only fields */}
            <div className="bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs rounded-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{ue.role.label}:</span>
                <span className="font-bold text-slate-800">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{ue.createdAt.label}:</span>
                <span className="font-mono text-slate-700">{new Date(user.createdAt).toLocaleDateString("en-CA")}</span>
              </div>
            </div>

            {/* Editable fields grid */}
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label={ue.nameZh.label} error={errors.nameZh}>
                <input
                  type="text"
                  value={nameZh}
                  onChange={(e) => setNameZh(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.nameEn.label} error={errors.nameEn}>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.email.label} error={errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.phone.label} error={errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.iaLicense.label}>
                <input
                  type="text"
                  value={iaLicense}
                  onChange={(e) => setIaLicense(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.idDocNumber.label}>
                <input
                  type="text"
                  value={idDocNumber}
                  onChange={(e) => setIdDocNumber(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label={ue.idDocType.label}>
                <select
                  value={idDocType}
                  onChange={(e) => setIdDocType(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                >
                  <option value="">—</option>
                  {(["HKID", "PASSPORT", "PERMIT", "OTHER"] as const).map((opt) => (
                    <option key={opt} value={opt}>
                      {(ue.idDocTypeOptions as Record<string, string>)[opt]}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label={ue.organization.label}>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                />
              </FieldGroup>
            </div>

            {/* Member fields */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMember}
                  onChange={(e) => setIsMember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                />
                {ue.isMember.label}
              </label>
              {isMember && (
                <div className="ml-5">
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{ue.memberId.label}</label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full max-w-xs text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            {dict.cancel}
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            loading={saving}
            disabled={saving || loading || !!loadError}
          >
            {saving ? ue.saving : ue.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline helper component for form field with label + error
function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] font-bold text-slate-500 block">{label}</label>
      {children}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}