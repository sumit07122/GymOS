"use client";

import * as React from "react";
import { MemberFilters } from "./member-filters";
import { MemberTable, MemberListItem } from "./member-table";
import { CsvImportModal } from "./csv-import-modal";

interface MemberListViewProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  members: MemberListItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  plans: { id: string; name: string }[];
}

export function MemberListView({
  gymId,
  gymSlug,
  currency,
  members,
  total,
  page,
  totalPages,
  limit,
  plans,
}: MemberListViewProps) {
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <MemberFilters
        gymSlug={gymSlug}
        plans={plans}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      <MemberTable
        gymId={gymId}
        gymSlug={gymSlug}
        currency={currency}
        members={members}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={limit}
      />

      <CsvImportModal
        gymId={gymId}
        gymSlug={gymSlug}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

