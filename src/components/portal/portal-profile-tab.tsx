"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { updateMemberProfileAction } from "@/lib/actions/portal";

interface PortalProfileTabProps {
  gym: {
    name: string;
    slug: string;
  };
  member: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    joiningDate: string;
    status: string;
  };
}

export function PortalProfileTab({
  gym,
  member,
}: PortalProfileTabProps) {
  const [phone, setPhone] = React.useState(member.phone || "");
  const [address, setAddress] = React.useState(member.address || "");
  const [emergencyContactName, setEmergencyContactName] = React.useState(
    member.emergencyContactName || ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState(
    member.emergencyContactPhone || ""
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const formData = new FormData();
      formData.set("phone", phone);
      formData.set("address", address);
      formData.set("emergencyContactName", emergencyContactName);
      formData.set("emergencyContactPhone", emergencyContactPhone);

      const res = await updateMemberProfileAction(gym.slug, formData);
      if (res.success) {
        setSaveSuccess("Profile and emergency details updated successfully.");
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        setSaveError(res.error || "Failed to update profile.");
      }
    } catch {
      setSaveError("Network error while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Member Identity Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-lg">
              {member.firstName.charAt(0)}
              {member.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {member.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {member.memberCode}
                </span>
                <span className="text-xs text-slate-400">• {gym.name}</span>
              </div>
            </div>
          </div>

          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 self-start text-xs">
            {member.status}
          </Badge>
        </div>

        {/* Read-only Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-medium">
                Email Address
              </span>
              <span className="font-semibold text-slate-800">
                {member.email || "Not linked"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="h-4 w-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-medium">
                Member Since
              </span>
              <span className="font-semibold text-slate-800">
                {new Date(member.joiningDate).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Editable Contact & Emergency Settings Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          <span>Contact & Emergency Details</span>
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Phone Number</span>
              </Label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Residential Address</span>
              </Label>
              <Input
                type="text"
                placeholder="Street address, city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Emergency Contact Name
              </Label>
              <Input
                type="text"
                placeholder="Full name of emergency contact"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Emergency Contact Phone
              </Label>
              <Input
                type="tel"
                placeholder="Phone number"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Privacy & Security Note */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <div className="flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900">
              Security & Privacy Guaranteed
            </h4>
            <p className="mt-0.5 text-slate-500 leading-relaxed text-[11px]">
              Your member identity is verified directly against your authenticated database session.
              Your dynamic QR pass does not encode private contact information and is refreshed with HMAC-SHA256 signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
