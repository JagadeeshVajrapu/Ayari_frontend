'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminSearch, AdminFilterSelect } from './admin-search';
import { AdminDataTable } from './admin-data-table';
import { AdminPagination } from './admin-pagination';
import {
  AdminProductFormModal,
  buildProductPayload,
  emptyProductForm,
  productToFormValues,
} from './admin-product-form';
import { adminService, type AdminCategory, type AdminProduct } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { resolveMediaUrl } from '@/lib/media';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { Button } from '@/components/ui/button';

import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';

export function AdminProductsView() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(emptyProductForm());

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const categoryId = categoryFilter !== 'all' ? categoryFilter : undefined;
      const { data } = await adminService.getProducts({
        page,
        limit: 10,
        search: search || undefined,
        categoryId,
      });
      setProducts(data.data.items);
      setTotalPages(data.data.pagination.totalPages);
      setTotalItems(data.data.pagination.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    adminService.getCategories().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProductForm(categoryFilter !== 'all' ? categoryFilter : ''));
    setShowForm(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm(productToFormValues(product));
    setShowForm(true);
  };

  const handleSave = async (payload: ReturnType<typeof buildProductPayload>) => {
    setError('');
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const toggleActive = async (product: AdminProduct) => {
    try {
      await adminService.updateProduct(product.id, { isActive: !product.isActive });
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <AdminShell
      title="All Products"
      description="View and manage every product in your catalog"
      actions={
        <Button variant="default" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      }
    >
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <AdminSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search products..."
            className="min-w-[200px] flex-1"
          />
          <AdminFilterSelect
            label="Category"
            value={categoryFilter}
            onChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
            options={[
              { label: 'All categories', value: 'all' },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="font-medium">No products yet</p>
            <p className="mt-1 text-sm">Add your first product to start selling.</p>
          </div>
        ) : (
          <AdminDataTable
            data={products}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: 'product',
                header: 'Product',
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                      <Image src={resolveMediaUrl(p.image, PRODUCT_PLACEHOLDER)} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'category', header: 'Category', render: (p) => p.category },
              { key: 'price', header: 'Price', render: (p) => formatPrice(p.price) },
              {
                key: 'stock',
                header: 'Stock',
                render: (p) => (
                  <span className={p.stockQuantity <= p.lowStockThreshold ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>
                    {p.stockQuantity}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (p) => (
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </button>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (p) => (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}

        <AdminPagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
      </div>

      {showForm && (
        <AdminProductFormModal
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          form={form}
          categories={categories}
          onChange={setForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </AdminShell>
  );
}
