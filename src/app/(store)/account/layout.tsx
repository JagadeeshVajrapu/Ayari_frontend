import { AccountGuard } from '@/features/account/components/account-shell';
import { PageTransition } from '@/components/motion/page-transition';

export const metadata = {
  title: 'My Account — AYARI',
  description: 'Manage your AYARI account, orders, and preferences.',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountGuard>
      <PageTransition>{children}</PageTransition>
    </AccountGuard>
  );
}
