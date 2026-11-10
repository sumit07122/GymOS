"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  archiveMemberAction,
  unarchiveMemberAction,
  deleteMemberAction,
} from "@/lib/actions/member";
import { MemberStatus } from "@prisma/client";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Drawer } from "@/components/design-system/drawer";

export interface MemberListItem {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  status: MemberStatus;
  joiningDate: Date;
  activeMembership?: {
    id: string;
    planName: string;
    endDate: Date;
  } | null;
  outstandingDues: number;
}

interface MemberTableProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  members: MemberListItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export function MemberTable({
  gymId,
  gymSlug,
  currency,
  members,
  total,
  page,
  totalPages,
}: MemberTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Drawer & Dialog states
  const [drawerMember, setDrawerMember] = React.useState<MemberListItem | null>(null);
  const [memberToArchive, setMemberToArchive] = React.useState<MemberListItem | null>(null);
  const [archiveReason, setArchiveReason] = React.useState("Member request / seasonal pause");
  const [memberToDelete, setMemberToDelete] = React.useState<MemberListItem | null>(null);
  const [activeMenuMemberId, setActiveMenuMemberId] = React.useState<string | null>(null);

  const [actionError, setActionError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleArchiveConfirm = async () => {
    if (!memberToArchive) return;
    setIsSubmitting(true);
    setActionError(null);

    const fd = new FormData();
    fd.set("gymId", gymId);
    fd.set("gymSlug", gymSlug);
    fd.set("memberId", memberToArchive.id);
    fd.set("reason", archiveReason);

    const res = await archiveMemberAction(null, fd);
    setIsSubmitting(false);

    if (res.success) {
      setMemberToArchive(null);
      router.refresh();
    } else {
      setActionError(res.error || "Failed to archive member.");
    }
  };

  const handleUnarchive = async (member: MemberListItem) => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.set("gymId", gymId);
    fd.set("gymSlug", gymSlug);
    fd.set("memberId", member.id);

    const res = await unarchiveMemberAction(null, fd);
    setIsSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to unarchive member.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setIsSubmitting(true);
    setActionError(null);

    const fd = new FormData();
    fd.set("gymId", gymId);
    fd.set("gymSlug", gymSlug);
    fd.set("memberId", memberToDelete.id);

    const res = await deleteMemberAction(null, fd);
    setIsSubmitting(false);

    if (res.success) {
      setMemberToDelete(null);
      router.refresh();
    } else {
      setActionError(res.error || "Deletion blocked by business integrity check.");
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <>
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        {members.length === 0 ? (
          <div className="py-16 text-center space-y-4 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-muted">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                No Members Found
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                No members match the current search or filter criteria. Add a member or import your roster from CSV.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <Link
                href={`/${gymSlug}/members/new`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-pine/90 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Member</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-canvas border-b border-line hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted">Member</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Contact</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Membership</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Dues</TableHead>
                  <TableHead className="text-xs font-semibold text-muted">Joined</TableHead>
                  <TableHead className="text-xs font-semibold text-muted text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} className="border-line/60 hover:bg-canvas/50 transition">
                    {/* Member Info */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-soft font-bold text-xs text-pine">
                          {m.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.photoUrl}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span>
                              {m.firstName.charAt(0)}
                              {m.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setDrawerMember(m)}
                            className="font-semibold text-xs text-ink hover:text-pine hover:underline text-left transition flex items-center gap-1.5"
                          >
                            <span>{m.firstName} {m.lastName}</span>
                            <Eye className="h-3 w-3 text-muted hover:text-pine" />
                          </button>
                          <div className="text-[10px] font-mono text-muted">
                            {m.memberCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-3 text-xs">
                      <div className="text-ink font-medium">{m.phone || "—"}</div>
                      <div className="text-[10px] text-muted">{m.email || "—"}</div>
                    </TableCell>

                    {/* Membership */}
                    <TableCell className="py-3 text-xs">
                      {m.activeMembership ? (
                        <div>
                          <span className="font-semibold text-ink">
                            {m.activeMembership.planName}
                          </span>
                          <div className="text-[10px] text-muted">
                            Expires {new Date(m.activeMembership.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted italic">No active plan</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <StatusBadge status={m.status} />
                    </TableCell>

                    {/* Dues */}
                    <TableCell className="py-3 text-xs">
                      {m.outstandingDues > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {formatMoney(m.outstandingDues)}
                        </span>
                      ) : (
                        <span className="text-pine font-medium">Cleared</span>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="py-3 text-xs text-muted">
                      {new Date(m.joiningDate).toLocaleDateString()}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3 text-right">
                      <div className="relative inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDrawerMember(m)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-pine hover:bg-canvas transition"
                          title="Quick Member Drawer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuMemberId(activeMenuMemberId === m.id ? null : m.id)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-white text-muted hover:bg-canvas hover:text-ink transition"
                          title="More Actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {activeMenuMemberId === m.id && (
                          <div
                            className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-line bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 text-left"
                            onMouseLeave={() => setActiveMenuMemberId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuMemberId(null);
                                setDrawerMember(m);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted" />
                              <span>Preview Profile Drawer</span>
                            </button>

                            <Link
                              href={`/${gymSlug}/members/${m.id}`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                              onClick={() => setActiveMenuMemberId(null)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-muted" />
                              <span>Full Ledger & History</span>
                            </Link>

                            <Link
                              href={`/${gymSlug}/members/${m.id}/edit`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas transition"
                              onClick={() => setActiveMenuMemberId(null)}
                            >
                              <Edit className="h-3.5 w-3.5 text-muted" />
                              <span>Edit Details</span>
                            </Link>

                            {m.status === "ARCHIVED" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  handleUnarchive(m);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-pine hover:bg-pine-soft transition"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-pine" />
                                <span>Restore to Active</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  setMemberToArchive(m);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 transition"
                              >
                                <Archive className="h-3.5 w-3.5 text-amber-600" />
                                <span>Archive Member</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-line" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuMemberId(null);
                                setMemberToDelete(m);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-line px-4 py-3 text-xs text-muted gap-3">
              <div>
                Showing <span className="font-semibold text-ink">{members.length}</span> of{" "}
                <span className="font-semibold text-ink">{total}</span> total members
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => navigateToPage(page - 1)}
                  className="h-8 gap-1 text-xs border-line hover:bg-canvas"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <span className="px-2 font-medium text-ink">
                  Page {page} of {totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => navigateToPage(page + 1)}
                  className="h-8 gap-1 text-xs border-line hover:bg-canvas"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Member Profile Slide-Over Drawer */}
      <Drawer
        isOpen={!!drawerMember}
        onClose={() => setDrawerMember(null)}
        title={drawerMember ? `${drawerMember.firstName} ${drawerMember.lastName}` : "Member Profile"}
        description={drawerMember ? `Member Identifier: ${drawerMember.memberCode}` : undefined}
        size="md"
        footer={
          drawerMember && (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  const m = drawerMember;
                  setDrawerMember(null);
                  setMemberToArchive(m);
                }}
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                Archive Member
              </button>

              <Link
                href={`/${gymSlug}/members/${drawerMember.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-pine/90 transition"
              >
                <span>Full Ledger & History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        }
      >
        {drawerMember && (
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-canvas border border-line">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pine-soft font-bold text-lg text-pine">
                {drawerMember.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={drawerMember.photoUrl}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {drawerMember.firstName.charAt(0)}
                    {drawerMember.lastName.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-ink text-base">
                  {drawerMember.firstName} {drawerMember.lastName}
                </h3>
                <p className="font-mono text-xs text-muted">{drawerMember.memberCode}</p>
                <div className="mt-1">
                  <StatusBadge status={drawerMember.status} />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="rounded-xl border border-line p-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Contact Information
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-ink">
                  <Phone className="h-3.5 w-3.5 text-pine" />
                  <span>{drawerMember.phone || "No phone registered"}</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <Mail className="h-3.5 w-3.5 text-pine" />
                  <span>{drawerMember.email || "No email registered"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Calendar className="h-3.5 w-3.5 text-muted" />
                  <span>Joined on {new Date(drawerMember.joiningDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Active Membership Status */}
            <div className="rounded-xl border border-line p-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Membership Plan
              </h4>
              {drawerMember.activeMembership ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">
                      {drawerMember.activeMembership.planName}
                    </span>
                    <span className="text-[11px] font-semibold text-pine bg-pine-soft px-2 py-0.5 rounded">
                      ACTIVE TIER
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Valid until {new Date(drawerMember.activeMembership.endDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-muted italic">
                  No active membership plan currently assigned.
                </div>
              )}
            </div>

            {/* Financial Dues & Balances */}
            <div className="rounded-xl border border-line p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Outstanding Dues
                </h4>
                <CreditCard className="h-4 w-4 text-muted" />
              </div>
              <div className="text-lg font-bold text-ink">
                {drawerMember.outstandingDues > 0 ? (
                  <span className="text-rose-600">{formatMoney(drawerMember.outstandingDues)}</span>
                ) : (
                  <span className="text-pine">All Invoices Settled (₹0.00)</span>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href={`/${gymSlug}/members/${drawerMember.id}/edit`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas p-2.5 text-xs font-semibold text-ink hover:bg-line/40 transition"
              >
                <Edit className="h-3.5 w-3.5 text-muted" />
                <span>Edit Profile</span>
              </Link>

              <Link
                href={`/${gymSlug}/attendance`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas p-2.5 text-xs font-semibold text-ink hover:bg-line/40 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-muted" />
                <span>Verify Access</span>
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {/* Archive Member Confirmation Dialog */}
      <Dialog
        open={!!memberToArchive}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToArchive(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-line shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Archive className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-ink">
                Archive Member
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted">
              Archiving deactivates membership without destroying historical attendance or payment ledgers.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
              {actionError}
            </div>
          )}

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg bg-canvas p-3 text-ink">
              <span className="text-muted">Member: </span>
              <span className="font-semibold text-ink">
                {memberToArchive?.firstName} {memberToArchive?.lastName}
              </span>{" "}
              <span className="font-mono text-muted">({memberToArchive?.memberCode})</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="archive-reason" className="font-medium text-ink">
                Archive Reason
              </label>
              <input
                id="archive-reason"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Reason for archiving..."
                className="w-full rounded-lg border border-line bg-white p-2.5 text-xs text-ink focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemberToArchive(null)}
              className="text-xs border-line"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleArchiveConfirm}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
            >
              {isSubmitting ? "Archiving..." : "Confirm Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Dialog (With Business Integrity Guard) */}
      <Dialog
        open={!!memberToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToDelete(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-line shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Trash2 className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-ink">
                Delete Member Record
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted">
              Permanent deletion check.
            </DialogDescription>
          </DialogHeader>

          {actionError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-950">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Deletion Blocked by Business Integrity Rule</span>
              </div>
              <p className="leading-relaxed">{actionError}</p>
            </div>
          ) : (
            <div className="space-y-3 py-2 text-xs text-muted leading-relaxed">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-ink">
                  {memberToDelete?.firstName} {memberToDelete?.lastName}
                </span>{" "}
                ({memberToDelete?.memberCode})?
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900 text-[11px]">
                <span className="font-bold">FIXIA Policy:</span> If this member has any recorded
                invoices, payments, or attendance check-ins, hard deletion is prohibited by design.
                You must use the Archive workflow instead.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMemberToDelete(null);
                setActionError(null);
              }}
              className="text-xs border-line"
            >
              Close
            </Button>
            {!actionError && (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4"
              >
                {isSubmitting ? "Checking & Deleting..." : "Delete Member"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
