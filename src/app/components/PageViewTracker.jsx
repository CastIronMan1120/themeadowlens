'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/studio') || pathname === lastTrackedPath.current) {
      return;
    }
    lastTrackedPath.current = pathname;

    const timer = setTimeout(() => {
      try {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            path: pathname,
            title: typeof document !== 'undefined' ? document.title : pathname,
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            device,
          }),
        }).catch(() => {});
      } catch {
        // Ignore tracking errors on client
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
