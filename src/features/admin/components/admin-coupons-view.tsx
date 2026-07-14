'use client';

import { Plus } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { Button } from '@/components/ui/button';

export function AdminCouponsView() {
  return (
    <AdminShell
      title="Coupons"
      description="Create and manage discount codes"
      actions={
        <Button variant="champagne" size="sm" disabled>
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      }
    >
      <div className="rounded-2xl border border-border/60 bg-card/50 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No coupons yet. Coupon management will appear here once configured in the admin API.
        </p>
      </div>
    </AdminShell>
  );
}
