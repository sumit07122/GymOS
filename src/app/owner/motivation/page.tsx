import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Trophy, Plus, CheckCircle2, Award, Calendar, Users, Flame, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { EmptyState } from "@/components/design-system/empty-state";

export default async function OwnerMotivationPage() {
  const { gym } = await requireOwnerSession("/owner/motivation");

  const [challenges, totalParticipantsCount] = await Promise.all([
    db.gymChallenge.findMany({
      where: { gymId: gym.id },
      include: {
        participants: {
          take: 10,
          orderBy: { progress: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.challengeParticipant.count({
      where: { challenge: { gymId: gym.id } },
    }),
  ]);

  const activeChallenges = challenges.filter((c) => c.isActive);
  const completedBadgesAwarded = challenges.reduce(
    (acc, c) => acc + c.participants.filter((p) => p.isCompleted).length,
    0
  );

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
      {/* Page Header */}
      <PageHeader
        title="Member Motivation & Community Challenges"
        description="Drive member retention, consistency streaks, and healthy community competition with gym-wide fitness milestones."
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Challenges"
          value={activeChallenges.length}
          icon={Flame}
          subtext="Live member sprints"
        />
        <StatCard
          label="Total Enrollments"
          value={totalParticipantsCount}
          icon={Users}
          subtext="Participants tracked"
        />
        <StatCard
          label="Badges Awarded"
          value={completedBadgesAwarded}
          icon={Award}
          subtext="Milestones achieved"
        />
        <StatCard
          label="Top Streak Reward"
          value="PRO FINISHER"
          icon={Trophy}
          subtext="Default milestone badge"
        />
      </div>

      {/* Challenge Creator Form */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-soft text-pine">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Launch New Member Challenge</h2>
            <p className="text-xs text-muted">Create a timed consistency sprint for all active members.</p>
          </div>
        </div>

        <form action={createChallengeAction} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
              Challenge Title *
            </label>
            <input
              required
              name="title"
              placeholder="e.g. 30-Day Squat & Consistency Sprint"
              className="w-full bg-white border border-line rounded-lg px-3 h-10 text-ink placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine text-xs transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
              Reward Badge Tag
            </label>
            <input
              name="rewardBadge"
              placeholder="e.g. BEAST_MODE_2026"
              className="w-full bg-white border border-line rounded-lg px-3 h-10 text-ink placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine text-xs transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
              Duration
            </label>
            <select
              name="durationDays"
              className="w-full bg-white border border-line rounded-lg px-3 h-10 text-ink focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine text-xs transition"
            >
              <option value="14">14-Day Sprint</option>
              <option value="30">30-Day Challenge</option>
              <option value="60">60-Day Transformation</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
              Instructions & Goal Description
            </label>
            <input
              name="description"
              placeholder="Complete at least 16 workout check-ins this month to earn the finisher digital badge."
              className="w-full bg-white border border-line rounded-lg px-3 h-10 text-ink placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-pine/30 focus:border-pine text-xs transition"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-10 gap-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Challenge</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Challenges & Leaderboard List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ink">Active & Historical Challenges</h3>
          <span className="text-xs text-muted">{challenges.length} total challenges configured</span>
        </div>

        {challenges.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No Active Challenges Yet"
            description="Launch your first member motivation sprint above to engage members and boost attendance."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-line bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-pine/30 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-ink text-sm sm:text-base">{c.title}</h4>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {c.description || "Gym consistency sprint."}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        c.isActive
                          ? "bg-pine-soft text-pine border-pine/30 text-[10px] font-semibold"
                          : "bg-canvas text-muted border-line text-[10px]"
                      }
                    >
                      {c.isActive ? "ACTIVE" : "ENDED"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-pine" />
                      <span>
                        {new Date(c.startDate).toLocaleDateString()} &ndash;{" "}
                        {new Date(c.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {c.rewardBadge && (
                      <div className="flex items-center gap-1.5 font-mono text-pine font-semibold">
                        <Award className="h-3.5 w-3.5" />
                        <span>{c.rewardBadge}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-line pt-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                    <span>Top Participants</span>
                    <span>{c.participants.length} Enrolled</span>
                  </div>

                  {c.participants.length === 0 ? (
                    <p className="text-xs text-muted italic py-2">
                      Members will automatically appear on their first qualifying check-in.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {c.participants.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-canvas border border-line/60"
                        >
                          <span className="font-semibold text-ink">
                            #{idx + 1} Member {p.memberId.slice(0, 6)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-pine font-bold">{Number(p.progress)}%</span>
                            {p.isCompleted && <CheckCircle2 className="h-4 w-4 text-pine" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
