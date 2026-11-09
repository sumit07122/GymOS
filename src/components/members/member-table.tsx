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
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  archiveMemberAction,
  unarchiveMemberAction,
  deleteMemberAction,
} from "@/lib/actions/member";
import { MemberStatus } from "@prisma/client";

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

  // Dialog states
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
            Active
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
            Inactive
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
            Expired
          </Badge>
        );
      case "FROZEN":
        return (
          <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-[10px]">
            Frozen
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[10px]">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {members.length === 0 ? (
          <div className="py-16 text-center space-y-4 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                No Members Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No members match the current search or filter criteria. Add a member or import your roster from CSV.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <Link
                href={`/${gymSlug}/members/new`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
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
                <TableRow className="bg-slate-50/80">
                  <TableHead className="text-xs font-semibold text-slate-700">Member</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Contact</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Membership</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Dues</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Joined</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/60 transition">
                    {/* Member Info */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-xs text-white">
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
                          <Link
                            href={`/${gymSlug}/members/${m.id}`}
                            className="font-semibold text-xs text-slate-900 hover:text-emerald-700 hover:underline transition"
                          >
                            {m.firstName} {m.lastName}
                          </Link>
                          <div className="text-[10px] font-mono text-slate-400">
                            {m.memberCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-3 text-xs">
                      <div className="text-slate-800">{m.phone || "—"}</div>
                      <div className="text-[10px] text-slate-400">{m.email || "—"}</div>
                    </TableCell>

                    {/* Membership */}
                    <TableCell className="py-3 text-xs">
                      {m.activeMembership ? (
                        <div>
                          <span className="font-medium text-slate-900">
                            {m.activeMembership.planName}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Expires {new Date(m.activeMembership.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active plan</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">{getStatusBadge(m.status)}</TableCell>

                    {/* Dues */}
                    <TableCell className="py-3 text-xs">
                      {m.outstandingDues > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {formatMoney(m.outstandingDues)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Paid</span>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="py-3 text-xs text-slate-500">
                      {new Date(m.joiningDate).toLocaleDateString()}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuMemberId(activeMenuMemberId === m.id ? null : m.id)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {activeMenuMemberId === m.id && (
                          <div
                            className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95"
                            onMouseLeave={() => setActiveMenuMemberId(null)}
                          >
                            <Link
                              href={`/${gymSlug}/members/${m.id}`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              onClick={() => setActiveMenuMemberId(null)}
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              <span>View Profile</span>
                            </Link>

                            <Link
                              href={`/${gymSlug}/members/${m.id}/edit`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              onClick={() => setActiveMenuMemberId(null)}
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-400" />
                              <span>Edit Details</span>
                            </Link>

                            {m.status === "ARCHIVED" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  handleUnarchive(m);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Restore to Active</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  setMemberToArchive(m);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                              >
                                <Archive className="h-3.5 w-3.5 text-amber-600" />
                                <span>Archive Member</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuMemberId(null);
                                setMemberToDelete(m);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
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
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 gap-3">
              <div>
                Showing <span className="font-semibold text-slate-900">{members.length}</span> of{" "}
                <span className="font-semibold text-slate-900">{total}</span> total members
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => navigateToPage(page - 1)}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <span className="px-2 font-medium">
                  Page {page} of {totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => navigateToPage(page + 1)}
                  className="h-8 gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

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
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Archive className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Archive Member
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Archiving deactivates membership without destroying historical attendance or payment ledgers.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
              {actionError}
            </div>
          )}

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 text-slate-700">
              <span className="text-slate-500">Member: </span>
              <span className="font-semibold text-slate-900">
                {memberToArchive?.firstName} {memberToArchive?.lastName}
              </span>{" "}
              <span className="font-mono text-slate-500">({memberToArchive?.memberCode})</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="archive-reason" className="font-medium text-slate-700">
                Archive Reason
              </label>
              <input
                id="archive-reason"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Reason for archiving..."
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemberToArchive(null)}
              className="text-xs"
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
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Trash2 className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete Member Record
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
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
            <div className="space-y-3 py-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-900">
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
              className="text-xs"
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
