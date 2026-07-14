'use client';

import { AnnouncementBar } from './announcement-bar';
import { Header } from './header';

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar />
      <Header />
    </div>
  );
}
