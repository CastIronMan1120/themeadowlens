import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const ANALYTICS_DOC_ID = 'siteAnalytics';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body.path === 'string' ? body.path.trim() : '/';
    if (!rawPath || rawPath.startsWith('/studio') || rawPath.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const cleanPath = rawPath.slice(0, 180);
    const cleanTitle =
      typeof body.title === 'string'
        ? body.title.replace(/\s*\|\s*The Meadow Lens.*$/i, '').trim().slice(0, 140)
        : cleanPath;
    const cleanReferrer =
      typeof body.referrer === 'string' && body.referrer.trim()
        ? body.referrer.trim().slice(0, 160)
        : 'Direct / Bookmark';

    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua) || body.device === 'mobile';
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua) || body.device === 'tablet';
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const nowIso = new Date().toISOString();
    const todayKey = nowIso.slice(0, 10); // YYYY-MM-DD

    const existing =
      (await writeClient.fetch(`*[_id == $id][0]`, { id: ANALYTICS_DOC_ID })) || {
        _id: ANALYTICS_DOC_ID,
        _type: 'siteAnalytics',
        totalViews: 0,
        desktopViews: 0,
        mobileViews: 0,
        tabletViews: 0,
        dailyViews: [],
        topPages: [],
        recentVisits: [],
      };

    // 1. Update Daily Views (keep last 35 days)
    const dailyMap = new Map();
    for (const entry of existing.dailyViews || []) {
      if (entry?.date) dailyMap.set(entry.date, entry.views || 0);
    }
    dailyMap.set(todayKey, (dailyMap.get(todayKey) || 0) + 1);
    const updatedDailyViews = Array.from(dailyMap.entries())
      .map(([date, views]) => ({ _key: date, date, views }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 35);

    // 2. Update Top Pages (keep top 60 paths)
    const pageMap = new Map();
    for (const p of existing.topPages || []) {
      if (p?.path) {
        pageMap.set(p.path, {
          path: p.path,
          title: p.title || p.path,
          views: p.views || 0,
          lastVisitedAt: p.lastVisitedAt || nowIso,
        });
      }
    }
    const prevPage = pageMap.get(cleanPath);
    pageMap.set(cleanPath, {
      path: cleanPath,
      title: cleanTitle || prevPage?.title || cleanPath,
      views: (prevPage?.views || 0) + 1,
      lastVisitedAt: nowIso,
    });
    const updatedTopPages = Array.from(pageMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 60)
      .map((item, idx) => ({
        _key: `page-${idx}-${item.path.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
        ...item,
      }));

    // 3. Update Recent Visits (keep most recent 30 visits)
    const visitEntry = {
      _key: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      path: cleanPath,
      title: cleanTitle,
      device: deviceType,
      referrer: cleanReferrer,
    };
    const updatedRecentVisits = [visitEntry, ...(existing.recentVisits || [])].slice(0, 30);

    await writeClient.createOrReplace({
      _id: ANALYTICS_DOC_ID,
      _type: 'siteAnalytics',
      totalViews: (existing.totalViews || 0) + 1,
      desktopViews: (existing.desktopViews || 0) + (deviceType === 'desktop' ? 1 : 0),
      mobileViews: (existing.mobileViews || 0) + (deviceType === 'mobile' ? 1 : 0),
      tabletViews: (existing.tabletViews || 0) + (deviceType === 'tablet' ? 1 : 0),
      lastUpdatedAt: nowIso,
      dailyViews: updatedDailyViews,
      topPages: updatedTopPages,
      recentVisits: updatedRecentVisits,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Analytics track error:', err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
