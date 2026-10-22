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
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [guestForm, setGuestForm] = useState({
    file: null,
    previewUrl: '',
    displayTitle: '',
    guestPhotographer: '',
    guestSocialUrl: '',
    guestNote:
      'Selected by invitation from the nature photography community for the Featured Guest Showcase on The Meadow Lens.',
    species: '',
    location: '',
    year: new Date().getFullYear().toString(),
    caption: '',
  });

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
        speciesDescription,
        seo,
        "parentId": parentCategory._ref,
        "parentTitle": parentCategory->title,
        "parentSlug": parentCategory->slug.current,
        "photoCount": count(*[_type == "artwork" && (category._ref == ^._id || subcategory._ref == ^._id)]),
        "subVenuePhotoCount": count(*[_type == "artwork" && category->parentCategory._ref == ^._id])
      }`);
      setCategories(cats);

      // If the user clicked the '+' button in Sanity Structure to create a new Root Venue or Sub-Venue,
      // cleanDocId will be a brand-new ID not yet in categories (or lacking a title). Automatically open the Add/Edit Venue Modal!
      if (cleanDocId) {
        const existingCat = cats.find(
          (c) => c._id === cleanDocId || c._id === `drafts.${cleanDocId}`
        );
        if (!existingCat || !existingCat.title) {
          setEditingVenue((prev) =>
            prev && prev._id === cleanDocId
              ? prev
              : {
                  _id: cleanDocId,
                  isNew: true,
                  title: existingCat?.title || '',
                  slug: existingCat?.slug || '',
                  parentId: existingCat?.parentId || '',
                  speciesDescription: existingCat?.speciesDescription || '',
                  seo: existingCat?.seo || {},
                }
          );
        }
      }

      let artQuery = '';
      let params = {};
      const projection = `{
        _id,
        title,
        fileName,
        slug,
        _createdAt,
        image,
        "imageUrl": image.asset->url,
        "categoryId": category._ref,
        "categoryTitle": category->title,
        "categoryParentTitle": category->parentCategory->title,
        "subcategoryId": subcategory._ref,
        "subcategoryTitle": subcategory->title,
        species,
        caption,
        displayTitle,
        location,
        year,
        size,
        roomSetting,
        status,
        edition,
        seo,
        guestPhotographer,
        guestSocialUrl,
        guestNote
      }`;

      if (viewMode === 'warehouse') {
        artQuery = `*[_type == "artwork" && !defined(category)] ${projection}`;
      } else if (viewMode === 'all') {
        artQuery = `*[_type == "artwork"] ${projection}`;
      } else if (viewMode === 'venue' && activeVenueId) {
        artQuery = `*[_type == "artwork" && (category._ref == $venueId || subcategory._ref == $venueId)] ${projection}`;
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
  }, [client, viewMode, activeVenueId, cleanDocId]);

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
          (a.displayTitle || '').toLowerCase().includes(q) ||
          (a.categoryTitle || '').toLowerCase().includes(q) ||
          (a.species || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (sortOrder === 'az') return (a.displayTitle || a.title || '').localeCompare(b.displayTitle || b.title || '');
      if (sortOrder === 'za') return (b.displayTitle || b.title || '').localeCompare(a.displayTitle || a.title || '');
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

  const makeCleanVenueSlug = (str) =>
    (str || 'venue')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  // Helper to derive Picture Title (Caption), Species, and Year from the front of the filename
  // up to, but not including, the 2-digit year prefix (e.g. "American Goldfinch 24-PA031058 Edit.jpg" -> "American Goldfinch", year "2024")
  const extractPhotoMetadataFromFilename = (rawFilename) => {
    const rawBaseName = (rawFilename || '').replace(/\.[^/.]+$/, '').trim();
    const yearPrefixMatch = rawBaseName.match(/^(.+?)\s+(\d{2})-[A-Za-z0-9]/);
    if (yearPrefixMatch && yearPrefixMatch[1].trim().length > 0) {
      const cleanCaption = yearPrefixMatch[1].trim();
      const yy = parseInt(yearPrefixMatch[2], 10);
      const fullYear = yy >= 70 ? `19${yearPrefixMatch[2]}` : `20${yearPrefixMatch[2]}`;
      return { cleanCaption, year: fullYear, rawBaseName };
    }
    const studyMatch = rawBaseName.match(/^(.+?)\s+-\s+Study/i);
    if (studyMatch && studyMatch[1].trim().length > 0) {
      return { cleanCaption: studyMatch[1].trim(), year: '', rawBaseName };
    }
    return { cleanCaption: rawBaseName, year: '', rawBaseName };
  };

  // --- 1. UPLOAD NEW PHOTOS TO WAREHOUSE (OR ACTIVE VENUE) ---
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let skippedCount = 0;
    const skippedFiles = [];

    for (const file of files) {
      const { cleanCaption, year, rawBaseName } = extractPhotoMetadataFromFilename(file.name);
      const exists = await client.fetch(
        `count(*[_type == "artwork" && (fileName == $fileName || title == $rawBaseName)])`,
        { fileName: file.name, rawBaseName }
      );
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
        const venueObj = activeVenueId ? categories.find((c) => c._id === activeVenueId) : null;
        const venueTitle = venueObj ? venueObj.title : 'The Meadowlands';
        const studyMatch = file.name.match(/(?:[A-Za-z0-9_-]*?)(\d{4,})(?:\b|[-_.]|Edit)/i);
        const studyCode =
          studyMatch && studyMatch[1]
            ? studyMatch[1].slice(-4)
            : draftId.replace(/^drafts\./, '').slice(-4).toUpperCase() || '0001';
        const yearLabel = year ? `${year} ` : '';

        await client.create({
          _id: targetCategoryRef ? draftId.replace(/^drafts\./, '') : draftId,
          _type: 'artwork',
          title: cleanCaption,
          displayTitle: cleanCaption,
          caption: cleanCaption,
          species: cleanCaption,
          location: 'The Meadowlands, New Jersey',
          ...(year ? { year } : {}),
          fileName: file.name,
          slug: { _type: 'slug', current: makeSlug(cleanCaption) },
          image: { _type: 'image', asset: { _ref: asset._id } },
          seo: {
            metaTitle: `${cleanCaption} — ${venueTitle} (${yearLabel}Study #${studyCode}) | The Meadow Lens`,
            metaDescription: `Collector fine art photograph "${cleanCaption}" (${yearLabel}${venueTitle} Exhibition, Study #${studyCode}) captured in the New Jersey Meadowlands by David McClure.`,
            keywords: [
              cleanCaption,
              `${cleanCaption} ${venueTitle}`,
              `${cleanCaption} Study ${studyCode}`,
              venueTitle,
              'The Meadowlands',
              'Atlantic Flyway',
              'David McClure',
              'The Meadow Lens',
            ],
          },
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

    let msg = `Upload Complete!\nSuccessfully uploaded: ${uploadedCount} photo(s) with automatic front-of-file caption extraction.`;
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
    const moveCount = selectedArtworks.size;

    setIsProcessing(true);
    try {
      const idsToMove = Array.from(selectedArtworks);
      const fullDocs = await client.fetch(`*[_id in $ids]`, { ids: idsToMove });
      const transaction = client.transaction();

      for (const doc of fullDocs) {
        const cleanSlug = doc.slug?.current
          ? doc.slug
          : { _type: 'slug', current: makeSlug(doc.title) };

        if (doc._id.startsWith('drafts.')) {
          const pubId = doc._id.replace(/^drafts\./, '');
          const { _rev, _updatedAt, subcategory, ...rest } = doc;
          transaction.createOrReplace({
            ...rest,
            _id: pubId,
            slug: cleanSlug,
            category: { _type: 'reference', _ref: targetVenueId },
          });
          transaction.delete(doc._id);
        } else {
          transaction.patch(doc._id, (p) =>
            p
              .set({
                category: { _type: 'reference', _ref: targetVenueId },
                slug: cleanSlug,
              })
              .unset(['subcategory'])
          );
        }
      }

      await transaction.commit();
      setSelectedArtworks(new Set());
      await fetchData();
      window.alert(`Successfully moved ${moveCount} photo(s) to "${targetName}"!`);
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

  // --- 7. ONE-CLICK AUTO-OPTIMIZE PHOTO & SEO FROM FILENAME/TITLE ---
  const handleAutoOptimizeArtwork = () => {
    if (!editingArtwork) return;
    const raw = editingArtwork.title || '';
    const fileSource = `${editingArtwork.fileName || ''} ${raw} ${editingArtwork.slug?.current || ''}`;
    // Extract 2-digit year if filename contains pattern like "19-P4067975" or "25-PA182180"
    const yearMatch = fileSource.match(/\b(1[89]|2[0-9])-[A-Z0-9]{4,}/i);
    const extractedYear = yearMatch ? `20${yearMatch[1]}` : editingArtwork.year || '';

    // Extract 4-digit study/frame number for unique SEO differentiation across same-species photos
    const studyMatch = fileSource.match(/(?:[A-Za-z0-9_-]*?)(\d{4,})(?:\b|[-_.]|Edit)/i);
    const studyCode = studyMatch && studyMatch[1]
      ? studyMatch[1].slice(-4)
      : (editingArtwork._id || '').replace(/^drafts\./, '').slice(-4).toUpperCase() || '0001';

    // Strip camera codes like "19-P4067975-Edit-Edit-gigapixel..."
    const cleanedTitle = raw
      .replace(/\b(1[89]|2[0-9])-[A-Z0-9_-]+.*$/i, '')
      .replace(/[-_]+Edit.*$/i, '')
      .trim() || raw;

    const cleanSlug =
      editingArtwork.slug?.current ||
      `${cleanedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 72)}-${studyCode.toLowerCase()}`;

    const venueObj = categories.find((c) => c._id === editingArtwork.categoryId);
    const venueTitle = venueObj ? venueObj.title : 'Fine Art Nature';
    const yearLabel = extractedYear ? `${extractedYear} ` : '';
    const metaTitle = `${cleanedTitle} — ${venueTitle} (${yearLabel}Study #${studyCode}) | The Meadow Lens`;
    const metaDescription = `Collector fine art photograph "${cleanedTitle}" (${yearLabel}${venueTitle} Exhibition, Study #${studyCode}) captured in the New Jersey Meadowlands by David McClure.`.slice(0, 160);

    const autoKeywords = Array.from(
      new Set(
        [
          cleanedTitle,
          `${cleanedTitle} ${venueTitle}`,
          `${cleanedTitle} Study ${studyCode}`,
          editingArtwork.species && `${editingArtwork.species} Photography`,
          venueTitle,
          editingArtwork.location || 'NJ Meadowlands',
          extractedYear && `${extractedYear} Wildlife Photography`,
          'Atlantic Flyway',
          'David McClure',
          'The Meadow Lens',
        ].filter(Boolean)
      )
    );

    setEditingArtwork({
      ...editingArtwork,
      displayTitle: editingArtwork.displayTitle || cleanedTitle,
      slug: { _type: 'slug', current: cleanSlug },
      year: extractedYear,
      location: editingArtwork.location || 'The Meadowlands, New Jersey',
      size: editingArtwork.size || 'Standard 4:3',
      roomSetting: editingArtwork.roomSetting || 'living-room',
      status: editingArtwork.status || 'available',
      caption:
        editingArtwork.caption ||
        `${cleanedTitle}, captured in the New Jersey Meadowlands by David McClure.`,
      seo: {
        metaTitle,
        metaDescription,
        keywords: autoKeywords,
      },
    });
  };

  // --- 8. SAVE & PUBLISH INLINE PHOTO / PRODUCT / GUEST DETAILS ---
  const handleSaveArtworkDetails = async (e) => {
    e.preventDefault();
    if (!editingArtwork) return;

    setIsProcessing(true);
    try {
      const slugCurrent = editingArtwork.slug?.current
        ? editingArtwork.slug.current
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : makeSlug(editingArtwork.displayTitle || editingArtwork.title);

      const keywordsArray = Array.isArray(editingArtwork.seo?.keywords)
        ? editingArtwork.seo.keywords
        : typeof editingArtwork.seo?.keywords === 'string'
        ? editingArtwork.seo.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      const patchData = {
        title: editingArtwork.title || 'Untitled',
        displayTitle: typeof editingArtwork.displayTitle === 'string' ? editingArtwork.displayTitle : '',
        slug: { _type: 'slug', current: slugCurrent },
        species: editingArtwork.species || '',
        caption: editingArtwork.caption || '',
        location: editingArtwork.location || '',
        year: editingArtwork.year || '',
        size: editingArtwork.size || 'Standard 4:3',
        roomSetting: editingArtwork.roomSetting || 'living-room',
        status: editingArtwork.status || 'available',
        edition: editingArtwork.edition || '',
        guestPhotographer: editingArtwork.guestPhotographer || '',
        guestSocialUrl: editingArtwork.guestSocialUrl || '',
        guestNote: editingArtwork.guestNote || '',
        seo: {
          metaTitle: editingArtwork.seo?.metaTitle || '',
          metaDescription: editingArtwork.seo?.metaDescription || '',
          keywords: keywordsArray,
        },
        ...(editingArtwork.categoryId
          ? { category: { _type: 'reference', _ref: editingArtwork.categoryId } }
          : {}),
      };

      // If the document is currently a draft (drafts.*), publish it live if it has a category
      if (editingArtwork._id.startsWith('drafts.') && editingArtwork.categoryId) {
        const fullDoc = await client.fetch(`*[_id == $id][0]`, { id: editingArtwork._id });
        const pubId = editingArtwork._id.replace(/^drafts\./, '');
        const { _rev, _updatedAt, ...rest } = fullDoc || {};
        const tx = client.transaction();
        tx.createOrReplace({
          ...rest,
          _id: pubId,
          _type: 'artwork',
          ...patchData,
        });
        tx.delete(editingArtwork._id);
        await tx.commit();
      } else {
        await client.patch(editingArtwork._id).set(patchData).commit();
      }

      setEditingArtwork(null);
      await fetchData();
      window.alert('Saved & Published Live to Website!');
    } catch (error) {
      console.error('Error saving photo details:', error);
      window.alert('Error saving photo details: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 9. CREATE, RENAME, OR SAVE & PUBLISH VENUE / SUB-VENUE DETAILS ---
  const handleSaveVenueDetails = async (e) => {
    e.preventDefault();
    if (!editingVenue || !editingVenue.title?.trim()) return;

    setIsProcessing(true);
    try {
      const cleanTitle = editingVenue.title.trim();
      const finalSlug = makeCleanVenueSlug(editingVenue.slug || cleanTitle);
      const keywordsArray = Array.isArray(editingVenue.seo?.keywords)
        ? editingVenue.seo.keywords
        : typeof editingVenue.seo?.keywords === 'string'
        ? editingVenue.seo.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      const rawId =
        editingVenue._id ||
        (crypto.randomUUID
          ? `cat-${crypto.randomUUID()}`
          : `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);
      const cleanVenueId = rawId.replace(/^drafts\./, '');
      const existingDoc = await client.fetch(`*[_id == $id][0]`, { id: cleanVenueId });

      const docData = {
        title: cleanTitle,
        slug: { _type: 'slug', current: finalSlug },
        speciesDescription: editingVenue.speciesDescription || '',
        seo: {
          metaTitle: editingVenue.seo?.metaTitle || `${cleanTitle} | The Meadow Lens`,
          metaDescription:
            editingVenue.seo?.metaDescription ||
            (editingVenue.speciesDescription || '').slice(0, 158),
          keywords: keywordsArray,
        },
        ...(editingVenue.parentId
          ? { parentCategory: { _type: 'reference', _ref: editingVenue.parentId } }
          : {}),
      };

      const tx = client.transaction();
      if (!existingDoc || editingVenue.isNew) {
        tx.createOrReplace({
          ...(existingDoc || {}),
          _id: cleanVenueId,
          _type: 'category',
          ...docData,
        });
        tx.delete(`drafts.${cleanVenueId}`);
      } else {
        let patch = client.patch(cleanVenueId).set(docData);
        if (!editingVenue.parentId) {
          patch = patch.unset(['parentCategory']);
        }
        tx.patch(patch);
        tx.delete(`drafts.${cleanVenueId}`);
      }

      await tx.commit();
      setEditingVenue(null);
      setViewMode('venue');
      setActiveVenueId(cleanVenueId);
      await fetchData();
      window.alert(
        editingVenue.isNew
          ? `Created & Published New ${editingVenue.parentId ? 'Sub-Venue' : 'Root Venue'}: "${cleanTitle}"!`
          : `Saved & Published Venue "${cleanTitle}" Live!`
      );
    } catch (error) {
      console.error('Error saving venue details:', error);
      window.alert('Error saving venue details: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 10. DEDICATED INVITED GUEST PHOTO PUBLISHER ---
  const copyGuestFacebookMessage = (artTitle, guestName, slugStr) => {
    const productUrl = `https://themeadowlens-app-green.vercel.app/art/${slugStr}`;
    const showcaseUrl = `https://themeadowlens-app-green.vercel.app/category/guest-photos`;
    const msg = `Hi ${guestName || 'there'}! Your photograph "${artTitle}" is now officially live in our Invited Guest Photos Showcase on The Meadow Lens!\n\nView & share your dedicated fine art page here:\n${productUrl}\n\nExplore the full Invited Guest Showcase here:\n${showcaseUrl}`;
    navigator.clipboard?.writeText(msg);
    window.alert(
      `Copied ready-to-send Facebook message & live links to your clipboard:\n\n${msg}`
    );
  };

  const handleCreateGuestPhoto = async (e) => {
    e.preventDefault();
    if (!guestForm.file) {
      window.alert('Please select a photo file to upload.');
      return;
    }
    if (!guestForm.guestPhotographer.trim()) {
      window.alert('Please enter the Guest Photographer Name.');
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);
    try {
      const guestCategory =
        categories.find(
          (c) =>
            c._id === 'cat-guest-photos-7401' ||
            c._id === 'category-guest-photos' ||
            c.slug === 'guest-photos'
        ) || null;
      const targetCatId = guestCategory ? guestCategory._id : 'cat-guest-photos-7401';

      const rawFileTitle = guestForm.file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = (guestForm.displayTitle || rawFileTitle)
        .replace(/\s+\d{1,4}-[A-Za-z0-9_-]+(?:-Edit)?$/i, '')
        .replace(/\s+[A-Z]{1,4}\d{4,}(?:-\d+)?(?:-Edit)?$/i, '')
        .trim();

      const slugCurrent = makeSlug(`${cleanTitle}-${guestForm.guestPhotographer}`);

      const asset = await client.assets.upload('image', guestForm.file, {
        filename: guestForm.file.name,
      });

      const pubId = crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const metaTitle =
        `Featured Guest Artist: ${guestForm.guestPhotographer.trim()} — "${cleanTitle}" | The Meadow Lens`.slice(
          0,
          65
        );
      const metaDesc = (
        guestForm.guestNote ||
        `Featured Guest Photo "${cleanTitle}" by ${guestForm.guestPhotographer.trim()}, curated by invitation on The Meadow Lens.`
      ).slice(0, 158);

      await client.createOrReplace({
        _id: pubId,
        _type: 'artwork',
        title: rawFileTitle,
        displayTitle: cleanTitle,
        slug: { _type: 'slug', current: slugCurrent },
        image: { _type: 'image', asset: { _ref: asset._id } },
        category: { _type: 'reference', _ref: targetCatId },
        guestPhotographer: guestForm.guestPhotographer.trim(),
        guestSocialUrl: guestForm.guestSocialUrl.trim(),
        guestNote: guestForm.guestNote.trim(),
        species: guestForm.species.trim(),
        location: guestForm.location.trim(),
        year: guestForm.year.trim(),
        caption: guestForm.caption.trim(),
        size: 'Standard 4:3',
        roomSetting: 'living-room',
        status: 'available',
        seo: {
          metaTitle,
          metaDescription: metaDesc,
          keywords: [
            cleanTitle,
            guestForm.guestPhotographer.trim(),
            guestForm.species.trim(),
            guestForm.location.trim(),
            'Guest Photos',
            'Invited Nature Photographer',
            'The Meadow Lens',
          ].filter(Boolean),
        },
      });

      setShowAddGuestModal(false);
      setGuestForm({
        file: null,
        previewUrl: '',
        displayTitle: '',
        guestPhotographer: '',
        guestSocialUrl: '',
        guestNote:
          'Selected by invitation from the nature photography community for the Featured Guest Showcase on The Meadow Lens.',
        species: '',
        location: '',
        year: new Date().getFullYear().toString(),
        caption: '',
      });
      await fetchData();
      copyGuestFacebookMessage(cleanTitle, guestForm.guestPhotographer.trim(), slugCurrent);
    } catch (err) {
      console.error('Failed to publish guest photo:', err);
      window.alert('Error publishing guest photo: ' + err.message);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  // Compute live frontend URL for active venue
  const activeVenueLiveUrl = useMemo(() => {
    if (!activeVenueObj || !activeVenueObj.slug) return '';
    if (activeVenueObj.parentSlug) {
      return `https://themeadowlens-app-green.vercel.app/category/${activeVenueObj.parentSlug}/${activeVenueObj.slug}`;
    }
    return `https://themeadowlens-app-green.vercel.app/category/${activeVenueObj.slug}`;
  }, [activeVenueObj]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>
              {viewMode === 'warehouse' && 'The Warehouse: Unassigned Photos'}
              {viewMode === 'all' && 'The Warehouse: All Uploaded Photos (Grid View)'}
              {viewMode === 'venue' &&
                (activeVenueObj
                  ? `${activeVenueObj.parentTitle ? `${activeVenueObj.parentTitle} ▸ ` : ''}${activeVenueObj.title}`
                  : 'New Venue / Sub-Venue Setup')}
            </h1>

            {viewMode === 'venue' && !activeVenueObj && (
              <button
                type="button"
                onClick={() =>
                  setEditingVenue({
                    isNew: true,
                    _id: cleanDocId || '',
                    title: '',
                    slug: '',
                    parentId: '',
                    speciesDescription: '',
                    seo: {},
                  })
                }
                style={{
                  padding: '0.5rem 1rem',
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                ➕ Enter New Venue / Sub-Venue Details
              </button>
            )}

            {viewMode === 'venue' && activeVenueObj && (
              <>
                {activeVenueLiveUrl && (
                  <a
                    href={activeVenueLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.45rem 0.9rem',
                      background: '#059669',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View Live Venue Page ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setEditingVenue({
                      ...activeVenueObj,
                      isNew: false,
                    })
                  }
                  style={{
                    padding: '0.45rem 0.9rem',
                    background: '#1d4ed8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  ✏️ Rename / Edit Venue & SEO
                </button>

                {!activeVenueObj.parentId && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingVenue({
                        isNew: true,
                        _id: '',
                        title: '',
                        slug: '',
                        parentId: activeVenueObj._id,
                        parentTitle: activeVenueObj.title,
                        speciesDescription: '',
                        seo: {},
                      })
                    }
                    style={{
                      padding: '0.45rem 0.9rem',
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    ➕ Add Sub-Venue to &ldquo;{activeVenueObj.title}&rdquo;
                  </button>
                )}

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
              </>
            )}
          </div>

          <p style={{ color: '#475569', margin: '0.4rem 0 0 0', fontSize: '0.95rem' }}>
            {viewMode === 'warehouse' &&
              'Photos waiting to be assigned to a Root Venue or Sub-Venue. Check photos below to Publish/Move or Delete.'}
            {viewMode === 'all' &&
              'Large visual identification grid of every uploaded photo across your entire collection.'}
            {viewMode === 'venue' &&
              (activeVenueId === 'cat-guest-photos-7401' || activeVenueId === 'category-guest-photos' || activeVenueObj?.slug === 'guest-photos'
                ? 'Curated By Invitation Only: Upload & publish photos from invited Facebook / nature photographers with full attribution, social link, and 1-click Facebook share note.'
                : 'Check any photos in this venue to Move-To, Copy-To, Decategorize (send back to Warehouse), or Delete.')}
          </p>

          {viewMode === 'venue' &&
            activeVenueObj &&
            !activeVenueObj.parentId &&
            categories.some((c) => c.parentId === activeVenueObj._id) && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.45rem',
                  }}
                >
                  📂 Sub-Venues of {activeVenueObj.title} (Photos live inside these Sub-Venues so the Root Venue page is never duplicated):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {categories
                    .filter((c) => c.parentId === activeVenueObj._id)
                    .map((sub) => (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => {
                          setViewMode('venue');
                          setActiveVenueId(sub._id);
                          setSelectedArtworks(new Set());
                        }}
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {sub.title} ({sub.photoCount || 0})
                      </button>
                    ))}
                </div>
              </div>
            )}
        </div>

        {/* UPLOAD & VENUE DELETION TOGGLE */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() =>
              setEditingVenue({
                isNew: true,
                _id: '',
                title: '',
                slug: '',
                parentId: viewMode === 'venue' && activeVenueObj && !activeVenueObj.parentId ? activeVenueObj._id : '',
                speciesDescription: '',
                seo: {},
              })
            }
            style={{
              padding: '0.7rem 1.1rem',
              background: '#7c3aed',
              color: '#ffffff',
              border: '1px solid #6d28d9',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            ➕ Add Venue / Sub-Venue
          </button>

          <button
            type="button"
            onClick={() => setShowAddGuestModal(true)}
            style={{
              padding: '0.7rem 1.15rem',
              background: '#059669',
              color: '#ffffff',
              border: '2px solid #10b981',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
            }}
          >
            ★ + Add Invited Guest Photo
          </button>

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
            {showVenueDeletionPanel ? 'Close Venue Manager' : 'Manage / Rename / Delete Venues'}
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

      {/* COLLAPSIBLE ROOT VENUE & SUB-VENUE MANAGEMENT PANEL */}
      {showVenueDeletionPanel && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>
                Root Venue & Sub-Venue Manager (Add, Rename, or Delete)
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Click any Root Venue or Sub-Venue below to view its photos, click <strong>✏️ Rename</strong> to rename/edit it, or click <strong>Delete</strong> to remove it.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingVenue({
                  isNew: true,
                  _id: '',
                  title: '',
                  slug: '',
                  parentId: '',
                  speciesDescription: '',
                  seo: {},
                })
              }
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ➕ Add New Root Venue or Sub-Venue
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.6rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
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
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  gap: '0.4rem',
                }}
              >
                <div
                  onClick={() => {
                    setViewMode('venue');
                    setActiveVenueId(cat._id);
                  }}
                  style={{ cursor: 'pointer', flex: 1, paddingRight: '0.35rem' }}
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
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setEditingVenue({ ...cat, isNew: false })}
                    disabled={isProcessing}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.35rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Rename
                  </button>
                  <button
                    onClick={() => handleDeleteVenue(cat._id)}
                    disabled={isProcessing}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.35rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
            Switch View To:
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
              width: '280px',
            }}
          >
            <option value="">-- Inspect a Venue / Sub-Venue --</option>
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
            minWidth: '200px',
            flex: 1,
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
            minWidth: '100px',
          }}
        >
          {selectedArtworks.size} Checked
        </span>

        <div style={{ width: '1px', height: '28px', background: '#cbd5e1' }} />

        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
          Destination Venue:
        </span>

        {/* TARGET VENUE SELECTOR FOR MOVE-TO & COPY-TO */}
        <select
          value={targetVenueId}
          onChange={(e) => setTargetVenueId(e.target.value)}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            border: '2px solid #2563eb',
            minWidth: '250px',
            background: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <option value="">-- Select Target Venue for Checked Photo(s) --</option>
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
          title="Move ONLY the checked photo(s) into the selected destination venue"
        >
          Move Checked ({selectedArtworks.size})
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
          Copy Checked ({selectedArtworks.size})
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
          To Warehouse ({selectedArtworks.size})
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

      {/* PHOTO COUNT STATUS & COLOR LEGEND */}
      <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
        <span>
          Showing <strong>{filteredArtworks.length}</strong> photo(s)
          {viewMode === 'venue' && activeVenueObj ? ` in "${activeVenueObj.title}"` : ''}
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d97706', display: 'inline-block' }} />
            Amber = In Warehouse
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1d4ed8', display: 'inline-block' }} />
            Blue = Root Venue
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#047857', display: 'inline-block' }} />
            Green = Sub-Venue
          </span>
          {isProcessing && <span style={{ color: '#2563eb', fontWeight: 700 }}>Syncing with Sanity Cloud...</span>}
        </div>
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
          const isSubVenue = Boolean(art.subcategoryTitle || art.categoryParentTitle);
          const badgeColor = !art.categoryTitle
            ? 'rgba(217, 119, 6, 0.92)' // Amber: In Warehouse
            : isSubVenue
            ? 'rgba(4, 120, 87, 0.92)' // Green: Sub-Venue
            : 'rgba(29, 78, 216, 0.92)'; // Blue: Root Venue
          const badgeText = !art.categoryTitle
            ? 'In Warehouse'
            : art.subcategoryTitle
            ? `${art.categoryTitle} ▸ ${art.subcategoryTitle}`
            : art.categoryParentTitle
            ? `${art.categoryParentTitle} ▸ ${art.categoryTitle}`
            : art.categoryTitle;

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

              {/* COLOR-CODED VENUE BADGE OVERLAY */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: badgeColor,
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  zIndex: 10,
                  maxWidth: '72%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                }}
                title={badgeText}
              >
                {badgeText}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: !art._id.startsWith('drafts.') && art.categoryTitle ? '#dcfce7' : '#fef3c7',
                      color: !art._id.startsWith('drafts.') && art.categoryTitle ? '#166534' : '#92400e',
                    }}
                  >
                    {!art._id.startsWith('drafts.') && art.categoryTitle ? '● LIVE ON SITE' : '● UNPUBLISHED DRAFT'}
                  </span>
                  {art.seo?.metaTitle && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2563eb' }}>
                      ✓ SEO Ready
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={art.displayTitle || art.title}
                >
                  {art.displayTitle || art.title || 'Untitled'}
                </div>
                {art.displayTitle && art.displayTitle !== art.title && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={art.title}
                  >
                    File: {art.title}
                  </div>
                )}
                {art.guestPhotographer && (
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, marginTop: '3px' }}>
                    Guest: {art.guestPhotographer}
                  </div>
                )}
                {art.species && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    Species: {art.species}
                  </div>
                )}

                <div
                  style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setEditingArtwork({ ...art })}
                    style={{
                      flex: 1,
                      padding: '0.38rem 0.5rem',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      background: '#1e293b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ Optimize / Edit
                  </button>
                  {art.slug?.current && !art._id.startsWith('drafts.') && (
                    <a
                      href={`https://themeadowlens-app-green.vercel.app/art/${art.slug.current}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.38rem 0.5rem',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        borderRadius: '5px',
                        textDecoration: 'none',
                      }}
                      title="Open the live Photo / Product Page on the website"
                    >
                      View Live ↗
                    </a>
                  )}
                  {art.slug?.current && art.guestPhotographer && (
                    <button
                      type="button"
                      onClick={() =>
                        copyGuestFacebookMessage(
                          art.displayTitle || art.title,
                          art.guestPhotographer,
                          art.slug.current
                        )
                      }
                      style={{
                        padding: '0.38rem 0.5rem',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #6ee7b7',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                      title="Copy personalized Facebook Messenger note + live link for this Guest Photographer"
                    >
                      📋 Copy FB Note
                    </button>
                  )}
                  {art.slug?.current && !art.guestPhotographer && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://themeadowlens-app-green.vercel.app/art/${art.slug.current}`;
                        navigator.clipboard?.writeText(url);
                        window.alert(`Copied share link to clipboard:\n${url}`);
                      }}
                      style={{
                        padding: '0.38rem 0.45rem',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                      title="Copy direct website link to share on Facebook"
                    >
                      Copy Link
                    </button>
                  )}
                </div>
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
            <p style={{ margin: '0 0 1.25rem 0' }}>
              {viewMode === 'venue' &&
              (activeVenueId === 'cat-guest-photos-7401' || activeVenueId === 'category-guest-photos' || activeVenueObj?.slug === 'guest-photos')
                ? 'Your Invited Guest Photos showcase is ready! Click below to upload a guest photographer’s photo, add their name & Facebook link, and publish it live.'
                : viewMode === 'venue'
                ? 'This venue currently has 0 photos. You can upload photos directly or delete this venue using the red button above.'
                : 'Try switching views or uploading new photos.'}
            </p>
            {viewMode === 'venue' &&
              (activeVenueId === 'cat-guest-photos-7401' || activeVenueId === 'category-guest-photos' || activeVenueObj?.slug === 'guest-photos') && (
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  ★ + Add & Publish First Invited Guest Photo
                </button>
              )}
          </div>
        )}
      </div>

      {/* FULLSTACK PHOTO, PRODUCT PAGE & SEO OPTIMIZER MODAL */}
      {editingArtwork && (
        <div
          onClick={() => setEditingArtwork(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                  Optimize Photo, Product Page & Guest Info
                </h2>
                {editingArtwork.slug?.current && (
                  <a
                    href={`https://themeadowlens-app-green.vercel.app/art/${editingArtwork.slug.current}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Live Product Page: /art/{editingArtwork.slug.current} ↗
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleAutoOptimizeArtwork}
                  style={{
                    padding: '0.5rem 0.9rem',
                    background: 'linear-gradient(135deg, #2563eb, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                  title="Automatically clean camera filename codes, fill Display Title, Year, Location, and Google SEO tags"
                >
                  ✨ 1-Click Auto-Optimize Photo & SEO
                </button>
                <button
                  type="button"
                  onClick={() => setEditingArtwork(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {editingArtwork.imageUrl && (
              <div
                style={{
                  width: '100%',
                  height: '190px',
                  background: '#0f172a',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={`${editingArtwork.imageUrl}?w=800&fit=max`}
                  alt={editingArtwork.title}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            <form onSubmit={handleSaveArtworkDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 1. TITLES, SLUG & VENUE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Artistic Display Title (Shown on Website)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Laurel Hill Park & Hackensack River Vista"
                    value={typeof editingArtwork.displayTitle === 'string' ? editingArtwork.displayTitle : ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, displayTitle: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Catalog / Original Title *
                  </label>
                  <input
                    type="text"
                    value={editingArtwork.title || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, title: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Assigned Venue / Sub-Venue
                  </label>
                  <select
                    value={editingArtwork.categoryId || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="">-- In Warehouse (Unassigned) --</option>
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Product Page URL Slug (/art/...)
                  </label>
                  <input
                    type="text"
                    value={editingArtwork.slug?.current || ''}
                    onChange={(e) =>
                      setEditingArtwork({
                        ...editingArtwork,
                        slug: { _type: 'slug', current: e.target.value },
                      })
                    }
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* 2. PRODUCT PAGE DETAILS & ROOM VISUALIZER */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Species (For A–Z Index)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Great Blue Heron"
                    value={editingArtwork.species || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, species: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Location / Setting
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Laurel Hill Park, NJ"
                    value={editingArtwork.location || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, location: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Year Captured
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2024"
                    value={editingArtwork.year || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, year: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Room Preview Setting
                  </label>
                  <select
                    value={editingArtwork.roomSetting || 'living-room'}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, roomSetting: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="living-room">Modern Living Room</option>
                    <option value="dark-gallery">Dark Gallery Wall</option>
                    <option value="office">Minimalist Office</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Format / Aspect Ratio
                  </label>
                  <input
                    type="text"
                    placeholder="Standard 4:3, Panorama..."
                    value={editingArtwork.size || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, size: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Availability Status
                  </label>
                  <select
                    value={editingArtwork.status || 'available'}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="acquired">Acquired (Sold)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Caption / Narrative Description (Shown on Gallery & Product Page)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the scene, lighting, or story behind this photograph..."
                  value={editingArtwork.caption || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, caption: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              {/* 3. GOOGLE SEO METADATA SECTION */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '0.9rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.6rem' }}>
                  Google Search & OpenGraph SEO Optimization
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                      SEO Meta Title (Under 60 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if left blank..."
                      value={editingArtwork.seo?.metaTitle || ''}
                      onChange={(e) =>
                        setEditingArtwork({
                          ...editingArtwork,
                          seo: { ...(editingArtwork.seo || {}), metaTitle: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                      SEO Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Laurel Hill Park, Hackensack River, NJ Meadowlands"
                      value={
                        Array.isArray(editingArtwork.seo?.keywords)
                          ? editingArtwork.seo.keywords.join(', ')
                          : editingArtwork.seo?.keywords || ''
                      }
                      onChange={(e) =>
                        setEditingArtwork({
                          ...editingArtwork,
                          seo: { ...(editingArtwork.seo || {}), keywords: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                    SEO Meta Description (Under 160 chars)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Search engine summary for Google and social media shares..."
                    value={editingArtwork.seo?.metaDescription || ''}
                    onChange={(e) =>
                      setEditingArtwork({
                        ...editingArtwork,
                        seo: { ...(editingArtwork.seo || {}), metaDescription: e.target.value },
                      })
                    }
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* 4. GUEST ARTIST INVITATION SECTION */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.9rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '0.6rem' }}>
                  Guest Photographer Details (For Invited Guest Photos Only)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '0.2rem' }}>
                      Guest Photographer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Sarah Jenkins"
                      value={editingArtwork.guestPhotographer || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, guestPhotographer: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #86efac', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '0.2rem' }}>
                      Guest Facebook / Instagram / Website Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.facebook.com/..."
                      value={editingArtwork.guestSocialUrl || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, guestSocialUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #86efac', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginBottom: '0.2rem' }}>
                    Guest Artist Note / Where Captured / Story
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add the story behind the photo, where it was taken, or why you invited this photographer..."
                    value={editingArtwork.guestNote || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, guestNote: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #86efac', fontSize: '0.82rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingArtwork(null)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isProcessing ? 'Saving & Publishing...' : 'Save & Publish Live Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INLINE ADD / RENAME / EDIT VENUE & SEO MODAL */}
      {editingVenue && (
        <div
          onClick={() => setEditingVenue(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '660px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                {editingVenue.isNew
                  ? '➕ Add New Root Venue or Sub-Venue'
                  : `✏️ Rename / Edit Venue & SEO: ${editingVenue.title}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingVenue(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVenueDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Venue / Sub-Venue Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Shorebirds or Flora"
                    value={editingVenue.title || ''}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setEditingVenue((prev) => ({
                        ...prev,
                        title: nextTitle,
                        slug: prev.isNew ? toSlug(nextTitle) : prev.slug,
                      }));
                    }}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Venue Hierarchy (Root vs Sub-Venue)
                  </label>
                  <select
                    value={editingVenue.parentId || ''}
                    onChange={(e) => {
                      const nextParentId = e.target.value;
                      const parentObj = categories.find((c) => c._id === nextParentId);
                      setEditingVenue({
                        ...editingVenue,
                        parentId: nextParentId || null,
                        parentTitle: parentObj ? parentObj.title : null,
                      });
                    }}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="">★ Root Venue (Top-Level Gallery)</option>
                    {categories
                      .filter((c) => !c.parentId && c._id !== editingVenue._id)
                      .map((rootCat) => (
                        <option key={rootCat._id} value={rootCat._id}>
                          ↳ Sub-Venue of: {rootCat.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    URL Slug (Used in `/category/...`)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingVenue({
                        ...editingVenue,
                        slug: toSlug(editingVenue.title || ''),
                      })
                    }
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    ↻ Match New Title
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  value={editingVenue.slug || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, slug: toSlug(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Venue Page Header Description (Also used as Default Photo Caption)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what visitors will experience in this venue..."
                  value={editingVenue.speciesDescription || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, speciesDescription: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>
                    Google Search SEO Metadata
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const desc =
                        editingVenue.speciesDescription ||
                        `Explore the ${editingVenue.title} fine art photography collection captured in the New Jersey Meadowlands by David McClure.`;
                      setEditingVenue({
                        ...editingVenue,
                        speciesDescription: desc,
                        seo: {
                          metaTitle: `${editingVenue.title} | The Meadow Lens`,
                          metaDescription: desc.slice(0, 158),
                          keywords: [
                            editingVenue.title,
                            'NJ Meadowlands',
                            'Fine Art Nature Photography',
                            'David McClure',
                            'The Meadow Lens',
                          ],
                        },
                      });
                    }}
                    style={{
                      padding: '0.35rem 0.7rem',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✨ Auto-Fill Venue SEO
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                      Meta Title (Under 60 chars)
                    </label>
                    <input
                      type="text"
                      value={editingVenue.seo?.metaTitle || ''}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          seo: { ...(editingVenue.seo || {}), metaTitle: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                      Meta Description (Under 160 chars)
                    </label>
                    <textarea
                      rows={2}
                      value={editingVenue.seo?.metaDescription || ''}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          seo: { ...(editingVenue.seo || {}), metaDescription: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.2rem' }}>
                      Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(editingVenue.seo?.keywords)
                          ? editingVenue.seo.keywords.join(', ')
                          : editingVenue.seo?.keywords || ''
                      }
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          seo: { ...(editingVenue.seo || {}), keywords: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingVenue(null)}
                  style={{ padding: '0.6rem 1.1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{ padding: '0.65rem 1.35rem', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isProcessing
                    ? 'Saving...'
                    : editingVenue.isNew
                    ? 'Create & Publish Venue'
                    : 'Save Venue Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED INVITED GUEST PHOTO PUBLISHER MODAL */}
      {showAddGuestModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => !isUploading && setShowAddGuestModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.6rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              color: '#0f172a',
              border: '2px solid #10b981',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#d1fae5',
                    color: '#065f46',
                    marginBottom: '4px',
                  }}
                >
                  ★ Curated By Invitation Only • Facebook &amp; Community Showcase
                </span>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
                  Add &amp; Publish Invited Guest Photo
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !isUploading && setShowAddGuestModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: '0 0 1.15rem 0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
              When a photographer on Facebook agrees to your invitation, upload their photograph below with their name and social link. Clicking <strong>Publish Guest Photo Live</strong> automatically publishes it to <code>/category/guest-photos</code> and <code>/art/[slug]</code>, and copies a ready-to-paste Facebook message with their live link!
            </p>

            <form onSubmit={handleCreateGuestPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 1. FILE SELECTOR + PREVIEW */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '2px dashed #34d399',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {guestForm.previewUrl ? (
                  <img
                    src={guestForm.previewUrl}
                    alt="Guest Preview"
                    style={{
                      width: '120px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #10b981',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '90px',
                      borderRadius: '8px',
                      background: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#047857',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '0.5rem',
                    }}
                  >
                    Select Guest Photo
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#065f46', marginBottom: '0.35rem' }}>
                    1. Choose Photograph File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const rawTitle = file.name.replace(/\.[^/.]+$/, '');
                      const cleaned = rawTitle
                        .replace(/\s+\d{1,4}-[A-Za-z0-9_-]+(?:-Edit)?$/i, '')
                        .replace(/\s+[A-Z]{1,4}\d{4,}(?:-\d+)?(?:-Edit)?$/i, '')
                        .trim();
                      setGuestForm((prev) => ({
                        ...prev,
                        file,
                        previewUrl: URL.createObjectURL(file),
                        displayTitle: prev.displayTitle || cleaned,
                      }));
                    }}
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* 2. GUEST PHOTOGRAPHER ATTRIBUTION */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem' }}>
                  2. Invited Photographer Credit &amp; Social Link
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                      Guest Photographer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sarah Jenkins"
                      value={guestForm.guestPhotographer}
                      onChange={(e) => setGuestForm({ ...guestForm, guestPhotographer: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                      Facebook / Instagram / Website Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.facebook.com/..."
                      value={guestForm.guestSocialUrl}
                      onChange={(e) => setGuestForm({ ...guestForm, guestSocialUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                    Curator&apos;s Note / Why You Selected This Photo
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Spotted on the NJ Birding Facebook group — an extraordinary capture of morning light over the marsh."
                    value={guestForm.guestNote}
                    onChange={(e) => setGuestForm({ ...guestForm, guestNote: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* 3. PHOTOGRAPH TITLE, SPECIES & LOCATION */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
                  3. Artwork Title, Species &amp; Location
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Public Display Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Osprey Returning to Nest at Dawn"
                      value={guestForm.displayTitle}
                      onChange={(e) => setGuestForm({ ...guestForm, displayTitle: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Bird Species (Optional — Links to Species Index)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Osprey"
                      value={guestForm.species}
                      onChange={(e) => setGuestForm({ ...guestForm, species: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Location Captured
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., DeKorte Park, Lyndhurst, NJ"
                      value={guestForm.location}
                      onChange={(e) => setGuestForm({ ...guestForm, location: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Year
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      value={guestForm.year}
                      onChange={(e) => setGuestForm({ ...guestForm, year: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Additional Story / Caption (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional story or camera details shared by the guest photographer..."
                    value={guestForm.caption}
                    onChange={(e) => setGuestForm({ ...guestForm, caption: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowAddGuestModal(false)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || isProcessing}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isUploading ? 'Uploading & Publishing Live...' : '★ Publish Guest Photo Live & Copy FB Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
