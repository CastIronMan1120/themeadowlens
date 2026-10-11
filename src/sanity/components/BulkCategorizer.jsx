import React, { useState, useEffect, useMemo } from 'react';
import { useClient } from 'sanity';

export function BulkCategorizer() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'az', 'za'

  // Fetch artworks missing a category and all available categories
  const fetchData = async () => {
    // Fetching with _createdAt so we can sort by newest/oldest natively
    const arts = await client.fetch(`*[_type == "artwork" && !defined(category)]{_id, title, _createdAt, "imageUrl": image.asset->url}`);
    const cats = await client.fetch(`*[_type == "category"]{_id, title} | order(title asc)`);
    setArtworks(arts);
    setCategories(cats);
  };

  useEffect(() => {
    fetchData();
  }, [client]);

  // Handle Client-Side Sorting
  const sortedArtworks = useMemo(() => {
    return [...artworks].sort((a, b) => {
      if (sortOrder === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'za') return (b.title || '').localeCompare(a.title || '');
      if (sortOrder === 'oldest') return new Date(a._createdAt) - new Date(b._createdAt);
      // Default to newest
      return new Date(b._createdAt) - new Date(a._createdAt);
    });
  }, [artworks, sortOrder]);

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

  // --- FEATURE: BULK UPLOAD WITH DUPLICATE CHECK ---
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    let uploadedCount = 0;
    let skippedCount = 0;
    const skippedFiles = [];

    for (const file of files) {
      // Clean title from filename (strip extension)
      const title = file.name.replace(/\.[^/.]+$/, "");
      
      // Duplicate Check Query
      const exists = await client.fetch(`count(*[_type == "artwork" && title == $title])`, { title });
      if (exists > 0) {
        skippedCount++;
        skippedFiles.push(file.name);
        continue;
      }

      try {
        // Upload Asset to Sanity Cloud
        const asset = await client.assets.upload('image', file, { filename: file.name });
        
        // Create Artwork Document (Forced as Draft)
        const draftId = `drafts.${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`;
        await client.create({
          _id: draftId,
          _type: 'artwork',
          title: title,
          image: { _type: 'image', asset: { _ref: asset._id } }
        });
        uploadedCount++;
      } catch (err) {
        console.error("Failed to upload", file.name, err);
      }
    }

    setIsUploading(false);
    fetchData(); // Refresh grid
    
    // Reset file input
    e.target.value = null; 

    // Alert User
    let msg = `Upload Complete!\nSuccessfully uploaded: ${uploadedCount} photos.`;
    if (skippedCount > 0) {
      msg += `\nSkipped ${skippedCount} duplicates: \n` + skippedFiles.slice(0, 5).join(', ') + (skippedFiles.length > 5 ? '...' : '');
    }
    alert(msg);
  };

  // --- FEATURE: BULK CATEGORIZE ---
  const handleApply = async () => {
    if (!selectedCategory || selectedArtworks.size === 0) return;
    setIsProcessing(true);

    try {
      const transaction = client.transaction();
      selectedArtworks.forEach(id => {
        transaction.patch(id, (p) => p.set({ category: { _type: 'reference', _ref: selectedCategory } }));
      });
      await transaction.commit();
      
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

  // --- FEATURE: BULK DELETE ---
  const handleDelete = async () => {
    if (selectedArtworks.size === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete these ${selectedArtworks.size} photos? This cannot be undone.`)) return;
    
    setIsProcessing(true);
    try {
      const transaction = client.transaction();
      selectedArtworks.forEach(id => {
        transaction.delete(id);
      });
      await transaction.commit();
      
      setSelectedArtworks(new Set());
      fetchData(); // Refresh grid
    } catch (error) {
      console.error(error);
      alert("Error deleting photos: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Warehouse & Bulk Categorizer</h1>
          <p style={{ color: '#666', margin: 0 }}>
            Upload new photos, manage drafts, and bulk-publish artworks to your live galleries.
          </p>
        </div>
        
        {/* WAREHOUSE UPLOADER */}
        <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>Upload New Photos</p>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            style={{ display: 'none' }}
            id="warehouse-upload"
          />
          <label 
            htmlFor="warehouse-upload" 
            style={{ 
              background: isUploading ? '#94a3b8' : '#3b82f6', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            {isUploading ? 'Uploading & Checking Duplicates...' : 'Select Files to Upload'}
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', background: '#f4f4f5', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
        {/* SORTING CONTROLS */}
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Title (A-Z)</option>
          <option value="za">Title (Z-A)</option>
        </select>

        <div style={{ width: '1px', height: '30px', background: '#ccc', margin: '0 0.5rem' }}></div>

        {/* CATEGORIZER CONTROLS */}
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
        >
          <option value="">-- Select a Venue to Publish --</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.title}</option>
          ))}
        </select>
        
        <button 
          onClick={handleApply}
          disabled={isProcessing || !selectedCategory || selectedArtworks.size === 0}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: isProcessing || !selectedCategory || selectedArtworks.size === 0 ? '#d4d4d8' : '#10b981', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isProcessing || !selectedCategory || selectedArtworks.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isProcessing ? 'Processing...' : `Publish ${selectedArtworks.size} Photos`}
        </button>

        {/* DELETE CONTROLS */}
        <button 
          onClick={handleDelete}
          disabled={isProcessing || selectedArtworks.size === 0}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: isProcessing || selectedArtworks.size === 0 ? '#d4d4d8' : '#ef4444', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isProcessing || selectedArtworks.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginLeft: 'auto'
          }}
        >
          Delete {selectedArtworks.size} Photos
        </button>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={selectAll} style={{ padding: '0.5rem 1rem', background: '#e4e4e7', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
          {selectedArtworks.size === artworks.length && artworks.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
        <span style={{ color: '#666' }}>Showing {sortedArtworks.length} unassigned drafts</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {sortedArtworks.map(art => (
          <div 
            key={art._id} 
            onClick={() => toggleArtwork(art._id)}
            style={{ 
              border: selectedArtworks.has(art._id) ? '4px solid #3b82f6' : '1px solid #e4e4e7', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              cursor: 'pointer',
              position: 'relative',
              boxShadow: selectedArtworks.has(art._id) ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'white', borderRadius: '6px', padding: '4px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <input type="checkbox" checked={selectedArtworks.has(art._id)} readOnly style={{ margin: 0, display: 'block', width: '18px', height: '18px' }} />
            </div>
            {art.imageUrl ? (
              <img src={`${art.imageUrl}?h=200&fit=max`} alt={art.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '180px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
            )}
            <div style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: '#fff' }}>
              {art.title || 'Untitled'}
            </div>
          </div>
        ))}
        {artworks.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
            <h3>No unassigned artworks found!</h3>
            <p>Upload new photos above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
