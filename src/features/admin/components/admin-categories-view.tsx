'use client';

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Loader2,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminSearch, AdminFilterSelect } from './admin-search';
import {
  AdminProductFormModal,
  buildProductPayload,
  emptyProductForm,
  productToFormValues,
} from './admin-product-form';
import {
  adminService,
  type AdminCategory,
  type AdminProduct,
} from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';

function AdminErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
      {message}
    </div>
  );
}

function CategoryProductsPanel({
  category,
  categories,
  onRefreshCategories,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  onRefreshCategories: () => Promise<void>;
}) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm(category.id));

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminService.getProducts({ categoryId: category.id, limit: 100 });
      setProducts(data.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm(category.id));
    setShowProductForm(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm(productToFormValues(product));
    setShowProductForm(true);
  };

  const handleSaveProduct = async (payload: ReturnType<typeof buildProductPayload>) => {
    setError('');
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      setShowProductForm(false);
      await loadProducts();
      await onRefreshCategories();
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (
      !window.confirm(
        `Permanently delete "${product.name}"?\n\nThe product, variants, and catalog images will be removed. Existing order details are preserved.`,
      )
    ) return;

    setDeletingProductId(product.id);
    setError('');
    setNotice('');
    try {
      const { data } = await adminService.deleteProduct(product.id);
      setNotice(data.message);
      await loadProducts();
      await onRefreshCategories();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleMoveProduct = async (product: AdminProduct, newCategoryId: string) => {
    if (newCategoryId === product.categoryId) return;
    try {
      await adminService.updateProduct(product.id, { categoryId: newCategoryId });
      await loadProducts();
      await onRefreshCategories();
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
    <div className="space-y-4 border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
      <AdminErrorBanner message={error} />
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <Package className="mr-1.5 inline h-4 w-4" />
          {products.length} product{products.length === 1 ? '' : 's'} in this category
        </p>
        <Button variant="default" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No products in this category yet. Add your first product above.
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={resolveMediaUrl(product.image, PRODUCT_PLACEHOLDER)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sku} · {formatPrice(product.price)} · Stock {product.stockQuantity}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(product)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    product.isActive
                      ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </button>

                <AdminFilterSelect
                  label="Move to category"
                  value={product.categoryId}
                  onChange={(value) => handleMoveProduct(product, value)}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  className="h-9 min-w-[140px] text-xs"
                />

                <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  onClick={() => handleDeleteProduct(product)}
                  disabled={deletingProductId === product.id}
                >
                  {deletingProductId === product.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {deletingProductId === product.id ? 'Removing…' : 'Remove'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProductForm && (
        <AdminProductFormModal
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          form={productForm}
          categories={categories}
          lockCategory={!editingProduct}
          onChange={setProductForm}
          onClose={() => setShowProductForm(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export function AdminCategoriesView() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.data.categories);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.includes(search.toLowerCase()),
  );

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setFormError('');
    setShowCategoryForm(true);
  };

  const openEditCategory = (category: AdminCategory, event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description ?? '' });
    setFormError('');
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setFormError('Category name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    setError('');
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null,
        });
      } else {
        await adminService.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: AdminCategory) => {
    if (category.productCount > 0) {
      setError(
        `"${category.name}" has ${category.productCount} product(s). Move or remove them before deleting this category.`,
      );
      return;
    }
    if (!window.confirm(`Permanently delete empty category "${category.name}"?`)) return;

    setDeletingCategoryId(category.id);
    setError('');
    setNotice('');
    try {
      await adminService.deleteCategory(category.id);
      setNotice(`Category "${category.name}" was permanently deleted.`);
      if (expandedId === category.id) setExpandedId(null);
      await loadCategories();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const toggleCategoryActive = async (category: AdminCategory) => {
    try {
      await adminService.updateCategory(category.id, { isActive: !category.isActive });
      await loadCategories();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <AdminShell
      title="Categories & Products"
      description="Manage categories and the products inside each one"
      actions={
        <Button variant="default" size="sm" onClick={openCreateCategory}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
          <AdminErrorBanner message={error} />
          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              {notice}
            </div>
          )}
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
            className="max-w-md"
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No categories found</p>
              <p className="mt-1 text-sm">Create a category to organize your catalog.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.map((category) => {
                const expanded = expandedId === category.id;
                return (
                  <div
                    key={category.id}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-soft"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : category.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        {expanded ? (
                          <ChevronDown className="h-5 w-5 shrink-0 text-brand" />
                        ) : (
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-lg text-foreground">{category.name}</span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {category.slug}
                            </span>
                            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                              {category.productCount} products
                            </span>
                          </div>
                          {category.description && (
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
                        <button
                          type="button"
                          onClick={() => toggleCategoryActive(category)}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium',
                            category.isActive
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => openEditCategory(category, event)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={deletingCategoryId === category.id}
                        >
                          {deletingCategoryId === category.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          {deletingCategoryId === category.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    </div>

                    {expanded && (
                      <CategoryProductsPanel
                        category={category}
                        categories={categories}
                        onRefreshCategories={loadCategories}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCategoryForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setShowCategoryForm(false)}
        >
          <form
            onSubmit={handleSaveCategory}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
          >
            <h2 className="font-display text-xl text-foreground">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            {formError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {formError}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
                autoFocus
              />
              <textarea
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Description (optional)"
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCategoryForm(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Category'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
