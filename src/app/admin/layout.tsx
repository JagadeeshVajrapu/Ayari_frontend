import { AdminGuard } from '@/features/admin/components/admin-guard';
import { PageTransition } from '@/components/motion/page-transition';

export const metadata = {
  title: 'Admin — AYARI',
  description: 'AYARI admin dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <PageTransition>{children}</PageTransition>
    </AdminGuard>
  );
}
