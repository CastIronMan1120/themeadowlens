import React, { useEffect, useState, useCallback } from 'react';
import { useClient } from 'sanity';

export function SystemMetrics() {
  const client = useClient({ apiVersion: '2024-03-01', useCdn: false });
  const [data, setData] = useState({
    loading: true,
    storageCount: 0,
    storageBytes: 0,
    publishedCount: 0,
    warehouseCount: 0,
    venueCount: 0,
    leadCount: 0,
    analytics: null,
  });

  const fetchMetrics = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const result = await client.fetch(`{
        "storageCount": count(*[_type == "sanity.imageAsset"]),
        "storageBytes": math::sum(*[_type == "sanity.imageAsset"].size),
        "publishedCount": count(*[_type == "artwork" && !(_id in path("drafts.**")) && defined(category)]),
        "warehouseCount": count(*[_type == "artwork" && !defined(category)]),
        "venueCount": count(*[_type == "category" && !(_id in path("drafts.**"))]),
        "leadCount": count(*[_type == "lead"]),
        "analytics": *[_id == "siteAnalytics"][0]
      }`);
      setData({
        loading: false,
        storageCount: result.storageCount || 0,
        storageBytes: result.storageBytes || 0,
        publishedCount: result.publishedCount || 0,
        warehouseCount: result.warehouseCount || 0,
        venueCount: result.venueCount || 0,
        leadCount: result.leadCount || 0,
        analytics: result.analytics || null,
      });
    } catch (err) {
      console.error('Error fetching SystemMetrics:', err);
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [client]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const gbUsed = ((data.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2);
  const gbLimit = 5.0;
  const percentage = Math.min((parseFloat(gbUsed) / gbLimit) * 100, 100);

  const analytics = data.analytics || {};
  const totalViews = analytics.totalViews || 0;
  const desktopViews = analytics.desktopViews || 0;
  const mobileViews = (analytics.mobileViews || 0) + (analytics.tabletViews || 0);

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyViews = Array.isArray(analytics.dailyViews) ? analytics.dailyViews : [];
  const todayEntry = dailyViews.find((d) => d.date === todayKey);
  const viewsToday = todayEntry ? todayEntry.views : 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const viewsLast7Days = dailyViews
    .filter((d) => d.date >= sevenDaysAgo)
    .reduce((sum, d) => sum + (d.views || 0), 0);

  const topPages = Array.isArray(analytics.topPages) ? analytics.topPages.slice(0, 15) : [];
  const recentVisits = Array.isArray(analytics.recentVisits) ? analytics.recentVisits.slice(0, 15) : [];

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1320px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc',
        background: '#090d16',
        minHeight: '100vh',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingBottom: '1.5rem',
          marginBottom: '1.75rem',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '999px',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#34d399',
              }}
            >
              Live Website Analytics + Sanity Cloud Telemetry
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, color: '#ffffff' }}>
            Visitor Traffic, Top Pages &amp; System Storage
          </h2>
          <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', fontSize: '0.9rem' }}>
            Real-time page views, device breakdown, top-visited venues &amp; photographs, and Sanity Cloud storage metrics.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={fetchMetrics}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↻ Refresh Live Metrics
          </button>
          <a
            href="https://vercel.com/dmc112058-5136/themeadowlens-app/analytics"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              background: 'rgba(6, 78, 59, 0.55)',
              color: '#6ee7b7',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Open Vercel Web Analytics ↗
          </a>
        </div>
      </div>

      {/* SECTION 1: Traffic & Visitor KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Views Today ({todayKey})
          </p>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '2.1rem', fontWeight: 700, color: '#34d399' }}>
            {data.loading ? '...' : viewsToday.toLocaleString()}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Live frontend page views today
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Last 7 Days Views
          </p>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '2.1rem', fontWeight: 700, color: '#60a5fa' }}>
            {data.loading ? '...' : viewsLast7Days.toLocaleString()}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Rolling 7-day visitor page views
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Tracked Views
          </p>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '2.1rem', fontWeight: 700, color: '#f8fafc' }}>
            {data.loading ? '...' : totalViews.toLocaleString()}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Cumulative tracked frontend views
          </p>
        </div>

        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Device Breakdown
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c084fc' }}>
                💻 {data.loading ? '...' : desktopViews.toLocaleString()}
              </span>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Desktop / Laptop</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fbbf24' }}>
                📱 {data.loading ? '...' : mobileViews.toLocaleString()}
              </span>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Smartphone / Tablet</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Top Pages & Recent Visits */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Top Visited Pages, Venues & Photos */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              🔥 Most Visited Pages, Venues &amp; Photos
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Top {topPages.length} Routes</span>
          </div>

          {topPages.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              No page visits recorded yet. Visit any page on the live site and click Refresh!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {topPages.map((page, index) => (
                <div
                  key={page.path || index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span style={{ color: '#64748b', marginRight: '0.45rem', fontFamily: 'monospace' }}>
                        #{index + 1}
                      </span>
                      {page.title || page.path}
                    </div>
                    <a
                      href={`https://themeadowlens-app-green.vercel.app${page.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.74rem',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        textDecoration: 'none',
                      }}
                    >
                      {page.path} ↗
                    </a>
                  </div>
                  <div
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {page.views} {page.views === 1 ? 'view' : 'views'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visitor Activity Log */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              🕒 Recent Live Visitor Activity
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Latest {recentVisits.length} Page Hits</span>
          </div>

          {recentVisits.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Waiting for incoming visitor hits...
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {recentVisits.map((visit, index) => {
                const timeStr = visit.timestamp
                  ? new Date(visit.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : '';
                return (
                  <div
                    key={visit._key || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#e2e8f0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {visit.device === 'mobile' ? '📱 ' : '💻 '}
                        {visit.title || visit.path}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {visit.path} • {visit.referrer || 'Direct'}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {timeStr}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Sanity Cloud Content & 5GB Storage Overview */}
      <div
        style={{
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
          🗄️ Sanity Cloud Content Inventory &amp; 5GB Storage Allocation
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Live Published Photos</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>
              {data.publishedCount.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Warehouse (Unassigned)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>
              {data.warehouseCount.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Venues &amp; Sub-Venues</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>
              {data.venueCount.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Inquiry Leads (CRM)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f472b6', marginTop: '0.25rem' }}>
              {data.leadCount.toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Cloud Storage Used</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
              {gbUsed} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ {gbLimit} GB</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: percentage > 85 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981',
              transition: 'width 0.8s ease-in-out',
            }}
          />
        </div>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
          {percentage.toFixed(1)}% of 5.0 GB Sanity Cloud allocation used ({data.storageCount.toLocaleString()} total image assets)
        </p>
      </div>
    </div>
  );
}
