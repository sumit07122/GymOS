"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Layers } from "lucide-react";
import { ClassesOverviewCards } from "./classes-overview-cards";
import { ClassListTable } from "./class-list-table";
import { ClassScheduleList } from "./class-schedule-list";
import { ClassFormModal } from "./class-form-modal";
import { ClassScheduleModal } from "./class-schedule-modal";
import { ClassBookingModal } from "./class-booking-modal";
import { ScheduleWithDetails } from "@/lib/services/class.service";
import { cancelScheduleAction } from "@/lib/actions/class";
import { Class } from "@prisma/client";

interface ClassesHubProps {
  classes: Class[];
  schedules: ScheduleWithDetails[];
  instructors: Array<{ id: string; name: string | null; email: string }>;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  canManage: boolean;
}

export function ClassesHub({
  classes,
  schedules,
  instructors,
  members,
  gymId,
  gymSlug,
  canManage,
}: ClassesHubProps) {
  const [activeTab, setActiveTab] = useState<"schedules" | "templates">("schedules");

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [preselectedClass, setPreselectedClass] = useState<Class | null>(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [targetSchedule, setTargetSchedule] = useState<ScheduleWithDetails | null>(null);

  const handleEditClass = (cls: Class) => {
    setEditClass(cls);
    setClassModalOpen(true);
  };

  const handleScheduleFromTemplate = (cls: Class) => {
    setPreselectedClass(cls);
    setScheduleModalOpen(true);
  };

  const handleBook = (schedule: ScheduleWithDetails) => {
    setTargetSchedule(schedule);
    setBookingModalOpen(true);
  };

  const handleCancelSchedule = async (schedule: ScheduleWithDetails) => {
    if (confirm(`Are you sure you want to cancel the session for ${schedule.class.name}?`)) {
      const formData = new FormData();
      formData.append("gymId", gymId);
      formData.append("gymSlug", gymSlug);
      formData.append("scheduleId", schedule.id);
      await cancelScheduleAction(null, formData);
    }
  };

  // Metrics calculation
  const totalClasses = classes.filter((c) => c.isActive).length;
  const totalSchedules = schedules.length;
  const totalBookings = schedules.reduce((s, sch) => s + sch.bookedCount, 0);

  const todayStr = new Date().toDateString();
  const upcomingToday = schedules.filter(
    (sch) => new Date(sch.startTime).toDateString() === todayStr
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Classes & Schedules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage group classes, trainer schedules, and member reservations.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setEditClass(null);
                setClassModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Class
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setPreselectedClass(null);
                setScheduleModalOpen(true);
              }}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Schedule Session
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <ClassesOverviewCards
        totalClasses={totalClasses}
        totalSchedules={totalSchedules}
        totalBookings={totalBookings}
        upcomingToday={upcomingToday}
      />

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "schedules" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("schedules")}
          className={`text-xs gap-1.5 ${
            activeTab === "schedules" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Sessions & Calendar
        </Button>

        <Button
          variant={activeTab === "templates" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("templates")}
          className={`text-xs gap-1.5 ${
            activeTab === "templates" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Class Templates ({totalClasses})
        </Button>
      </div>

      {/* Tab content */}
      {activeTab === "schedules" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Upcoming Class Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ClassScheduleList
              schedules={schedules}
              onBook={handleBook}
              onCancelSchedule={handleCancelSchedule}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "templates" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Configured Class Definitions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ClassListTable
              classes={classes}
              onEdit={handleEditClass}
              onSchedule={handleScheduleFromTemplate}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ClassFormModal
        open={classModalOpen}
        classDef={editClass}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setClassModalOpen(false)}
      />

      <ClassScheduleModal
        open={scheduleModalOpen}
        preselectedClass={preselectedClass}
        classes={classes}
        instructors={instructors}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setScheduleModalOpen(false)}
      />

      <ClassBookingModal
        open={bookingModalOpen}
        schedule={targetSchedule}
        members={members}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
}

