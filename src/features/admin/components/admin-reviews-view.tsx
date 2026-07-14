'use client';

import { AdminShell } from './admin-shell';

export function AdminReviewsView() {
  return (
    <AdminShell title="Reviews" description="Moderate customer product reviews">
      <div className="rounded-2xl border border-border/60 bg-card/50 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No reviews yet. Customer reviews will appear here after products receive feedback.
        </p>
      </div>
    </AdminShell>
  );
}
