import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useClient } from 'sanity';

const NON_BIO_VENUES_SET = new Set([
  'Wings of Man',
  'Vistas and Scenery',
  'Sky & Heavens',
  'Parks, Trails, Marshes and Pools',
  'City Skylines',
  'Moon, Sun, Stars',
  'Clouds and Rainbows',
  'Sun, Sunrises and Sunsets',
  'Video',
]);

function toTitleCaseSpecies(str) {
  if (!str) return '';
  const minor = new Set(['and', 'or', 'of', 'in', 'on', 'at', 'to', 'the', 'a', 'an']);
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minor.has(lower)) return lower;
      return word
        .split('-')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
        .join('-');
    })
    .join(' ');
}

function makeTickerArtworkSlug(str) {
  return (
    (str || 'artwork')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6)
  );
}

function deriveMetadataForTickerUpload(rawFilename, venueTitle = '', parentVenueTitle = '') {
  const rawBaseName = (rawFilename || '').replace(/\.[^/.]+$/, '').trim();
  let cleanCaption = rawBaseName;
  let fullYear = '';

  const yearPrefixMatch = rawBaseName.match(/^(.+?)\s+(1[89]|2[0-9])-[A-Za-z0-9]/);
  if (yearPrefixMatch && yearPrefixMatch[1].trim().length > 0) {
    cleanCaption = yearPrefixMatch[1].replace(/\s+/g, ' ').trim();
    const yy = parseInt(yearPrefixMatch[2], 10);
    fullYear = yy >= 70 ? `19${yearPrefixMatch[2]}` : `20${yearPrefixMatch[2]}`;
  } else {
    const studyMatch = rawBaseName.match(/^(.+?)\s+-\s+Study/i);
    if (studyMatch && studyMatch[1].trim().length > 0) {
      cleanCaption = studyMatch[1].replace(/\s+/g, ' ').trim();
    } else {
      cleanCaption =
        rawBaseName
          .replace(/\b(?:P|PA|PB|PC|DSC_|IMG_|DMC)\d{4,}.*$/i, '')
          .replace(/[-_\s]+Edit.*$/i, '')
          .replace(/[-_\s]+Copy.*$/i, '')
          .replace(/\s+/g, ' ')
          .trim() || rawBaseName;
    }
  }

  let canonicalSpecies = '';
  if (!NON_BIO_VENUES_SET.has(venueTitle) && !NON_BIO_VENUES_SET.has(parentVenueTitle)) {
    let base = cleanCaption
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    base = base
      .replace(/\bFinches$/i, 'Finch')
      .replace(/\bSwallows$/i, 'Swallow')
      .replace(/\bSandpipers$/i, 'Sandpiper')
      .replace(/\bGulls$/i, 'Gull')
      .replace(/\bWarblers$/i, 'Warbler')
      .replace(/\bSparrows$/i, 'Sparrow')
      .replace(/\bStarlings$/i, 'Starling')
      .replace(/\bBlackbirds$/i, 'Blackbird')
      .replace(/\bHerons$/i, 'Heron')
      .replace(/\bEgrets$/i, 'Egret')
      .replace(/\bMergansers$/i, 'Merganser')
      .replace(/\bGeese$/i, 'Goose')
      .replace(/\bSwans$/i, 'Swan')
      .replace(/\bDragonflies$/i, 'Dragonfly')
      .replace(/\bButterflies$/i, 'Butterfly');
    canonicalSpecies = toTitleCaseSpecies(base);
  }

  return { cleanCaption, canonicalSpecies, year: fullYear };
}

