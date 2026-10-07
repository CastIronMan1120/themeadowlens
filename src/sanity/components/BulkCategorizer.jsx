import React, { useState, useEffect } from 'react';
import { useClient } from 'sanity';

export function BulkCategorizer() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch artworks missing a category and all available categories
  useEffect(() => {
    const fetchData = async () => {
      const arts = await client.fetch(`*[_type == "artwork" && !defined(category)]{_id, title, "imageUrl": image.asset->url}`);
      const cats = await client.fetch(`*[_type == "category"]{_id, title} | order(title asc)`);
      setArtworks(arts);
      setCategories(cats);
    };
    fetchData();
  }, [client]);

  const toggleArtwork = (id) => {
    const newSet = new Set(selectedArtworks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedArtworks(newSet);
  };

  const selectAll = () => {
    if (selectedArtworks.size === artworks.length) {
      setSelectedArtworks(new Set());
    } else {
      setSelectedArtworks(new Set(artworks.map(a => a._id)));
    }
  };

  const handleApply = async () => {
    if (!selectedCategory || selectedArtworks.size === 0) return;
    setIsProcessing(true);

    try {
      // Build a transaction to update all selected artworks
      const transaction = client.transaction();
      selectedArtworks.forEach(id => {
        // Find if it's a draft or published
        const publishedId = id.replace('drafts.', '');
        transaction.patch(id, (p) => p.set({ category: { _type: 'reference', _ref: selectedCategory } }));
      });
      
      await transaction.commit();
      
      // Remove updated artworks from the list
      setArtworks(artworks.filter(a => !selectedArtworks.has(a._id)));
      setSelectedArtworks(new Set());
      alert("Successfully categorized and published!");
    } catch (error) {
      console.error(error);
      alert("Error applying categories: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bulk Categorizer</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Select multiple photos that are missing a venue, choose a category, and apply them all at once.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', background: '#f4f4f5', padding: '1rem', borderRadius: '8px' }}>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
        >
          <option value="">-- Select a Category --</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.title}</option>
          ))}
        </select>
        
        <button 
          onClick={handleApply}
          disabled={isProcessing || !selectedCategory || selectedArtworks.size === 0}
          style={{ 
            padding: '0.5rem 1rem', 
            background: isProcessing || !selectedCategory || selectedArtworks.size === 0 ? '#ccc' : '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isProcessing || !selectedCategory || selectedArtworks.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isProcessing ? 'Processing...' : `Apply Category to ${selectedArtworks.size} Photos`}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={selectAll} style={{ padding: '0.5rem', background: '#e4e4e7', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {selectedArtworks.size === artworks.length && artworks.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {artworks.map(art => (
          <div 
            key={art._id} 
            onClick={() => toggleArtwork(art._id)}
            style={{ 
              border: selectedArtworks.has(art._id) ? '3px solid #3b82f6' : '1px solid #e4e4e7', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'white', borderRadius: '4px', padding: '2px' }}>
              <input type="checkbox" checked={selectedArtworks.has(art._id)} readOnly style={{ margin: 0, display: 'block' }} />
            </div>
            {art.imageUrl ? (
              <img src={`${art.imageUrl}?h=200&fit=max`} alt={art.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '150px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
            )}
            <div style={{ padding: '0.5rem', fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {art.title || 'Untitled'}
            </div>
          </div>
        ))}
        {artworks.length === 0 && (
          <p>No unassigned artworks found! You are all caught up.</p>
        )}
      </div>
    </div>
  );
}
