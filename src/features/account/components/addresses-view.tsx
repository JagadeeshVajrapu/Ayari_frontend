'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { MOCK_ADDRESSES, type AccountAddress } from '@/features/account/lib/account-data';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AddressesView() {
  const [addresses, setAddresses] = useState<AccountAddress[]>(MOCK_ADDRESSES);

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id })),
    );
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  return (
    <AccountShell title="Addresses" description="Manage your shipping addresses">
      <div className="space-y-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>

        {addresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-3xl border bg-surface-elevated p-5 shadow-soft sm:p-6',
              address.isDefault ? 'border-champagne/50' : 'border-border/60',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-champagne-dark dark:text-champagne" />
                <span className="font-medium text-foreground">{address.label}</span>
                {address.isDefault && <Badge variant="default">Default</Badge>}
              </div>
              <div className="flex gap-1">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(address.id)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-muted hover:text-foreground"
                    aria-label="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  aria-label="Remove address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-foreground">
              {address.firstName} {address.lastName}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{address.street}</p>
            <p className="text-sm text-ink-muted">
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{address.phone}</p>

            <Button variant="ghost" size="sm" className="mt-3">
              Edit
            </Button>
          </motion.div>
        ))}
      </div>
    </AccountShell>
  );
}
