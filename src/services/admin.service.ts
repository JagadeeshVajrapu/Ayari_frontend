import { api } from '@/services/auth.service';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  cloudinaryPublicId: string | null;
  folder?: string | null;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  sizes?: string[];
  colorVariants?: Array<{
    id: string;
    name: string;
    hex?: string;
    imageUrl?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
  setVariants?: Array<{
    id: string;
    name: string;
    label?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
  variants?: Array<{
    id: string;
    sku: string;
    name: string;
    colorHex?: string | null;
    variantType: string;
    price?: number | null;
    compareAtPrice?: number | null;
    stockQuantity: number;
    sortOrder?: number;
    isDefault: boolean;
    isActive: boolean;
    image?: string | null;
    images: AdminProductImage[];
    galleryImages: AdminProductImage[];
  }>;
  image: string | null;
  images: AdminProductImage[];
  featuredImages: AdminProductImage[];
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer: { id: string; email: string; name: string };
  items: Array<{
    productName: string;
    productSku: string;
    variantId?: string | null;
    variantName?: string | null;
    variantImageUrl?: string | null;
    quantity: number;
    totalPrice: number;
    unitPrice?: number;
  }>;
}

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  productCount: number;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ProductImagePayload {
  id?: string;
  url: string;
  cloudinaryPublicId?: string;
  folder?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

interface CreateProductPayload {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  description?: string;
  compareAtPrice?: number;
  sizes?: string[];
  colorVariants?: Array<{
    id?: string;
    name: string;
    hex?: string;
    imageUrl?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
  setVariants?: Array<{
    id?: string;
    name: string;
    label?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
  variants?: Array<{
    id?: string;
    sku: string;
    name: string;
    colorHex?: string;
    variantType?: string;
    price?: number;
    compareAtPrice?: number;
    stockQuantity: number;
    sortOrder?: number;
    isDefault?: boolean;
    isActive?: boolean;
    productImages: ProductImagePayload[];
    galleryImages?: ProductImagePayload[];
  }>;
  productImages: ProductImagePayload[];
  featuredImages: ProductImagePayload[];
  isActive?: boolean;
  isFeatured?: boolean;
}

export const adminService = {
  getDashboard: () =>
    api.get<ApiResponse<{
      stats: { revenue: number; orders: number; customers: number; products: number; lowStock: number };
      monthlyRevenue: Array<{ label: string; value: number }>;
      recentOrders: AdminOrder[];
      ordersByStatus: Array<{ status: string; count: number }>;
    }>>('/admin/dashboard'),

  getProducts: (params?: { page?: number; limit?: number; search?: string; categoryId?: string }) =>
    api.get<ApiResponse<{ items: AdminProduct[]; pagination: Pagination }>>('/admin/products', {
      params,
    }),

  createProduct: (data: CreateProductPayload) => api.post('/admin/products', data),

  updateProduct: (id: string, data: Partial<CreateProductPayload>) =>
    api.patch(`/admin/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<ApiResponse<{ mode: 'deleted' }>>(`/admin/products/${id}`),

  uploadProductImage: (
    file: File,
    options: {
      type?: 'product' | 'gallery' | 'featured';
      categoryName: string;
      productName: string;
      variantName?: string;
    },
  ) => {
    const formData = new FormData();
    formData.append('image', file);
    const type =
      options.type === 'gallery' || options.type === 'featured' ? 'gallery' : 'product';
    return api.post<ApiResponse<{ url: string; publicId: string; folder: string }>>(
      '/admin/upload/product-image',
      formData,
      {
        params: {
          type,
          categoryName: options.categoryName,
          productName: options.productName,
          ...(options.variantName ? { variantName: options.variantName } : {}),
        },
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
  },

  getOrders: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<ApiResponse<{ items: AdminOrder[]; pagination: Pagination }>>('/admin/orders', {
      params,
    }),

  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),

  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<{ items: AdminCustomer[]; pagination: Pagination }>>('/admin/customers', {
      params,
    }),

  setCustomerStatus: (id: string, isActive: boolean) =>
    api.patch(`/admin/customers/${id}/status`, { isActive }),

  getCategories: () =>
    api.get<ApiResponse<{ categories: AdminCategory[] }>>('/admin/categories'),

  createCategory: (data: {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
    imageUrl?: string;
  }) => api.post('/admin/categories', data),

  updateCategory: (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      sortOrder: number;
      isActive: boolean;
      imageUrl: string | null;
    }>,
  ) => api.patch(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
};

export const userService = {
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string | null }) =>
    api.patch('/users/me', data),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ items: AdminOrder[]; pagination: Pagination }>>('/users/me/orders', {
      params,
    }),
};
