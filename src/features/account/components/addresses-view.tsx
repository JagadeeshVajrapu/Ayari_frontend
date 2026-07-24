'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import {
  userService,
  type AccountAddressDto,
  type AddressPayload,
} from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const EMPTY_FORM: AddressPayload = {
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'IN',
  phone: '',
  isDefault: false,
};

export function AddressesView() {
  const [addresses, setAddresses] = useState<AccountAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userService.getMyAddresses();
      setAddresses(data.data.addresses);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setDefault = async (id: string) => {
    setError('');
    try {
      await userService.setDefaultAddress(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const removeAddress = async (id: string) => {
    setError('');
    try {
      await userService.deleteAddress(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const submitAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userService.createAddress({
        ...form,
        phone: form.phone || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell title="Addresses" description="Manage your shipping addresses">
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          type="button"
          onClick={() => setShowForm((open) => !open)}
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add New Address'}
        </Button>

        {showForm && (
          <form
            onSubmit={submitAddress}
            className="space-y-3 rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['firstName', 'First name'],
                  ['lastName', 'Last name'],
                  ['phone', 'Phone'],
                  ['street', 'Street'],
                  ['city', 'City'],
                  ['state', 'State'],
                  ['zipCode', 'PIN code'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={cn('block text-sm', key === 'street' && 'sm:col-span-2')}>
                  <span className="mb-1 block text-ink-muted">{label}</span>
                  <input
                    required={key !== 'phone'}
                    value={form[key] ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
              />
              Set as default shipping address
            </label>
            <Button type="submit" variant="champagne" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-champagne" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MapPin className="mb-4 h-12 w-12 text-ink-faint" />
            <p className="font-display text-xl text-foreground">No saved addresses</p>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              Add an address here, or save one at checkout for faster future orders.
            </p>
          </div>
        ) : (
          addresses.map((address, index) => (
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
                      onClick={() => void setDefault(address.id)}
                      className="rounded-lg p-2 text-ink-muted hover:bg-muted hover:text-foreground"
                      aria-label="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeAddress(address.id)}
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
              {address.phone ? (
                <p className="mt-2 text-sm text-ink-muted">{address.phone}</p>
              ) : null}
            </motion.div>
          ))
        )}
      </div>
    </AccountShell>
  );
}
