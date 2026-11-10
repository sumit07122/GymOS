import * as React from "react";
import Link from "next/link";
import { requireMemberSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Trophy, Award, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function MemberChallengesPage() {
  const { member, gym } = await requireMemberSession("/member/challenges");

  const challenges = await db.gymChallenge.findMany({
    where: { gymId: gym.id, isActive: true },
    include: {
      participants: {
        where: { memberId: member.id },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/member/home" className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Member Home</span>
          </Link>
          <div className="text-xs font-bold text-slate-800">{gym.name}</div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Gym Challenges</h1>
            <p className="text-xs text-slate-500">
              Build workout consistency, compete with gym mates, and earn milestone badges.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
              No active challenges right now. Ask front desk about the next fitness sprint!
            </div>
          ) : (
            challenges.map((c) => {
              const myPart = c.participants[0];
              const progressPct = myPart ? Number(myPart.progress) : 0;

              return (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                    </div>
                    {c.rewardBadge && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1 font-mono">
                        <Award className="h-3 w-3" />
                        <span>{c.rewardBadge}</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Ends {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">My Progress</span>
                      <span className="font-bold font-mono text-indigo-600">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