export function HomepageWelcomeDesigner({ onClose = null, isModal = false, onSaved = null }) {
  const client = useClient({ apiVersion: '2024-01-01' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTicker, setIsUploadingTicker] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [galleryOptions, setGalleryOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [tickerSearch, setTickerSearch] = useState('');
  const [tickerVenueFilter, setTickerVenueFilter] = useState('');
  const [tickerUploadVenueId, setTickerUploadVenueId] = useState('');

  const [form, setForm] = useState({
    _id: 'homepage',
    heroImageAssetId: 'image-eeb19431e524e43391ed803793c9a8f076b20756-1376x768-jpg',
    heroImageUrl:
      'https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg',
    rightPanelImageAssetId: 'image-5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567-jpg',
    rightPanelImageUrl:
      'https://cdn.sanity.io/images/h7ncr8cq/production/5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567.jpg',
    rightPanelFit: 'cover',
    showWelcomeOverlay: true,
    welcomeHeadline: 'Welcome to The Meadow Lens',
    welcomeBodyText:
      "I am David McClure, a fine art photographer with a lifelong passion for capturing the raw, uninterrupted beauty of nature. For years, I have explored the hidden depths of the New Jersey Meadowlands and beyond, waiting for those fleeting moments of perfection.\n\nThis gallery is a curated exhibition of my life's work — from the aggressive grace of birds of prey to the tranquil stillness of untouched vistas. I invite you to step into these digital halls and explore the world through my lens.",
    welcomeBgColor: '#0B1528',
    welcomeBgOpacity: 75,
    welcomeTextColor: '#F8FAFC',
    welcomeBackdropBlur: true,
    featuredTickerSpeed: 60,
    featuredArtworksList: [],
  });

  const convertHexToRgba = (hex, opacityPercent = 75) => {
    const cleanHex = String(hex || '#0B1528').replace('#', '').trim();
    let r = 11,
      g = 21,
      b = 40;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.slice(0, 2), 16);
      g = parseInt(cleanHex.slice(2, 4), 16);
      b = parseInt(cleanHex.slice(4, 6), 16);
    }
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      r = 11;
      g = 21;
      b = 40;
    }
    const clamped = Math.max(0, Math.min(100, Number(opacityPercent ?? 75)));
    return `rgba(${r}, ${g}, ${b}, ${Number((clamped / 100).toFixed(3))})`;
  };

  const loadHomepageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const hpDocs = await client.fetch(`*[_id in ["drafts.homepage", "homepage"]] | order(_updatedAt desc){
        _id,
        welcomeHeadline,
        welcomeText,
        showWelcomeOverlay,
        rightPanelFit,
        welcomeBgColor,
        welcomeBgOpacity,
        welcomeTextColor,
        welcomeBackdropBlur,
        featuredTickerSpeed,
        "heroImageAssetId": heroImage.asset._ref,
        "heroImageUrl": heroImage.asset->url,
        "rightPanelImageAssetId": coalesce(rightPanelImage.asset._ref, featuredArtworks[0]->image.asset._ref),
        "rightPanelImageUrl": coalesce(rightPanelImage.asset->url, featuredArtworks[0]->image.asset->url),
        "featuredItems": featuredArtworks[]{
          _key,
          "_id": _ref,
          "doc": @->{
            _id,
            title,
            displayTitle,
            species,
            "slug": slug.current,
            "fileName": coalesce(fileName, image.asset->originalFilename, title),
            "imageUrl": image.asset->url,
            "venueTitle": category->title,
            "parentVenueTitle": category->parentCategory->title
          }
        }
      }`);

      const draftDoc = hpDocs?.find((d) => d._id === 'drafts.homepage');
      const pubDoc = hpDocs?.find((d) => d._id === 'homepage');
      const hpDoc = draftDoc || pubDoc;

      if (hpDoc) {
        const extractedText = Array.isArray(hpDoc.welcomeText)
          ? hpDoc.welcomeText
              .map((block) =>
                Array.isArray(block?.children)
                  ? block.children.map((ch) => ch?.text || '').join('')
                  : ''
              )
              .filter(Boolean)
              .join('\n\n')
          : '';

        const rawFeatured =
          Array.isArray(hpDoc.featuredItems) && hpDoc.featuredItems.length > 0
            ? hpDoc.featuredItems
            : Array.isArray(pubDoc?.featuredItems)
            ? pubDoc.featuredItems
            : [];

        const seenIds = new Set();
        const resolvedTickerList = [];
        for (const item of rawFeatured) {
          const cleanId = (item?.doc?._id || item?._id || '').replace(/^drafts\./, '');
          if (!cleanId || seenIds.has(cleanId)) continue;
          seenIds.add(cleanId);
          resolvedTickerList.push({
            _id: cleanId,
            _key: item?._key || cleanId,
            title: item?.doc?.displayTitle || item?.doc?.title || 'Photograph',
            species: item?.doc?.species || '',
            fileName: item?.doc?.fileName || '',
            imageUrl: item?.doc?.imageUrl || '',
            venueTitle: item?.doc?.venueTitle || '',
            parentVenueTitle: item?.doc?.parentVenueTitle || '',
            slug: item?.doc?.slug || '',
          });
        }

        setForm({
          _id: 'homepage',
          heroImageAssetId:
            hpDoc.heroImageAssetId ||
            pubDoc?.heroImageAssetId ||
            'image-eeb19431e524e43391ed803793c9a8f076b20756-1376x768-jpg',
          heroImageUrl:
            hpDoc.heroImageUrl ||
            pubDoc?.heroImageUrl ||
            'https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg',
          rightPanelImageAssetId:
            hpDoc.rightPanelImageAssetId ||
            pubDoc?.rightPanelImageAssetId ||
            'image-5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567-jpg',
          rightPanelImageUrl:
            hpDoc.rightPanelImageUrl ||
            pubDoc?.rightPanelImageUrl ||
            'https://cdn.sanity.io/images/h7ncr8cq/production/5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567.jpg',
          rightPanelFit: hpDoc.rightPanelFit || pubDoc?.rightPanelFit || 'cover',
          showWelcomeOverlay: hpDoc.showWelcomeOverlay !== false,
          welcomeHeadline:
            hpDoc.welcomeHeadline || pubDoc?.welcomeHeadline || 'Welcome to The Meadow Lens',
          welcomeBodyText:
            extractedText ||
            "I am David McClure, a fine art photographer with a lifelong passion for capturing the raw, uninterrupted beauty of nature. For years, I have explored the hidden depths of the New Jersey Meadowlands and beyond, waiting for those fleeting moments of perfection.\n\nThis gallery is a curated exhibition of my life's work — from the aggressive grace of birds of prey to the tranquil stillness of untouched vistas. I invite you to step into these digital halls and explore the world through my lens.",
          welcomeBgColor: hpDoc.welcomeBgColor || pubDoc?.welcomeBgColor || '#0B1528',
          welcomeBgOpacity:
            typeof hpDoc.welcomeBgOpacity === 'number' && !Number.isNaN(hpDoc.welcomeBgOpacity)
              ? Math.max(0, Math.min(100, hpDoc.welcomeBgOpacity))
              : 75,
          welcomeTextColor: hpDoc.welcomeTextColor || pubDoc?.welcomeTextColor || '#F8FAFC',
          welcomeBackdropBlur: hpDoc.welcomeBackdropBlur !== false,
          featuredTickerSpeed:
            typeof hpDoc.featuredTickerSpeed === 'number' && !Number.isNaN(hpDoc.featuredTickerSpeed)
              ? Math.max(10, Math.min(300, hpDoc.featuredTickerSpeed))
              : 60,
          featuredArtworksList: resolvedTickerList,
        });
      }

      const [list, rawCats] = await Promise.all([
        client.fetch(
          `*[_type == "artwork" && !(_id in path("drafts.**")) && defined(image.asset)] | order(_createdAt desc)[0...2500] {
            _id,
            title,
            displayTitle,
            species,
            "slug": slug.current,
            "fileName": coalesce(fileName, image.asset->originalFilename, title),
            "assetId": image.asset._ref,
            "imageUrl": image.asset->url,
            "categoryId": category._ref,
            "venueTitle": category->title,
            "parentVenueTitle": category->parentCategory->title
          }`
        ),
        client.fetch(
          `*[_type == "category" && !(_id in path("drafts.**")) && !(title in ["Everything"])] | order(title asc) {
            _id,
            title,
            "parentId": parentCategory._ref,
            "parentTitle": parentCategory->title
          }`
        ),
      ]);

      setGalleryOptions(list || []);
      setCategories(rawCats || []);
      if (rawCats && rawCats.length > 0) {
        setTickerUploadVenueId((prev) => prev || rawCats[0]._id);
      }
    } catch (err) {
      console.error('Error loading HomepageWelcomeDesigner data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadHomepageData();
  }, [loadHomepageData]);

  const handleUploadLeftImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const asset = await client.assets.upload('image', file, { filename: file.name });
      setForm((prev) => ({
        ...prev,
        heroImageAssetId: asset._id,
        heroImageUrl: asset.url,
      }));
    } catch (err) {
      console.error('Error uploading left panel image:', err);
      window.alert('Failed to upload left panel image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadRightImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const asset = await client.assets.upload('image', file, { filename: file.name });
      setForm((prev) => ({
        ...prev,
        rightPanelImageAssetId: asset._id,
        rightPanelImageUrl: asset.url,
      }));
    } catch (err) {
      console.error('Error uploading right panel image:', err);
      window.alert('Failed to upload right panel image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- TICKER ACTIONS: ADD FROM GALLERY, REMOVE, REORDER & UPLOAD NEW PHOTOS DIRECTLY TO TICKER ---
  const tickerIdSet = useMemo(
    () => new Set((form.featuredArtworksList || []).map((item) => item._id)),
    [form.featuredArtworksList]
  );

  const handleAddGalleryArtworkToTicker = (art) => {
    if (!art || !art._id) return;
    const cleanId = art._id.replace(/^drafts\./, '');
    setForm((prev) => {
      if ((prev.featuredArtworksList || []).some((x) => x._id === cleanId)) {
        return prev;
      }
      return {
        ...prev,
        featuredArtworksList: [
          ...(prev.featuredArtworksList || []),
          {
            _id: cleanId,
            _key: cleanId,
            title: art.displayTitle || art.title || 'Photograph',
            species: art.species || '',
            fileName: art.fileName || '',
            imageUrl: art.imageUrl || '',
            venueTitle: art.venueTitle || '',
            parentVenueTitle: art.parentVenueTitle || '',
            slug: art.slug || '',
          },
        ],
      };
    });
  };

  const handleRemoveFromTicker = (artId) => {
    setForm((prev) => ({
      ...prev,
      featuredArtworksList: (prev.featuredArtworksList || []).filter((x) => x._id !== artId),
    }));
  };

  const handleMoveTickerItem = (index, direction) => {
    setForm((prev) => {
      const list = [...(prev.featuredArtworksList || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, featuredArtworksList: list };
    });
  };

  const handleUploadNewPhotosToTicker = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const chosenCatId = tickerUploadVenueId || categories[0]?._id || '';
    if (!chosenCatId) {
      window.alert('Please select a destination Venue / Sub-Venue for the uploaded ticker photo(s).');
      return;
    }

    const venueObj = categories.find((c) => c._id === chosenCatId);
    const venueTitle = venueObj?.title || 'The Meadowlands';
    const parentVenueTitle = venueObj?.parentTitle || '';

    setIsUploadingTicker(true);
    const newlyCreatedItems = [];

    try {
      for (const file of files) {
        const { cleanCaption, canonicalSpecies, year } = deriveMetadataForTickerUpload(
          file.name,
          venueTitle,
          parentVenueTitle
        );
        const asset = await client.assets.upload('image', file, { filename: file.name });
        const pubId = crypto.randomUUID
          ? crypto.randomUUID()
          : `ticker-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const slugCurrent = makeTickerArtworkSlug(cleanCaption);
        const studyMatch = file.name.match(/(?:[A-Za-z0-9_-]*?)(\d{4,})(?:\b|[-_.]|Edit)/i);
        const studyCode =
          studyMatch && studyMatch[1]
            ? studyMatch[1].slice(-4)
            : pubId.slice(-4).toUpperCase() || '0001';
        const yearLabel = year ? `${year} ` : '';

        const newArtworkDoc = {
          _id: pubId,
          _type: 'artwork',
          title: cleanCaption,
          displayTitle: cleanCaption,
          caption: cleanCaption,
          species: canonicalSpecies || cleanCaption,
          location: 'The Meadowlands, New Jersey',
          ...(year ? { year } : {}),
          fileName: file.name,
          slug: { _type: 'slug', current: slugCurrent },
          image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
          category: { _type: 'reference', _ref: chosenCatId },
          size: 'Standard 4:3',
          roomSetting: 'living-room',
          status: 'available',
          seo: {
            metaTitle:
              `${cleanCaption} — ${venueTitle} (${yearLabel}Study #${studyCode}) | The Meadow Lens`.slice(
                0,
                60
              ),
            metaDescription:
              `Collector fine art photograph "${cleanCaption}" (${yearLabel}${venueTitle} Exhibition, Study #${studyCode}) captured in the New Jersey Meadowlands by David McClure.`.slice(
                0,
                160
              ),
            keywords: [
              cleanCaption,
              canonicalSpecies && `${canonicalSpecies} Photography`,
              `${cleanCaption} ${venueTitle}`,
              `${cleanCaption} Study ${studyCode}`,
              venueTitle,
              'The Meadowlands',
              'Atlantic Flyway',
              'David McClure',
              'The Meadow Lens',
            ].filter(Boolean),
          },
        };

        await client.createOrReplace(newArtworkDoc);

        const tickerEntry = {
          _id: pubId,
          _key: pubId,
          title: cleanCaption,
          species: canonicalSpecies || cleanCaption,
          fileName: file.name,
          imageUrl: asset.url,
          venueTitle,
          parentVenueTitle,
          slug: slugCurrent,
          assetId: asset._id,
          categoryId: chosenCatId,
        };
        newlyCreatedItems.push(tickerEntry);
      }

      if (newlyCreatedItems.length > 0) {
        setForm((prev) => ({
          ...prev,
          featuredArtworksList: [...(prev.featuredArtworksList || []), ...newlyCreatedItems],
        }));
        setGalleryOptions((prev) => [...newlyCreatedItems, ...prev]);
        setSaveMessage(
          `✓ Uploaded ${newlyCreatedItems.length} photo(s) & added to Ticker! Click "Save & Publish Live" to publish ticker changes.`
        );
      }
    } catch (err) {
      console.error('Error uploading photo directly to ticker:', err);
      window.alert('Failed to upload photo to ticker: ' + err.message);
    } finally {
      setIsUploadingTicker(false);
      e.target.value = '';
    }
  };

  const handleResetDefaults = () => {
    setForm((prev) => ({
      ...prev,
      showWelcomeOverlay: true,
      rightPanelFit: 'cover',
      welcomeBgColor: '#0B1528',
      welcomeBgOpacity: 75,
      welcomeTextColor: '#F8FAFC',
      welcomeBackdropBlur: true,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const hpDocs = await client.fetch(`*[_id in ["drafts.homepage", "homepage"]]`);
      const pubHp = hpDocs?.find((d) => d._id === 'homepage');
      const draftHp = hpDocs?.find((d) => d._id === 'drafts.homepage');
      const baseHp = {
        _type: 'homepage',
        ...(pubHp || {}),
        ...(draftHp || {}),
        _id: 'homepage',
      };
      delete baseHp._rev;
      delete baseHp._updatedAt;

      if (form.heroImageAssetId) {
        baseHp.heroImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: form.heroImageAssetId },
        };
      }
      if (form.rightPanelImageAssetId) {
        baseHp.rightPanelImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: form.rightPanelImageAssetId },
        };
      }

      baseHp.rightPanelFit = form.rightPanelFit === 'contain' ? 'contain' : 'cover';
      baseHp.showWelcomeOverlay = Boolean(form.showWelcomeOverlay);
      baseHp.welcomeHeadline = (form.welcomeHeadline || '').trim() || 'Welcome to The Meadow Lens';
      baseHp.welcomeBgColor = form.welcomeBgColor || '#0B1528';
      baseHp.welcomeBgOpacity = Math.max(0, Math.min(100, Number(form.welcomeBgOpacity ?? 75)));
      baseHp.welcomeTextColor = form.welcomeTextColor || '#F8FAFC';
      baseHp.welcomeBackdropBlur = Boolean(form.welcomeBackdropBlur);
      baseHp.featuredTickerSpeed = Math.max(
        10,
        Math.min(300, Number(form.featuredTickerSpeed ?? 60))
      );

      // Persist Featured Ticker Artworks array
      baseHp.featuredArtworks = (form.featuredArtworksList || [])
        .filter((item) => item && item._id)
        .map((item) => {
          const cleanId = item._id.replace(/^drafts\./, '');
          return {
            _key: item._key || cleanId,
            _type: 'reference',
            _ref: cleanId,
          };
        });

      const paragraphs = String(form.welcomeBodyText || '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (paragraphs.length > 0) {
        baseHp.welcomeText = paragraphs.map((para, idx) => ({
          _key: `wb_${idx + 1}`,
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _key: `ws_${idx + 1}`,
              _type: 'span',
              marks: [],
              text: para,
            },
          ],
        }));
      }

      const tx = client.transaction();
      tx.createOrReplace(baseHp);
      tx.delete('drafts.homepage');
      await tx.commit();

      setSaveMessage('✓ Saved & Published Homepage Panels & Featured Ticker Live to Website!');
      if (onSaved) {
        await onSaved();
      }
      if (isModal && onClose) {
        window.alert(
          'Saved & Published Homepage Static Panels, Welcome Overlay & Featured Ticker Live!'
        );
        onClose();
      }
    } catch (err) {
      console.error('Error saving homepage settings:', err);
      window.alert('Error saving homepage settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTickerCandidates = useMemo(() => {
    const q = tickerSearch.trim().toLowerCase();
    return galleryOptions
      .filter((opt) => {
        if (tickerVenueFilter && opt.categoryId !== tickerVenueFilter) return false;
        if (!q) return true;
        return (
          (opt.displayTitle || '').toLowerCase().includes(q) ||
          (opt.title || '').toLowerCase().includes(q) ||
          (opt.species || '').toLowerCase().includes(q) ||
          (opt.fileName || '').toLowerCase().includes(q) ||
          (opt.venueTitle || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 48);
  }, [galleryOptions, tickerSearch, tickerVenueFilter]);

  const rootCategories = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const subCategories = useMemo(() => categories.filter((c) => c.parentId), [categories]);

  return (
    <div
      style={{
        background: '#ffffff',
        color: '#0f172a',
        padding: isModal ? '0' : '1.5rem 2rem',
        maxWidth: isModal ? '100%' : '1240px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>
            🏠 Homepage Panels, Welcome Overlay &amp; Featured Ticker Designer
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', color: '#475569' }}>
            Manage the Left &amp; Right 16:9 static panels, customize the Welcome overlay, and add or upload photographs to the Featured Works Ticker.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {saveMessage && (
            <span
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {saveMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading || isUploadingTicker || isLoading}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: isSaving || isUploading || isUploadingTicker ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
            }}
          >
            {isSaving ? 'Saving & Publishing...' : '💾 Save & Publish Live'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.35rem',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. REAL-TIME SIDE-BY-SIDE 50/50 LIVE PREVIEW */}
        <div
          style={{
            background: '#050505',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid #334155',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.65rem',
              color: '#cbd5e1',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span>✨ Real-Time Homepage Hero Preview (50/50 Twin 16:9 Static Panels)</span>
            <span style={{ color: '#9AB17A' }}>
              {form.showWelcomeOverlay
                ? `Welcome Overlay: ON | Bg: ${form.welcomeBgColor} | Opacity: ${form.welcomeBgOpacity}% (${100 - Number(form.welcomeBgOpacity || 0)}% Transparent)`
                : 'Welcome Overlay: OFF (Pure Static Photo)'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '0.9rem',
            }}
          >
            {/* Left Static Panel Preview */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 9',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                background: '#0a0a0a',
              }}
            >
              <img
                src={`${form.heroImageUrl}?w=900&q=85&auto=format`}
                alt="Left Panel Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}
              >
                Left Panel Static Image (16:9)
              </div>
            </div>

            {/* Right Static Panel + Live Welcome Overlay Preview */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 9',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                background: '#0a0a0a',
              }}
            >
              <img
                src={`${form.rightPanelImageUrl}?w=900&q=85&auto=format`}
                alt="Right Panel Static Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: form.rightPanelFit === 'contain' ? 'contain' : 'cover',
                  display: 'block',
                }}
              />
              {form.showWelcomeOverlay && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '78%',
                      maxHeight: '92%',
                      overflowY: 'auto',
                      padding: '0.7rem 0.9rem',
                      textAlign: 'center',
                      backgroundColor: convertHexToRgba(form.welcomeBgColor, form.welcomeBgOpacity),
                      color: form.welcomeTextColor || '#F8FAFC',
                      backdropFilter:
                        form.welcomeBackdropBlur && Number(form.welcomeBgOpacity) > 0
                          ? 'blur(10px)'
                          : 'none',
                      WebkitBackdropFilter:
                        form.welcomeBackdropBlur && Number(form.welcomeBgOpacity) > 0
                          ? 'blur(10px)'
                          : 'none',
                      borderRadius: '12px',
                      border:
                        Number(form.welcomeBgOpacity) > 5
                          ? '1px solid rgba(255,255,255,0.18)'
                          : 'none',
                      boxShadow:
                        Number(form.welcomeBgOpacity) > 5
                          ? '0 10px 30px rgba(0,0,0,0.55)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 400,
                        marginBottom: '0.3rem',
                        color: form.welcomeTextColor || '#F8FAFC',
                        textAlign: 'center',
                      }}
                    >
                      {form.welcomeHeadline || 'Welcome to The Meadow Lens'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        lineHeight: 1.4,
                        color: form.welcomeTextColor || '#F8FAFC',
                        opacity: 0.95,
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                      }}
                    >
                      {form.welcomeBodyText}
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}
              >
                Right Panel Static Image {form.showWelcomeOverlay ? '+ Welcome Overlay' : '(No Overlay)'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATIC PANEL PHOTO CONTROLS (LEFT & RIGHT SIDE-BY-SIDE) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Left Panel Static Image Control */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              🖼️ Left Panel Static Image (16:9 Frame)
            </div>
            <div style={{ fontSize: '0.77rem', color: '#475569', marginBottom: '0.7rem', lineHeight: 1.4 }}>
              Controls the left-hand static panel (currently the 600mm Lens Panorama). You can replace it anytime or restore the default lens graphic.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                id="designer-left-static-upload"
                onChange={handleUploadLeftImage}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="designer-left-static-upload"
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  background: '#334155',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading...' : '📤 Upload / Replace Left Image'}
              </label>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    heroImageAssetId:
                      'image-eeb19431e524e43391ed803793c9a8f076b20756-1376x768-jpg',
                    heroImageUrl:
                      'https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg',
                  }))
                }
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                }}
              >
                ↺ Restore 600mm Lens Graphic
              </button>
            </div>
          </div>

          {/* Right Panel Static Image Control */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
              🖼️ Right Panel Static Welcome Image (16:9 Frame)
            </div>
            <div style={{ fontSize: '0.77rem', color: '#047857', marginBottom: '0.7rem', lineHeight: 1.4 }}>
              Upload a new photo from your computer OR pick any existing photograph from your gallery below.
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
              <input
                type="file"
                accept="image/*"
                id="designer-right-static-upload"
                onChange={handleUploadRightImage}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="designer-right-static-upload"
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading Photo...' : '📤 Upload New Right-Panel Static Photo'}
              </label>

              <select
                value={form.rightPanelFit || 'cover'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    rightPanelFit: e.target.value,
                  }))
                }
                style={{
                  padding: '0.45rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #86efac',
                  background: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#064e3b',
                }}
              >
                <option value="cover">Fill 16:9 Frame (Cover — Standard)</option>
                <option value="contain">Fit Full Photo Uncropped (Contain)</option>
              </select>
            </div>

            {/* Quick Picker from Existing Gallery Photos */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                Or Pick an Existing Photo From Your Gallery:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Filter gallery photos by species/title..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  style={{
                    flex: '0 0 42%',
                    padding: '0.42rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                  }}
                />
                <select
                  value={form.rightPanelImageAssetId || ''}
                  onChange={(e) => {
                    const chosenAssetId = e.target.value;
                    const found = galleryOptions.find((o) => o.assetId === chosenAssetId);
                    if (found) {
                      setForm((prev) => ({
                        ...prev,
                        rightPanelImageAssetId: found.assetId,
                        rightPanelImageUrl: found.imageUrl,
                      }));
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.42rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="">-- Select a Gallery Photograph --</option>
                  {galleryOptions
                    .filter((opt) => {
                      if (!gallerySearch.trim()) return true;
                      const q = gallerySearch.toLowerCase();
                      return (
                        (opt.displayTitle || '').toLowerCase().includes(q) ||
                        (opt.title || '').toLowerCase().includes(q) ||
                        (opt.species || '').toLowerCase().includes(q) ||
                        (opt.fileName || '').toLowerCase().includes(q) ||
                        (opt.venueTitle || '').toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 150)
                    .map((opt) => (
                      <option key={opt._id} value={opt.assetId}>
                        {opt.displayTitle || opt.title} {opt.venueTitle ? `(${opt.venueTitle})` : ''} — {opt.fileName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. WELCOME CONTENT OVERLAY CHECKBOX, BACKGROUND COLOR & TRANSPARENCY DESIGNER */}
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '10px',
            padding: '1.1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.8rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(form.showWelcomeOverlay)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    showWelcomeOverlay: e.target.checked,
                  }))
                }
                style={{ width: '20px', height: '20px', accentColor: '#1d4ed8', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a' }}>
                  ☑️ Display &ldquo;Welcome&rdquo; Content Overlay on Right Panel
                </div>
                <div style={{ fontSize: '0.77rem', color: '#1e40af' }}>
                  Check to show the Welcome bio overlay on the right-hand static image. Uncheck to display the right-hand static photo 100% unobstructed (just like the left side).
                </div>
              </div>
            </label>

            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #60a5fa',
                background: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              ↺ Reset Overlay to Industry Standard Defaults
            </button>
          </div>

          {form.showWelcomeOverlay && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1rem',
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
              }}
            >
              {/* Left Sub-Column: Background Color, Transparency Slider, Text Color & Blur */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                    🎨 Welcome Overlay Background Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                    <input
                      type="color"
                      value={form.welcomeBgColor || '#0B1528'}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          welcomeBgColor: e.target.value.toUpperCase(),
                        }))
                      }
                      style={{ width: '44px', height: '36px', padding: 0, border: '1px solid #94a3b8', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={form.welcomeBgColor || '#0B1528'}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          welcomeBgColor: e.target.value,
                        }))
                      }
                      style={{
                        width: '110px',
                        padding: '0.42rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      (Default: <code>#0B1528</code> Deep Midnight Slate)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {[
                      { label: 'Midnight Slate (Default)', hex: '#0B1528', text: '#F8FAFC' },
                      { label: 'Obsidian Black', hex: '#0A0A0A', text: '#F8FAFC' },
                      { label: 'Marsh Green', hex: '#13261C', text: '#F8FAFC' },
                      { label: 'Espresso Bronze', hex: '#211A16', text: '#F8FAFC' },
                      { label: 'Classic Slate', hex: '#1E293B', text: '#F8FAFC' },
                      { label: 'Frosted Ivory', hex: '#F8FAFC', text: '#0F172A' },
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            welcomeBgColor: preset.hex,
                            welcomeTextColor: preset.text,
                          }))
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.26rem 0.52rem',
                          borderRadius: '5px',
                          border:
                            (form.welcomeBgColor || '').toUpperCase() === preset.hex
                              ? '2px solid #2563eb'
                              : '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '0.71rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: preset.hex,
                            border: '1px solid rgba(0,0,0,0.25)',
                          }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Transparency / Opacity Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      🌗 Background Transparency &amp; Opacity
                    </label>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8' }}>
                      Opacity: {form.welcomeBgOpacity}% &nbsp;|&nbsp; Transparency: {100 - Number(form.welcomeBgOpacity || 0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={form.welcomeBgOpacity ?? 75}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        welcomeBgOpacity: Number(e.target.value),
                      }))
                    }
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.69rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    <span>0% Opacity (100% Transparent)</span>
                    <span>75% (Industry Standard)</span>
                    <span>100% Opacity (Solid)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {[
                      { label: 'Fully Transparent (0%)', val: 0 },
                      { label: 'Light Veil (50%)', val: 50 },
                      { label: 'Industry Standard (75%)', val: 75 },
                      { label: 'Deep Contrast (88%)', val: 88 },
                      { label: 'Solid Opaque (100%)', val: 100 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            welcomeBgOpacity: opt.val,
                          }))
                        }
                        style={{
                          padding: '0.26rem 0.52rem',
                          borderRadius: '5px',
                          border:
                            Number(form.welcomeBgOpacity) === opt.val
                              ? '2px solid #2563eb'
                              : '1px solid #cbd5e1',
                          background:
                            Number(form.welcomeBgOpacity) === opt.val ? '#eff6ff' : '#f8fafc',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color & Soft Optical Glass Blur */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    paddingTop: '0.35rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      ✍️ Text Color:
                    </label>
                    <input
                      type="color"
                      value={form.welcomeTextColor || '#F8FAFC'}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          welcomeTextColor: e.target.value.toUpperCase(),
                        }))
                      }
                      style={{ width: '32px', height: '28px', padding: 0, border: '1px solid #94a3b8', borderRadius: '5px', cursor: 'pointer' }}
                    />
                    {[
                      { label: 'Ivory', hex: '#F8FAFC' },
                      { label: 'Gold', hex: '#F7C873' },
                      { label: 'Sage', hex: '#9AB17A' },
                      { label: 'Dark', hex: '#0F172A' },
                    ].map((tc) => (
                      <button
                        key={tc.hex}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            welcomeTextColor: tc.hex,
                          }))
                        }
                        style={{
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '0.69rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tc.label}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(form.welcomeBackdropBlur)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          welcomeBackdropBlur: e.target.checked,
                        }))
                      }
                      style={{ accentColor: '#2563eb' }}
                    />
                    Frosted Glass Blur (Standard)
                  </label>
                </div>
              </div>

              {/* Right Sub-Column: Editable Welcome Headline & Welcome Content Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    📝 Welcome Headline
                  </label>
                  <input
                    type="text"
                    value={form.welcomeHeadline || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        welcomeHeadline: e.target.value,
                      }))
                    }
                    placeholder="Welcome to The Meadow Lens"
                    style={{
                      width: '100%',
                      padding: '0.48rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    📖 Welcome Content / Bio Paragraphs (Separate paragraphs with a blank line)
                  </label>
                  <textarea
                    rows={6}
                    value={form.welcomeBodyText || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        welcomeBodyText: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      flex: 1,
                      padding: '0.55rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.81rem',
                      lineHeight: 1.45,
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. FEATURED WORKS TICKER MANAGER (ADD FROM GALLERY, REORDER, REMOVE, OR UPLOAD NEW PHOTOS DIRECTLY TO TICKER) */}
        <div
          style={{
            background: '#faf5ff',
            border: '2px solid #c084fc',
            borderRadius: '12px',
            padding: '1.2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.9rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#581c87' }}>
                🎞️ Featured Works Ticker Manager ({form.featuredArtworksList.length}{' '}
                {form.featuredArtworksList.length === 1 ? 'Photograph' : 'Photographs'} in Ticker)
              </div>
              <div style={{ fontSize: '0.79rem', color: '#6b21a8', marginTop: '2px' }}>
                Add any existing photograph/product from your gallery, upload brand-new photographs directly into the ticker, reorder slides, or remove items.
              </div>
            </div>

            {/* Ticker Speed Control */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
              }}
            >
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#581c87', whiteSpace: 'nowrap' }}>
                ⏱️ Loop Speed: {form.featuredTickerSpeed || 60}s
              </label>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={form.featuredTickerSpeed || 60}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    featuredTickerSpeed: Number(e.target.value),
                  }))
                }
                style={{ width: '110px', accentColor: '#7e22ce', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(Lower = Faster)</span>
            </div>
          </div>

          {/* 4A. CURRENT PHOTOS IN THE TICKER */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '10px',
              padding: '0.9rem',
              marginBottom: '1rem',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.65rem',
                color: '#f8fafc',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <span>
                ★ Active Ticker Lineup ({form.featuredArtworksList.length} Photos — Scrolls Left-to-Right on Homepage)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Use ⬅️ / ➡️ to reorder or ✕ Remove to take a photo off the ticker
              </span>
            </div>

            {form.featuredArtworksList.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  border: '1px dashed #475569',
                  borderRadius: '8px',
                }}
              >
                No photographs are currently in the Featured Works Ticker. Use the Direct Upload box or Gallery Picker below to add photos!
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {form.featuredArtworksList.map((item, idx) => (
                  <div
                    key={item._id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        height: '115px',
                        background: '#020617',
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={`${item.imageUrl}?w=500&fit=max&q=85`}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            fontSize: '0.75rem',
                          }}
                        >
                          No Preview
                        </div>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'rgba(126, 34, 206, 0.92)',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      {item.venueTitle && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            right: '6px',
                            background: 'rgba(0,0,0,0.75)',
                            color: '#e2e8f0',
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.venueTitle}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '0.55rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.45rem' }}>
                      <div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#f8fafc',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        {item.fileName && (
                          <div
                            style={{
                              fontSize: '0.66rem',
                              color: '#94a3b8',
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={item.fileName}
                          >
                            {item.fileName}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveTickerItem(idx, -1)}
                          style={{
                            padding: '0.25rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid #475569',
                            background: idx === 0 ? '#0f172a' : '#334155',
                            color: idx === 0 ? '#475569' : '#f8fafc',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          }}
                          title="Move earlier in ticker"
                        >
                          ⬅️
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.featuredArtworksList.length - 1}
                          onClick={() => handleMoveTickerItem(idx, 1)}
                          style={{
                            padding: '0.25rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid #475569',
                            background:
                              idx === form.featuredArtworksList.length - 1 ? '#0f172a' : '#334155',
                            color:
                              idx === form.featuredArtworksList.length - 1 ? '#475569' : '#f8fafc',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor:
                              idx === form.featuredArtworksList.length - 1
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                          title="Move later in ticker"
                        >
                          ➡️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromTicker(item._id)}
                          style={{
                            marginLeft: 'auto',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#dc2626',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Remove from ticker (does not delete photo from venue)"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4B. DIRECT UPLOAD NEW PHOTO(S) FROM COMPUTER STRAIGHT TO THE TICKER */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d8b4fe',
              borderRadius: '10px',
              padding: '0.95rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                📤 Upload New Photograph(s) Directly From Computer Into the Ticker
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                Automatically creates a live Product Page (<code>/art/[slug]</code>) in the selected Venue with auto-derived Species &amp; SEO and adds it directly to the Featured Works Ticker.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <select
                value={tickerUploadVenueId}
                onChange={(e) => setTickerUploadVenueId(e.target.value)}
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #c084fc',
                  background: '#faf5ff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#3b0764',
                  minWidth: '220px',
                }}
              >
                <option value="">-- Select Venue for Uploaded Photo --</option>
                <optgroup label="Root Venues (Main)">
                  {rootCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sub-Venues (Subcategories)">
                  {subCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.parentTitle ? `${cat.parentTitle} ▸ ` : ''}
                      {cat.title}
                    </option>
                  ))}
                </optgroup>
              </select>

              <input
                type="file"
                accept="image/*"
                multiple
                id="ticker-direct-photo-upload"
                onChange={handleUploadNewPhotosToTicker}
                disabled={isUploadingTicker}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="ticker-direct-photo-upload"
                style={{
                  padding: '0.55rem 1.05rem',
                  borderRadius: '6px',
                  background: isUploadingTicker ? '#94a3b8' : '#7e22ce',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: isUploadingTicker ? 'not-allowed' : 'pointer',
                  display: 'inline-block',
                }}
              >
                {isUploadingTicker
                  ? 'Uploading & Adding to Ticker...'
                  : '📤 Upload New Photo(s) to Ticker'}
              </label>
            </div>
          </div>

          {/* 4C. VISUAL GALLERY PICKER TO ADD EXISTING PHOTOGRAPHS/PRODUCTS TO THE TICKER */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d8b4fe',
              borderRadius: '10px',
              padding: '0.95rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.6rem',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                ➕ Add Existing Gallery Photographs / Products to Ticker
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 420px', justifyContent: 'flex-end' }}>
                <select
                  value={tickerVenueFilter}
                  onChange={(e) => setTickerVenueFilter(e.target.value)}
                  style={{
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    background: '#f8fafc',
                    minWidth: '190px',
                  }}
                >
                  <option value="">All Venues &amp; Sub-Venues ({galleryOptions.length})</option>
                  <optgroup label="Root Venues">
                    {rootCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Sub-Venues">
                    {subCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.parentTitle ? `${cat.parentTitle} ▸ ` : ''}
                        {cat.title}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <input
                  type="text"
                  placeholder="Search gallery by species, title, or filename..."
                  value={tickerSearch}
                  onChange={(e) => setTickerSearch(e.target.value)}
                  style={{
                    flex: '1 1 220px',
                    maxWidth: '340px',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                gap: '0.65rem',
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '0.25rem',
              }}
            >
              {filteredTickerCandidates.map((art) => {
                const alreadyInTicker = tickerIdSet.has(art._id.replace(/^drafts\./, ''));
                return (
                  <div
                    key={art._id}
                    style={{
                      border: alreadyInTicker ? '2px solid #059669' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: alreadyInTicker ? '#f0fdf4' : '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', height: '100px', background: '#0f172a' }}>
                      {art.imageUrl && (
                        <img
                          src={`${art.imageUrl}?w=400&fit=max&q=80`}
                          alt={art.displayTitle || art.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      )}
                      {art.venueTitle && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.72)',
                            color: '#f8fafc',
                            fontSize: '0.62rem',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {art.venueTitle}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '0.45rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={art.displayTitle || art.title}
                        >
                          {art.displayTitle || art.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.64rem',
                            color: '#64748b',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={art.fileName}
                        >
                          {art.fileName}
                        </div>
                      </div>

                      {alreadyInTicker ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromTicker(art._id.replace(/^drafts\./, ''))}
                          style={{
                            width: '100%',
                            padding: '0.32rem 0.5rem',
                            borderRadius: '5px',
                            border: '1px solid #059669',
                            background: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✓ In Ticker (Click to Remove)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddGalleryArtworkToTicker(art)}
                          style={{
                            width: '100%',
                            padding: '0.32rem 0.5rem',
                            borderRadius: '5px',
                            border: 'none',
                            background: '#7e22ce',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Add to Ticker
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.2rem' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.15rem',
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
          )}
          <button
            type="submit"
            disabled={isSaving || isUploading || isUploadingTicker || isLoading}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              cursor: isSaving || isUploading || isUploadingTicker ? 'not-allowed' : 'pointer',
              fontSize: '0.92rem',
            }}
          >
            {isSaving ? 'Saving & Publishing...' : '💾 Save & Publish Homepage & Ticker Live'}
          </button>
        </div>
      </form>
    </div>
  );
}
