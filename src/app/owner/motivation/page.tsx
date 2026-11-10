import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Trophy, Plus, CheckCircle2, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function OwnerMotivationPage() {
  const { gym } = await requireOwnerSession("/owner/motivation");

  const challenges = await db.gymChallenge.findMany({
    where: { gymId: gym.id },
    include: {
      participants: {
        take: 10,
        orderBy: { progress: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function createChallengeAction(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const rewardBadge = formData.get("rewardBadge") as string;
    const days = parseInt((formData.get("durationDays") as string) || "30", 10);

    const now = new Date();
    const end = new Date(now.getTime() + days * 86400000);

    await db.gymChallenge.create({
      data: {
        gymId: gym.id,
        title,
        description,
        rewardBadge: rewardBadge || "CHALLENGE_FINISHER",
        startDate: now,
        endDate: end,
        isActive: true,
      },
    });

    revalidatePath("/owner/motivation");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-amber-400" />
            <span>Member Motivation & Community Challenges</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Drive member engagement, habit formation, and retention with gym-wide fitness streaks and milestones.
          </p>
        </div>
      </div>

      {/* Challenge Creator */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-indigo-400" />
          <span>Launch New Member Challenge</span>
        </h2>
        <form action={createChallengeAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              required
              name="title"
              placeholder="e.g. 30-Day Squat & Consistency Sprint"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 h-9 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <input
              name="rewardBadge"
              placeholder="Badge: BEAST_MODE_2026"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 h-9 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <select
              name="durationDays"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 h-9 text-white"
            >
              <option value="14">14-Day Sprint</option>
              <option value="30">30-Day Challenge</option>
              <option value="60">60-Day Transformation</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <input
              name="description"
              placeholder="Complete at least 16 workout check-ins this month to earn the finisher digital badge."
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 h-9 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Challenge</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Challenges & Leaderboard List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {challenges.length === 0 ? (
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-12 text-center text-xs text-slate-500">
            No active challenges configured yet. Launch your first gym sprint above!
          </div>
        ) : (
          challenges.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{c.description || "Gym consistency sprint."}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={c.isActive ? "bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]" : "bg-slate-800 text-slate-400 text-[10px]"}
                  >
                    {c.isActive ? "ACTIVE" : "ENDED"}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{new Date(c.startDate).toLocaleDateString()} &ndash; {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>
                  {c.rewardBadge && (
                    <div className="flex items-center gap-1 font-mono text-amber-400">
                      <Award className="h-3.5 w-3.5" />
                      <span>{c.rewardBadge}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                  Top Participants ({c.participants.length})
                </div>
                {c.participants.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Members will automatically appear on check-in.</p>
                ) : (
                  <div className="space-y-1.5">
                    {c.participants.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                        <span className="font-semibold text-white">#{idx + 1} Member {p.memberId.slice(0, 6)}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">{Number(p.progress)}%</span>
                          {p.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
