"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateWhatsAppTemplateAction } from "@/lib/actions/whatsapp";
import { WhatsAppNotificationEvent } from "@prisma/client";
import {
  FileText,
  Edit2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface TemplateItem {
  id: string;
  eventType: string;
  templateName: string;
  languageCode: string;
  headerText?: string | null;
  bodyText: string;
  footerText?: string | null;
  status: string;
  variables?: string | null;
}

interface WhatsAppTemplatesCardProps {
  gymSlug: string;
  templates: TemplateItem[];
}

export function WhatsAppTemplatesCard({
  gymSlug,
  templates,
}: WhatsAppTemplatesCardProps) {
  const [editingTemplate, setEditingTemplate] = React.useState<TemplateItem | null>(null);
  const [bodyText, setBodyText] = React.useState("");
  const [headerText, setHeaderText] = React.useState("");
  const [footerText, setFooterText] = React.useState("");

  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openEdit = (tmpl: TemplateItem) => {
    setEditingTemplate(tmpl);
    setBodyText(tmpl.bodyText);
    setHeaderText(tmpl.headerText || "");
    setFooterText(tmpl.footerText || "");
    setError(null);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      setIsPending(true);
      setError(null);

      const res = await updateWhatsAppTemplateAction(gymSlug, {
        templateId: editingTemplate.id,
        eventType: editingTemplate.eventType as WhatsAppNotificationEvent,
        bodyText,
        headerText: headerText || null,
        footerText: footerText || null,
      });

      if (res.success) {
        setEditingTemplate(null);
      } else {
        setError(res.error || "Failed to save template.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Approved Message Templates (7 Official Events)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-registered Meta WhatsApp templates with variable interpolation matching business triggers.
          </p>
        </div>

        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs self-start sm:self-auto">
          7 Templates Active
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {templates.map((tmpl) => {
          let vars: string[] = [];
          try {
            if (tmpl.variables) vars = JSON.parse(tmpl.variables);
          } catch {
            vars = [];
          }

          return (
            <div
              key={tmpl.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {tmpl.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">
                      ({tmpl.templateName} • {tmpl.languageCode})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {tmpl.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(tmpl)}
                    className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1 px-2.5"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>

              {/* Template Body Preview */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 font-sans text-xs text-slate-700 leading-relaxed space-y-1">
                {tmpl.headerText && (
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                    {tmpl.headerText}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{tmpl.bodyText}</div>
                {tmpl.footerText && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                    {tmpl.footerText}
                  </div>
                )}
              </div>

              {/* Supported Dynamic Variables */}
              {vars.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Variables:
                  </span>
                  {vars.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-mono text-slate-700"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Template Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Edit Template: {editingTemplate?.eventType.replace(/_/g, " ")}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Header Text (Optional)
              </Label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="e.g. Booking Confirmed"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Template Body Text
              </Label>
              <Textarea
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Preserve placeholder variables like <code>&#123;&#123;memberName&#125;&#125;</code> and <code>&#123;&#123;gymName&#125;&#125;</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Footer Text (Optional)
              </Label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="e.g. Reply STOP to unsubscribe"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingTemplate(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="text-xs bg-slate-900 text-white hover:bg-slate-800"
            >
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

