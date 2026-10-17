import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useClient } from 'sanity';

export function VenueGridManager({
  documentId,
  initialMode = 'warehouse', // 'warehouse' | 'all' | 'venue'
}) {
  const client = useClient({ apiVersion: '2024-01-01' });

  const cleanDocId = documentId ? documentId.replace(/^drafts\./, '') : '';

  const [viewMode, setViewMode] = useState(cleanDocId ? 'venue' : initialMode);
  const [activeVenueId, setActiveVenueId] = useState(cleanDocId || '');
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState(new Set());
  const [targetVenueId, setTargetVenueId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [thumbSize, setThumbSize] = useState('large'); // 'medium' | 'large' | 'xlarge'
  const [showVenueDeletionPanel, setShowVenueDeletionPanel] = useState(false);

  // Sync if Sanity Desk passes a new documentId when user clicks a different Venue/Sub-Venue in the sidebar
  useEffect(() => {
    if (cleanDocId) {
      setViewMode('venue');
      setActiveVenueId(cleanDocId);
      setSelectedArtworks(new Set());
    } else if (initialMode) {
      setViewMode(initialMode);
      setSelectedArtworks(new Set());
    }
  }, [cleanDocId, initialMode]);

  const fetchData = useCallback(async () => {
    setIsProcessing(true);
    try {
      const cats = await client.fetch(`*[_type == "category"] | order(title asc) {
        _id,
        title,
        "slug": slug.current,
        "parentId": parentCategory._ref,
        "parentTitle": parentCategory->title,
        "photoCount": count(*[_type == "artwork" && (category._ref == ^._id || subcategory._ref == ^._id)])
      }`);
      setCategories(cats);

      let artQuery = '';
      let params = {};

      if (viewMode === 'warehouse') {
        artQuery = `*[_type == "artwork" && !defined(category)] {
          _id,
          title,
          slug,
          _createdAt,
          image,
          "imageUrl": image.asset->url,
          "categoryId": category._ref,
          "categoryTitle": category->title,
          "subcategoryId": subcategory._ref,
          "subcategoryTitle": subcategory->title,
          species,
          caption,
          displayTitle
        }`;
      } else if (viewMode === 'all') {
        artQuery = `*[_type == "artwork"] {
          _id,
          title,
          slug,
          _createdAt,
          image,
          "imageUrl": image.asset->url,
          "categoryId": category._ref,
          "categoryTitle": category->title,
          "subcategoryId": subcategory._ref,
          "subcategoryTitle": subcategory->title,
          species,
          caption,
          displayTitle
        }`;
      } else if (viewMode === 'venue' && activeVenueId) {
        artQuery = `*[_type == "artwork" && (category._ref == $venueId || subcategory._ref == $venueId || category->parentCategory._ref == $venueId)] {
          _id,
          title,
          slug,
          _createdAt,
          image,
          "imageUrl": image.asset->url,
          "categoryId": category._ref,
          "categoryTitle": category->title,
          "subcategoryId": subcategory._ref,
          "subcategoryTitle": subcategory->title,
          species,
          caption,
          displayTitle
        }`;
        params = { venueId: activeVenueId };
      } else {
        setArtworks([]);
        setIsProcessing(false);
        return;
      }

      const arts = await client.fetch(artQuery, params);
      setArtworks(arts);
    } catch (err) {
      console.error('Error loading VenueGridManager data:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [client, viewMode, activeVenueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Organize categories into Root Venues and Sub-Venues for clean dropdowns
  const { rootVenues, subVenues, activeVenueObj } = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    const subs = categories.filter((c) => c.parentId);
    const active = categories.find((c) => c._id === activeVenueId) || null;
    return { rootVenues: roots, subVenues: subs, activeVenueObj: active };
  }, [categories, activeVenueId]);

  // Filter & Sort Artworks
  const filteredArtworks = useMemo(() => {
    let list = [...artworks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.categoryTitle || '').toLowerCase().includes(q) ||
          (a.species || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (sortOrder === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'za') return (b.title || '').localeCompare(a.title || '');
      if (sortOrder === 'oldest') return new Date(a._createdAt) - new Date(b._createdAt);
      return new Date(b._createdAt) - new Date(a._createdAt);
    });
  }, [artworks, sortOrder, searchQuery]);

  const toggleArtwork = (id) => {
    const next = new Set(selectedArtworks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedArtworks(next);
  };

  const selectAll = () => {
    if (selectedArtworks.size === filteredArtworks.length && filteredArtworks.length > 0) {
      setSelectedArtworks(new Set());
    } else {
      setSelectedArtworks(new Set(filteredArtworks.map((a) => a._id)));
    }
  };

  // Helper to slugify title when publishing drafts that might lack a slug
  const makeSlug = (str) =>
    (str || 'artwork')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6);

  // --- 1. UPLOAD NEW PHOTOS TO WAREHOUSE ---
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let skippedCount = 0;
    const skippedFiles = [];

    for (const file of files) {
      const title = file.name.replace(/\.[^/.]+$/, '');
      const exists = await client.fetch(`count(*[_type == "artwork" && title == $title])`, { title });
      if (exists > 0) {
        skippedCount++;
        skippedFiles.push(file.name);
        continue;
      }

      try {
        const asset = await client.assets.upload('image', file, { filename: file.name });
        const draftId = `drafts.${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`;
        const targetCategoryRef =
          viewMode === 'venue' && activeVenueId
            ? { _type: 'reference', _ref: activeVenueId }
            : undefined;

        await client.create({
          _id: targetCategoryRef ? draftId.replace(/^drafts\./, '') : draftId,
          _type: 'artwork',
          title,
          slug: { _type: 'slug', current: makeSlug(title) },
          image: { _type: 'image', asset: { _ref: asset._id } },
          ...(targetCategoryRef ? { category: targetCategoryRef } : {}),
        });
        uploadedCount++;
      } catch (err) {
        console.error('Failed to upload', file.name, err);
      }
    }

    setIsUploading(false);
    fetchData();
    e.target.value = null;

    let msg = `Upload Complete!\nSuccessfully uploaded: ${uploadedCount} photos.`;
    if (skippedCount > 0) {
      msg +=
        `\nSkipped ${skippedCount} duplicates:\n` +
        skippedFiles.slice(0, 5).join(', ') +
        (skippedFiles.length > 5 ? '...' : '');
    }
    window.alert(msg);
  };

  // --- 2. MOVE-TO (OR PUBLISH FROM WAREHOUSE) ---
  const handleMoveTo = async () => {
    if (!targetVenueId || selectedArtworks.size === 0) return;
    const targetCat = categories.find((c) => c._id === targetVenueId);
    const targetName = targetCat ? targetCat.title : 'selected venue';

    setIsProcessing(true);
    try {
      const transaction = client.transaction();

      for (const id of selectedArtworks) {
        const art = artworks.find((a) => a._id === id);
        const patchData = {
          category: { _type: 'reference', _ref: targetVenueId },
        };
        if (art && !art.slug?.current) {
          patchData.slug = { _type: 'slug', current: makeSlug(art.title) };
        }
        transaction.patch(id, (p) => p.set(patchData).unset(['subcategory']));
      }

      await transaction.commit();
      setSelectedArtworks(new Set());
      await fetchData();
      window.alert(`Moved ${selectedArtworks.size} photo(s) to "${targetName}"!`);
    } catch (error) {
      console.error(error);
      window.alert('Error moving photos: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. COPY-TO ANOTHER VENUE / SUB-VENUE ---
  const handleCopyTo = async () => {
    if (!targetVenueId || selectedArtworks.size === 0) return;
    const targetCat = categories.find((c) => c._id === targetVenueId);
    const targetName = targetCat ? targetCat.title : 'selected venue';

    setIsProcessing(true);
    try {
      const transaction = client.transaction();
      let copied = 0;

      for (const id of selectedArtworks) {
        const art = artworks.find((a) => a._id === id);
        if (!art || !art.image?.asset?._ref) continue;

        const newId = `art-copy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        transaction.create({
          _id: newId,
          _type: 'artwork',
          title: art.title || 'Untitled',
          slug: { _type: 'slug', current: makeSlug(art.title) },
          image: art.image,
          category: { _type: 'reference', _ref: targetVenueId },
          ...(art.species ? { species: art.species } : {}),
          ...(art.caption ? { caption: art.caption } : {}),
          ...(art.displayTitle ? { displayTitle: art.displayTitle } : {}),
        });
        copied++;
      }

      await transaction.commit();
      setSelectedArtworks(new Set());
      await fetchData();
      window.alert(`Copied ${copied} photo(s) into "${targetName}" (0 extra storage used)!`);
    } catch (error) {
      console.error(error);
      window.alert('Error copying photos: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 4. DECATEGORIZE (SEND BACK TO WAREHOUSE) ---
  const handleDecategorize = async () => {
    if (selectedArtworks.size === 0) return;
    if (
      !window.confirm(
        `Send ${selectedArtworks.size} selected photo(s) back to The Warehouse (Uncategorized)?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = client.transaction();
      selectedArtworks.forEach((id) => {
        transaction.patch(id, (p) => p.unset(['category', 'subcategory']));
      });
      await transaction.commit();
      setSelectedArtworks(new Set());
      await fetchData();
      window.alert(`Sent ${selectedArtworks.size} photo(s) back to The Warehouse!`);
    } catch (error) {
      console.error(error);
      window.alert('Error decategorizing photos: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 5. DELETE SELECTED PHOTOS ---
  const handleDeletePhotos = async () => {
    if (selectedArtworks.size === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently DELETE ${selectedArtworks.size} selected photo(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedArtworks);
      const transaction = client.transaction();
      idsArray.forEach((id) => {
        transaction.delete(id);
        if (!id.startsWith('drafts.')) {
          transaction.delete(`drafts.${id}`);
        }
      });
      await transaction.commit();

      setSelectedArtworks(new Set());
      await fetchData();
      window.alert(`Deleted ${idsArray.length} photo(s).`);
    } catch (error) {
      console.error(error);
      window.alert('Error deleting photos: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 6. DELETE ROOT VENUE OR SUB-VENUE ---
  const handleDeleteVenue = async (venueIdToDelete) => {
    const venue = categories.find((c) => c._id === venueIdToDelete);
    if (!venue) return;

    const childSubVenues = categories.filter((c) => c.parentId === venueIdToDelete);
    const attachedPhotos = await client.fetch(
      `*[_type == "artwork" && (category._ref == $id || subcategory._ref == $id)]{_id}`,
      { id: venueIdToDelete }
    );

    let confirmMsg = `Are you sure you want to permanently DELETE the ${
      venue.parentId ? `Sub-Venue "${venue.title}"` : `Root Venue "${venue.title}"`
    }?`;

    if (attachedPhotos.length > 0) {
      confirmMsg += `\n\nNOTE: This venue currently has ${attachedPhotos.length} photo(s). Proceeding will automatically send those ${attachedPhotos.length} photo(s) back to The Warehouse before deleting the venue.`;
    }
    if (childSubVenues.length > 0) {
      confirmMsg += `\n\nNOTE: This Root Venue has ${childSubVenues.length} sub-venue(s) (${childSubVenues
        .map((s) => s.title)
        .join(', ')}). Their parent link will be cleared so they can be reassigned or deleted.`;
    }

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const tx = client.transaction();

      // 1. Unset category/subcategory references on attached artworks
      attachedPhotos.forEach((art) => {
        tx.patch(art._id, (p) => p.unset(['category', 'subcategory']));
      });

      // 2. Unset parentCategory on any child sub-venues
      childSubVenues.forEach((sub) => {
        tx.patch(sub._id, (p) => p.unset(['parentCategory']));
      });

      // 3. Delete both published and draft versions of the category document
      tx.delete(venueIdToDelete);
      tx.delete(`drafts.${venueIdToDelete}`);

      await tx.commit();

      if (activeVenueId === venueIdToDelete) {
        setActiveVenueId('');
        if (!cleanDocId) setViewMode('warehouse');
      }

      await fetchData();
      window.alert(`Successfully deleted venue "${venue.title}"!`);
    } catch (error) {
      console.error('Error deleting venue:', error);
      window.alert('Error deleting venue: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Grid dimensions based on user's selected thumbnail size
  const gridMinWidth = thumbSize === 'xlarge' ? '340px' : thumbSize === 'large' ? '260px' : '200px';
  const imgHeight = thumbSize === 'xlarge' ? '280px' : thumbSize === 'large' ? '220px' : '165px';

  return (
    <div
      style={{
        padding: '1.5rem 2rem',
        maxWidth: '1800px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#18181b',
      }}
    >
      {/* TOP HEADER BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>
              {viewMode === 'warehouse' && 'The Warehouse: Unassigned Photos'}
              {viewMode === 'all' && 'The Warehouse: All Uploaded Photos (Grid View)'}
              {viewMode === 'venue' &&
                (activeVenueObj
                  ? `${activeVenueObj.parentTitle ? `${activeVenueObj.parentTitle} ▸ ` : ''}${activeVenueObj.title}`
                  : 'Venue / Sub-Venue Photo Manager')}
            </h1>

            {viewMode === 'venue' && activeVenueObj && (
              <button
                onClick={() => handleDeleteVenue(activeVenueObj._id)}
                disabled={isProcessing}
                style={{
                  padding: '0.45rem 0.9rem',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                Delete This {activeVenueObj.parentId ? 'Sub-Venue' : 'Root Venue'}
              </button>
            )}
          </div>

          <p style={{ color: '#475569', margin: '0.4rem 0 0 0', fontSize: '0.95rem' }}>
            {viewMode === 'warehouse' &&
              'Photos waiting to be assigned to a Root Venue or Sub-Venue. Check photos below to Publish/Move or Delete.'}
            {viewMode === 'all' &&
              'Large visual identification grid of every uploaded photo across your entire collection.'}
            {viewMode === 'venue' &&
              'Check any photos in this venue to Move-To, Copy-To, Decategorize (send back to Warehouse), or Delete.'}
          </p>
        </div>

        {/* UPLOAD & VENUE DELETION TOGGLE */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowVenueDeletionPanel(!showVenueDeletionPanel)}
            style={{
              padding: '0.7rem 1.1rem',
              background: showVenueDeletionPanel ? '#1e293b' : '#f1f5f9',
              color: showVenueDeletionPanel ? '#fff' : '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {showVenueDeletionPanel ? 'Close Venue Cleanup Manager' : 'Manage / Delete Venues & Sub-Venues'}
          </button>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            style={{ display: 'none' }}
            id="venue-grid-upload"
          />
          <label
            htmlFor="venue-grid-upload"
            style={{
              background: isUploading ? '#94a3b8' : '#2563eb',
              color: 'white',
              padding: '0.7rem 1.25rem',
              borderRadius: '8px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-block',
            }}
          >
            {isUploading
              ? 'Uploading & Checking Duplicates...'
              : viewMode === 'venue' && activeVenueObj
              ? `+ Upload Directly to "${activeVenueObj.title}"`
              : '+ Upload New Photos to Warehouse'}
          </label>
        </div>
      </div>

      {/* COLLAPSIBLE ROOT VENUE & SUB-VENUE DELETION PANEL */}
      {showVenueDeletionPanel && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#9f1239', fontSize: '1.05rem' }}>
                Root Venue & Sub-Venue Deletion Manager
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#881337' }}>
                Click any Root Venue or Sub-Venue below to view its photos, or click the red <strong>Delete</strong> button to permanently remove it.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.6rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {categories.map((cat) => (
              <div
                key={cat._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #fda4af',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  onClick={() => {
                    setViewMode('venue');
                    setActiveVenueId(cat._id);
                  }}
                  style={{ cursor: 'pointer', flex: 1, paddingRight: '0.5rem' }}
                  title="Click to inspect photos in this venue"
                >
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {cat.title}{' '}
                    <span style={{ fontWeight: 400, color: '#64748b' }}>({cat.photoCount} photos)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {cat.parentTitle ? `Sub-Venue of ${cat.parentTitle}` : 'Root Venue'}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteVenue(cat._id)}
                  disabled={isProcessing}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE & VENUE NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1rem',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => {
              setViewMode('warehouse');
              setSelectedArtworks(new Set());
            }}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: viewMode === 'warehouse' ? '#0f172a' : '#fff',
              color: viewMode === 'warehouse' ? '#fff' : '#334155',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Unassigned Warehouse
          </button>
          <button
            onClick={() => {
              setViewMode('all');
              setSelectedArtworks(new Set());
            }}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: viewMode === 'all' ? '#0f172a' : '#fff',
              color: viewMode === 'all' ? '#fff' : '#334155',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            All Uploaded Photos (Grid)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
            Inspect Venue / Sub-Venue:
          </span>
          <select
            value={viewMode === 'venue' ? activeVenueId : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setViewMode('venue');
                setActiveVenueId(val);
                setSelectedArtworks(new Set());
              }
            }}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontWeight: 600,
              color: '#0f172a',
              flex: 1,
              maxWidth: '420px',
            }}
          >
            <option value="">-- Choose a Root Venue or Sub-Venue to Maintain --</option>
            <optgroup label="Root Venues (Main)">
              {rootVenues.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.title} ({cat.photoCount} photos)
                </option>
              ))}
            </optgroup>
            <optgroup label="Sub-Venues (Subcategories)">
              {subVenues.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.parentTitle ? `${cat.parentTitle} ▸ ` : ''}
                  {cat.title} ({cat.photoCount} photos)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* SEARCH & THUMBNAIL SIZE CONTROLS */}
        <input
          type="text"
          placeholder="Search by photo title or species..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            minWidth: '210px',
            fontSize: '0.85rem',
          }}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#fff',
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Title (A-Z)</option>
          <option value="za">Title (Z-A)</option>
        </select>

        <select
          value={thumbSize}
          onChange={(e) => setThumbSize(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#fff',
          }}
          title="Adjust photo size for easier identification"
        >
          <option value="medium">Medium Thumbnails</option>
          <option value="large">Large ID Thumbnails</option>
          <option value="xlarge">Extra-Large ID Thumbnails</option>
        </select>
      </div>

      {/* BATCH ACTION BAR (MOVE-TO, COPY-TO, DECATEGORIZE, DELETE) */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '0.9rem 1.1rem',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          flexWrap: 'wrap',
          position: 'sticky',
          top: '0.5rem',
          zIndex: 30,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={selectAll}
          style={{
            padding: '0.6rem 1rem',
            background: '#ffffff',
            border: '1px solid #94a3b8',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {selectedArtworks.size === filteredArtworks.length && filteredArtworks.length > 0
            ? 'Deselect All'
            : `Select All (${filteredArtworks.length})`}
        </button>

        <span
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: selectedArtworks.size > 0 ? '#1d4ed8' : '#64748b',
            minWidth: '110px',
          }}
        >
          {selectedArtworks.size} Checked
        </span>

        <div style={{ width: '1px', height: '28px', background: '#cbd5e1' }} />

        {/* TARGET VENUE SELECTOR FOR MOVE-TO & COPY-TO */}
        <select
          value={targetVenueId}
          onChange={(e) => setTargetVenueId(e.target.value)}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #94a3b8',
            minWidth: '260px',
            background: '#fff',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <option value="">-- Select Target Venue / Sub-Venue --</option>
          <optgroup label="Root Venues (Main)">
            {rootVenues.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Sub-Venues (Subcategories)">
            {subVenues.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.parentTitle ? `${cat.parentTitle} ▸ ` : ''}
                {cat.title}
              </option>
            ))}
          </optgroup>
        </select>

        {/* ACTION 1: MOVE-TO */}
        <button
          onClick={handleMoveTo}
          disabled={isProcessing || !targetVenueId || selectedArtworks.size === 0}
          style={{
            padding: '0.6rem 1.15rem',
            background:
              isProcessing || !targetVenueId || selectedArtworks.size === 0 ? '#cbd5e1' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor:
              isProcessing || !targetVenueId || selectedArtworks.size === 0
                ? 'not-allowed'
                : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
          title="Move checked photos into the selected target venue"
        >
          Move-To ({selectedArtworks.size})
        </button>

        {/* ACTION 2: COPY-TO */}
        <button
          onClick={handleCopyTo}
          disabled={isProcessing || !targetVenueId || selectedArtworks.size === 0}
          style={{
            padding: '0.6rem 1.15rem',
            background:
              isProcessing || !targetVenueId || selectedArtworks.size === 0 ? '#cbd5e1' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor:
              isProcessing || !targetVenueId || selectedArtworks.size === 0
                ? 'not-allowed'
                : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
          title="Copy checked photos into the selected target venue without using extra storage"
        >
          Copy-To ({selectedArtworks.size})
        </button>

        {/* ACTION 3: DECATEGORIZE (SEND BACK TO WAREHOUSE) */}
        <button
          onClick={handleDecategorize}
          disabled={isProcessing || selectedArtworks.size === 0}
          style={{
            padding: '0.6rem 1.15rem',
            background: isProcessing || selectedArtworks.size === 0 ? '#cbd5e1' : '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessing || selectedArtworks.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
          title="Remove category assignment and send checked photos back to The Warehouse"
        >
          Decategorize / To Warehouse ({selectedArtworks.size})
        </button>

        {/* ACTION 4: DELETE */}
        <button
          onClick={handleDeletePhotos}
          disabled={isProcessing || selectedArtworks.size === 0}
          style={{
            padding: '0.6rem 1.15rem',
            background: isProcessing || selectedArtworks.size === 0 ? '#cbd5e1' : '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessing || selectedArtworks.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginLeft: 'auto',
          }}
          title="Permanently delete checked photos"
        >
          Delete ({selectedArtworks.size})
        </button>
      </div>

      {/* PHOTO COUNT STATUS */}
      <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.9rem' }}>
        <span>
          Showing <strong>{filteredArtworks.length}</strong> photo(s)
          {viewMode === 'venue' && activeVenueObj ? ` in "${activeVenueObj.title}"` : ''}
        </span>
        {isProcessing && <span style={{ color: '#2563eb', fontWeight: 600 }}>Syncing with Sanity Cloud...</span>}
      </div>

      {/* LARGE VISUAL IDENTIFICATION GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinWidth}, 1fr))`,
          gap: '1.25rem',
        }}
      >
        {filteredArtworks.map((art) => {
          const isChecked = selectedArtworks.has(art._id);
          return (
            <div
              key={art._id}
              onClick={() => toggleArtwork(art._id)}
              style={{
                border: isChecked ? '3px solid #2563eb' : '1px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: '#ffffff',
                boxShadow: isChecked
                  ? '0 8px 20px rgba(37, 99, 235, 0.25)'
                  : '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {/* CHECKBOX OVERLAY */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: isChecked ? '#2563eb' : 'rgba(255,255,255,0.95)',
                  borderRadius: '6px',
                  padding: '5px',
                  zIndex: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  style={{ margin: 0, width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* VENUE BADGE OVERLAY */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: art.categoryTitle ? 'rgba(15, 23, 42, 0.85)' : 'rgba(217, 119, 6, 0.9)',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  zIndex: 10,
                  maxWidth: '65%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {art.categoryTitle || 'In Warehouse'}
              </div>

              {/* LARGE CRISP THUMBNAIL FOR EASY IDENTIFICATION */}
              {art.imageUrl ? (
                <div style={{ width: '100%', height: imgHeight, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`${art.imageUrl}?w=600&fit=max`}
                    alt={art.title || 'Artwork'}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: imgHeight,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                >
                  No Image Asset
                </div>
              )}

              {/* PHOTO DETAILS FOOTER */}
              <div style={{ padding: '0.75rem 0.9rem', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={art.title}
                >
                  {art.title || 'Untitled'}
                </div>
                {art.species && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Species: {art.species}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!isProcessing && filteredArtworks.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>No photos found in this view</h3>
            <p style={{ margin: 0 }}>
              {viewMode === 'venue'
                ? 'This venue currently has 0 photos. You can upload photos directly or delete this venue using the red button above.'
                : 'Try switching views or uploading new photos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
