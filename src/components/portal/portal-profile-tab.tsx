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
  ShieldCheck,
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
    <div className="space-y-4 pb-6">
      {/* 1. Member Identity Card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F2EB] text-[#0B6B4F] font-bold text-lg border border-[#A7F3D0]">
              {member.firstName.charAt(0)}
              {member.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                {member.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                  {member.memberCode}
                </span>
                <span className="text-xs text-[#64748B]">• {gym.name}</span>
              </div>
            </div>
          </div>

          <Badge className="bg-[#E4F2EB] text-[#0B6B4F] border-[#A7F3D0] self-start text-xs">
            {member.status}
          </Badge>
        </div>

        {/* Read-only Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <Mail className="h-4 w-4 text-[#0B6B4F]" />
            <div>
              <span className="text-[10px] text-[#64748B] uppercase block font-medium">
                Email Address
              </span>
              <span className="font-semibold text-[#0F172A]">
                {member.email || "Not linked"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <Calendar className="h-4 w-4 text-[#0B6B4F]" />
            <div>
              <span className="text-[10px] text-[#64748B] uppercase block font-medium">
                Member Since
              </span>
              <span className="font-semibold text-[#0F172A]">
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
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-[#0B6B4F]" />
          <span>Contact & Emergency Details</span>
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#0B6B4F]" />
                <span>Phone Number</span>
              </Label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-9 border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0B6B4F]" />
                <span>Residential Address</span>
              </Label>
              <Input
                type="text"
                placeholder="Street address, city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs h-9 border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0F172A]">
                Emergency Contact Name
              </Label>
              <Input
                type="text"
                placeholder="Full name of emergency contact"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="text-xs h-9 border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0F172A]">
                Emergency Contact Phone
              </Label>
              <Input
                type="tel"
                placeholder="Emergency contact phone number"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="text-xs h-9 border-[#E2E8F0]"
              />
            </div>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-[#E4F2EB] border border-[#A7F3D0] p-3 text-xs text-[#064E3B]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0B6B4F]" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="text-xs h-8 bg-[#0B6B4F] hover:bg-[#047857] text-white"
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Privacy & Security Note */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs text-[#64748B] shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-[#0B6B4F] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[#0F172A]">
              Security & Privacy Guaranteed
            </h4>
            <p className="mt-0.5 text-[#64748B] leading-relaxed text-[11px]">
              Your member identity is verified directly against your authenticated database session.
              Your dynamic QR pass does not encode private contact information and is refreshed with HMAC-SHA256 signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
