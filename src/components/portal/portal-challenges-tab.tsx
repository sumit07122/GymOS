"use client";

import * as React from "react";
import {
  Trophy,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Users,
} from "lucide-react";

interface ChallengeItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  rewardBadge?: string | null;
  isJoined?: boolean;
  progress: number;
  isCompleted?: boolean;
}

interface PortalChallengesTabProps {
  gymName: string;
  challenges: ChallengeItem[];
}

export function PortalChallengesTab({
  gymName,
  challenges,
}: PortalChallengesTabProps) {
  // Built-in milestone achievements
  const milestoneBadges = [
    {
      id: "streak-7",
      title: "7-Day Streak",
      description: "Workout 7 days in a single week",
      icon: Flame,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      unlocked: true,
    },
    {
      id: "consistency-30",
      title: "Consistency Finisher",
      description: "Log 20+ gym visits in a calendar month",
      icon: Award,
      color: "bg-[#E4F2EB] text-[#0B6B4F] border-[#A7F3D0]",
      unlocked: true,
    },
    {
      id: "century-club",
      title: "Century Club",
      description: "Reach 100 verified lifetime check-ins",
      icon: Trophy,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      unlocked: false,
    },
    {
      id: "strength-master",
      title: "Iron Discipline",
      description: "Complete all assigned sets for 4 consecutive weeks",
      icon: Zap,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      unlocked: false,
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#0A261E] p-5 text-white shadow-md border border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>{gymName} Fitness Arena</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Gym Challenges & Trophies
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Build workout consistency, complete community challenges, and earn exclusive milestone badges.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Active Challenges List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Target className="h-4 w-4 text-[#0B6B4F]" />
            <span>Active Community Challenges</span>
          </h2>
          <span className="text-xs text-[#64748B]">
            {challenges.length} active
          </span>
        </div>

        {challenges.length === 0 ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#64748B] shadow-xs">
            <Trophy className="mx-auto h-8 w-8 text-[#94A3B8] mb-2" />
            <p className="font-semibold text-[#0F172A]">No active challenges at the moment</p>
            <p className="mt-1">Ask the front desk about upcoming seasonal fitness sprints and tournaments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenges.map((c) => {
              const progressPct = Math.min(Math.round(c.progress), 100);

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs space-y-3 hover:border-[#0B6B4F] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-sm">{c.title}</h3>
                      {c.description && (
                        <p className="text-xs text-[#64748B] mt-0.5">{c.description}</p>
                      )}
                    </div>
                    {c.rewardBadge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200 font-mono shrink-0">
                        <Award className="h-3 w-3" />
                        <span>{c.rewardBadge}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    <Calendar className="h-3.5 w-3.5 text-[#0B6B4F]" />
                    <span>
                      Ends {new Date(c.endDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#475569]">
                        {c.isJoined ? "My Progress" : "Goal Progress"}
                      </span>
                      <span className="font-bold font-mono text-[#0B6B4F]">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div
                        className="bg-[#0B6B4F] h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {c.isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B6B4F]">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Challenge Completed! Reward Unlocked.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-[#64748B]">
                        {c.isJoined ? "You are participating" : "Open to all members"}
                      </span>
                      <span className="font-semibold text-[#0B6B4F]">
                        {c.isJoined ? "Active" : "Joined"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Milestone Trophy Cabinet */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Milestone Badges & Trophy Cabinet
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">Member achievements</span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestoneBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  badge.unlocked
                    ? `${badge.color} border-transparent`
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] opacity-70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    badge.unlocked ? "bg-white shadow-xs" : "bg-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold leading-tight">{badge.title}</h3>
                    {badge.unlocked ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/70 px-1.5 py-0.2 rounded">
                        Earned
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium uppercase tracking-wider text-[#94A3B8]">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-snug">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Gym Community Leaderboard Preview */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Monthly Consistency Leaderboard
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">Top 5 Mates</span>
        </div>

        <div className="mt-3 divide-y divide-[#F1F5F9]">
          {[
            { rank: 1, name: "Arjun S.", visits: 24, badge: "🥇 Gold Titan" },
            { rank: 2, name: "Priya M.", visits: 22, badge: "🥈 Silver Runner" },
            { rank: 3, name: "Rohan D.", visits: 20, badge: "🥉 Bronze Lifter" },
            { rank: 4, name: "Ananya K.", visits: 18, badge: "Iron Star" },
            { rank: 5, name: "Karan V.", visits: 17, badge: "Iron Star" },
          ].map((item) => (
            <div key={item.rank} className="flex items-center justify-between py-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold font-mono text-xs w-4 text-center text-[#64748B]">
                  #{item.rank}
                </span>
                <span className="font-semibold text-[#0F172A]">{item.name}</span>
                <span className="text-[10px] text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                  {item.badge}
                </span>
              </div>
              <span className="font-mono font-bold text-[#0B6B4F]">
                {item.visits} visits
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

