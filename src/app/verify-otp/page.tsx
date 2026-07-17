import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Verify Email — AYARI',
};

export default function VerifyOtpPage() {
  redirect('/login');
}
