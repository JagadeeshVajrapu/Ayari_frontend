'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, Truck } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminDataTable } from './admin-data-table';
import {
  shipmentAdminService,
  type CourierPartner,
} from '@/services/shipment-admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  code: '',
  contactPerson: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  trackingUrlTemplate: '',
  isActive: true,
};

export function AdminCouriersView() {
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await shipmentAdminService.getCouriers();
      setCouriers(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (courier: CourierPartner) => {
    setEditingId(courier.id);
    setForm({
      name: courier.name,
      code: courier.code,
      contactPerson: courier.contactPerson ?? '',
      phone: courier.phone ?? '',
      email: courier.email ?? '',
      website: courier.website ?? '',
      logoUrl: courier.logoUrl ?? '',
      trackingUrlTemplate: courier.trackingUrlTemplate ?? '',
      isActive: courier.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        contactPerson: form.contactPerson || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        logoUrl: form.logoUrl || undefined,
        trackingUrlTemplate: form.trackingUrlTemplate || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await shipmentAdminService.updateCourier(editingId, payload);
      } else {
        await shipmentAdminService.createCourier(payload);
      }

      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this courier partner?')) return;
    setError('');
    try {
      await shipmentAdminService.deleteCourier(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <AdminShell
      title="Courier Management"
      description="Manage courier partners for shipment fulfillment"
    >
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Courier
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm font-semibold">{editingId ? 'Edit Courier' : 'New Courier'}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Courier Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Courier Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
              <Field label="Contact Person" value={form.contactPerson} onChange={(v) => setForm({ ...form, contactPerson: v })} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
              <Field label="Logo URL" value={form.logoUrl} onChange={(v) => setForm({ ...form, logoUrl: v })} />
              <Field
                label="Tracking URL Template"
                value={form.trackingUrlTemplate}
                onChange={(v) => setForm({ ...form, trackingUrlTemplate: v })}
                placeholder="https://track.example.com/{trackingNumber}"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-champagne" />
          </div>
        ) : couriers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Truck className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">No couriers configured</p>
            <p className="mt-1 text-sm">Add courier partners to assign shipments.</p>
          </div>
        ) : (
          <AdminDataTable
            data={couriers}
            keyExtractor={(c) => c.id}
            columns={[
              { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
              { key: 'code', header: 'Code', render: (c) => <span className="font-mono text-xs">{c.code}</span> },
              { key: 'contact', header: 'Contact', render: (c) => c.contactPerson ?? '—' },
              { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
              { key: 'email', header: 'Email', render: (c) => c.email ?? '—' },
              {
                key: 'status',
                header: 'Status',
                render: (c) => (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      c.isActive
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (c) => (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}
