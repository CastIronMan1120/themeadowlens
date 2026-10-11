import React, { useEffect, useState } from 'react';
import { useClient } from 'sanity';

export function SystemMetrics() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [metrics, setMetrics] = useState({ count: 0, bytes: 0, loading: true });

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const result = await client.fetch(`{
          "count": count(*[_type == "sanity.imageAsset"]),
          "bytes": math::sum(*[_type == "sanity.imageAsset"].size)
        }`);
        setMetrics({ count: result.count, bytes: result.bytes, loading: false });
      } catch (err) {
        console.error(err);
        setMetrics({ ...metrics, loading: false });
      }
    };
    fetchStorage();
  }, [client]);

  const gbUsed = (metrics.bytes / (1024 * 1024 * 1024)).toFixed(2);
  const gbLimit = 5.0; // Free tier limit
  const percentage = Math.min((gbUsed / gbLimit) * 100, 100);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Server & Storage Metrics</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Real-time usage of your 5GB Sanity Cloud Allocation.</p>

      {metrics.loading ? (
        <p>Calculating cloud usage...</p>
      ) : (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Master Files</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{metrics.count}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storage Used</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{gbUsed} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {gbLimit} GB</span></p>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${percentage}%`, 
              background: percentage > 85 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981',
              transition: 'width 1s ease-in-out'
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
            {percentage.toFixed(1)}% of your cloud allocation used
          </p>
        </div>
      )}
    </div>
  );
}
