'use client';

import { AdminShell } from './admin-shell';
import { AdminStatCard } from './admin-stat-card';
import { Eye, MousePointer, ShoppingCart, IndianRupee } from 'lucide-react';

export function AdminAnalyticsView() {
  return (
    <AdminShell title="Analytics" description="Store performance insights">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Page Views" value="—" icon={<Eye className="h-5 w-5" />} />
          <AdminStatCard label="Conversion" value="—" icon={<MousePointer className="h-5 w-5" />} />
          <AdminStatCard label="Cart Adds" value="—" icon={<ShoppingCart className="h-5 w-5" />} />
          <AdminStatCard label="AOV" value="—" icon={<IndianRupee className="h-5 w-5" />} />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Analytics charts will populate as real orders and traffic data are recorded.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
