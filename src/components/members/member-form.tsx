"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createMemberAction,
  updateMemberAction,
  MemberActionState,
} from "@/lib/actions/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MemberStatus } from "@prisma/client";
import {
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Save,
  ArrowLeft,
  Calendar,
} from "lucide-react";

interface MemberFormProps {
  gymId: string;
  gymSlug: string;
  mode: "create" | "edit";
  initialData?: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    photoUrl: string | null;
    address: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    joiningDate: Date;
    medicalNotes: string | null;
    internalNotes: string | null;
    status: MemberStatus;
  };
}

export function MemberForm({
  gymId,
  gymSlug,
  mode,
  initialData,
}: MemberFormProps) {
  const router = useRouter();

  const actionFn = mode === "create" ? createMemberAction : updateMemberAction;

  const [state, formAction, isPending] = useActionState<MemberActionState | null, FormData>(
    async (prev, fd) => {
      const res = await actionFn(prev, fd);
      if (res.success && res.memberId) {
        router.push(`/${gymSlug}/members/${res.memberId}`);
      }
      return res;
    },
    null
  );

  const formatDateForInput = (d?: Date | null) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      {mode === "edit" && initialData && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      {/* Header & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={mode === "edit" && initialData ? `/${gymSlug}/members/${initialData.id}` : `/${gymSlug}/members`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Members</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "create" ? "Add New Member" : `Edit Member: ${initialData?.firstName} ${initialData?.lastName}`}
          </h1>
          <p className="text-xs text-slate-500">
            {mode === "create"
              ? "Register a new client profile into this gym workspace."
              : `Update profile, contact, or operational notes for ${initialData?.memberCode}.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${gymSlug}/members`}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 h-9 font-semibold gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPending ? "Saving..." : mode === "create" ? "Create Member" : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Global Error Notice */}
      {state?.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Action Failed</div>
            <div>{state.error}</div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {state?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Success</div>
            <div>{state.message}</div>
          </div>
        </div>
      )}

      {/* SECTION 1: Personal & Primary Identification */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Personal Information
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Legal name, photo, member code, and date of birth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData?.firstName || ""}
                placeholder="e.g. Marcus"
                required
                className="text-xs h-9"
              />
              {state?.fieldErrors?.firstName && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData?.lastName || ""}
                placeholder="e.g. Aurelius"
                required
                className="text-xs h-9"
              />
              {state?.fieldErrors?.lastName && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="memberCode" className="text-xs font-semibold text-slate-700">
                Member Code
              </label>
              <Input
                id="memberCode"
                name="memberCode"
                defaultValue={initialData?.memberCode || ""}
                placeholder="Leave blank to auto-generate (MEM-1001)"
                disabled={mode === "edit"}
                className="text-xs h-9 font-mono"
              />
              <p className="text-[10px] text-slate-400">
                {mode === "create" ? "Auto-assigned if omitted" : "Immutable identifier"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-xs font-semibold text-slate-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={initialData?.gender || ""}
                className="w-full rounded-md border border-slate-200 bg-white h-9 px-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select gender (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dateOfBirth" className="text-xs font-semibold text-slate-700">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={formatDateForInput(initialData?.dateOfBirth)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="photoUrl" className="text-xs font-semibold text-slate-700">
              Profile Photo URL
            </label>
            <Input
              id="photoUrl"
              name="photoUrl"
              defaultValue={initialData?.photoUrl || ""}
              placeholder="https://example.com/avatar.jpg"
              className="text-xs h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Contact & Physical Address */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Contact & Address
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Direct member phone, email, and billing address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialData?.phone || ""}
                placeholder="+1 (555) 123-4567"
                className="text-xs h-9"
              />
              {state?.fieldErrors?.phone && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ""}
                placeholder="member@example.com"
                className="text-xs h-9"
              />
              {state?.fieldErrors?.email && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-slate-700">
              Street Address
            </label>
            <Input
              id="address"
              name="address"
              defaultValue={initialData?.address || ""}
              placeholder="123 Fitness Ave, Apt 4B"
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label htmlFor="emergencyContactName" className="text-xs font-semibold text-slate-700">
                Emergency Contact Name
              </label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                defaultValue={initialData?.emergencyContactName || ""}
                placeholder="e.g. Jane Doe (Spouse)"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emergencyContactPhone" className="text-xs font-semibold text-slate-700">
                Emergency Contact Phone
              </label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                defaultValue={initialData?.emergencyContactPhone || ""}
                placeholder="+1 (555) 987-6543"
                className="text-xs h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Status & Membership Dates */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Membership Lifecycle
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Account status and official joining date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="joiningDate" className="text-xs font-semibold text-slate-700">
                Joining Date
              </label>
              <Input
                id="joiningDate"
                name="joiningDate"
                type="date"
                defaultValue={formatDateForInput(initialData?.joiningDate || new Date())}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-slate-700">
                Account Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={initialData?.status || "ACTIVE"}
                className="w-full rounded-md border border-slate-200 bg-white h-9 px-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="EXPIRED">Expired</option>
                <option value="FROZEN">Frozen</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Medical & Internal Staff Notes */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Medical & Internal Notes
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Sensitive fitness considerations and confidential staff memos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="medicalNotes" className="text-xs font-semibold text-slate-700">
              Medical & Health Considerations
            </label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              rows={3}
              defaultValue={initialData?.medicalNotes || ""}
              placeholder="e.g. History of lower back strain; asthma inhaler carried; allergies..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="internalNotes" className="text-xs font-semibold text-slate-700">
              Staff Internal Notes (Confidential)
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              defaultValue={initialData?.internalNotes || ""}
              placeholder="e.g. VIP client; requested morning locker key #14; referred by coach Dave..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href={`/${gymSlug}/members`}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-6 h-9 font-semibold"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Member Record" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
