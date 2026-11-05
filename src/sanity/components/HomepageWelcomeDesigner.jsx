import React, { useState, useEffect, useCallback } from 'react';
import { useClient } from 'sanity';

export function HomepageWelcomeDesigner({ onClose = null, isModal = false }) {
  const client = useClient({ apiVersion: '2024-01-01' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [galleryOptions, setGalleryOptions] = useState([]);
  const [gallerySearch, setGallerySearch] = useState('');

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
      const hpDoc = await client.fetch(`*[_id in ["drafts.homepage", "homepage"]] | order(_updatedAt desc)[0]{
        _id,
        welcomeHeadline,
        welcomeText,
        showWelcomeOverlay,
        rightPanelFit,
        welcomeBgColor,
        welcomeBgOpacity,
        welcomeTextColor,
        welcomeBackdropBlur,
        "heroImageAssetId": heroImage.asset._ref,
        "heroImageUrl": heroImage.asset->url,
        "rightPanelImageAssetId": coalesce(rightPanelImage.asset._ref, featuredArtworks[0]->image.asset._ref),
        "rightPanelImageUrl": coalesce(rightPanelImage.asset->url, featuredArtworks[0]->image.asset->url)
      }`);

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

        setForm({
          _id: 'homepage',
          heroImageAssetId:
            hpDoc.heroImageAssetId ||
            'image-eeb19431e524e43391ed803793c9a8f076b20756-1376x768-jpg',
          heroImageUrl:
            hpDoc.heroImageUrl ||
            'https://cdn.sanity.io/images/h7ncr8cq/production/eeb19431e524e43391ed803793c9a8f076b20756-1376x768.jpg',
          rightPanelImageAssetId:
            hpDoc.rightPanelImageAssetId ||
            'image-5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567-jpg',
          rightPanelImageUrl:
            hpDoc.rightPanelImageUrl ||
            'https://cdn.sanity.io/images/h7ncr8cq/production/5605871a7f1ecad1d40489e4b594c093c0c8bdbe-4756x3567.jpg',
          rightPanelFit: hpDoc.rightPanelFit || 'cover',
          showWelcomeOverlay: hpDoc.showWelcomeOverlay !== false,
          welcomeHeadline: hpDoc.welcomeHeadline || 'Welcome to The Meadow Lens',
          welcomeBodyText:
            extractedText ||
            "I am David McClure, a fine art photographer with a lifelong passion for capturing the raw, uninterrupted beauty of nature. For years, I have explored the hidden depths of the New Jersey Meadowlands and beyond, waiting for those fleeting moments of perfection.\n\nThis gallery is a curated exhibition of my life's work — from the aggressive grace of birds of prey to the tranquil stillness of untouched vistas. I invite you to step into these digital halls and explore the world through my lens.",
          welcomeBgColor: hpDoc.welcomeBgColor || '#0B1528',
          welcomeBgOpacity:
            typeof hpDoc.welcomeBgOpacity === 'number' && !Number.isNaN(hpDoc.welcomeBgOpacity)
              ? Math.max(0, Math.min(100, hpDoc.welcomeBgOpacity))
              : 75,
          welcomeTextColor: hpDoc.welcomeTextColor || '#F8FAFC',
          welcomeBackdropBlur: hpDoc.welcomeBackdropBlur !== false,
        });
      }

      const list = await client.fetch(
        `*[_type == "artwork" && !(_id in path("drafts.**")) && defined(image.asset)] | order(title asc)[0...350] {
          _id,
          title,
          species,
          "fileName": coalesce(fileName, image.asset->originalFilename, title),
          "assetId": image.asset._ref,
          "imageUrl": image.asset->url,
          "venueTitle": category->title
        }`
      );
      setGalleryOptions(list || []);
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
      const existingHp = await client.fetch(`*[_id == "homepage"][0]`);
      const baseHp = existingHp ? { ...existingHp } : { _id: 'homepage', _type: 'homepage' };
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

      setSaveMessage('✓ Saved & Published Live to Website!');
      if (isModal && onClose) {
        window.alert('Saved & Published Homepage Static Panels & Welcome Overlay Settings Live!');
        onClose();
      }
    } catch (err) {
      console.error('Error saving homepage settings:', err);
      window.alert('Error saving homepage settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        color: '#0f172a',
        padding: isModal ? '0' : '1.5rem 2rem',
        maxWidth: isModal ? '100%' : '1180px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>
            🏠 Homepage Left & Right Static Panels + Welcome Overlay Designer
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', color: '#475569' }}>
            Replace the Left or Right 16:9 static homepage image, toggle the Welcome bio overlay on/off, and customize its background color &amp; transparency.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            disabled={isSaving || isUploading || isLoading}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: isSaving || isUploading ? 'not-allowed' : 'pointer',
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

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
                    top: 0,
                    right: 0,
                    width: '65%',
                    maxHeight: '100%',
                    overflowY: 'auto',
                    padding: '0.75rem 0.85rem',
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
                    borderBottomLeftRadius: '12px',
                    borderLeft:
                      Number(form.welcomeBgOpacity) > 5
                        ? '1px solid rgba(255,255,255,0.16)'
                        : 'none',
                    borderBottom:
                      Number(form.welcomeBgOpacity) > 5
                        ? '1px solid rgba(255,255,255,0.16)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 400,
                      marginBottom: '0.35rem',
                      color: form.welcomeTextColor || '#F8FAFC',
                    }}
                  >
                    {form.welcomeHeadline || 'Welcome to The Meadow Lens'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      lineHeight: 1.42,
                      color: form.welcomeTextColor || '#F8FAFC',
                      opacity: 0.95,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {form.welcomeBodyText}
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
                        (opt.title || '').toLowerCase().includes(q) ||
                        (opt.species || '').toLowerCase().includes(q) ||
                        (opt.fileName || '').toLowerCase().includes(q) ||
                        (opt.venueTitle || '').toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 150)
                    .map((opt) => (
                      <option key={opt._id} value={opt.assetId}>
                        {opt.title} {opt.venueTitle ? `(${opt.venueTitle})` : ''} — {opt.fileName}
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
            disabled={isSaving || isUploading || isLoading}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              cursor: isSaving || isUploading ? 'not-allowed' : 'pointer',
              fontSize: '0.92rem',
            }}
          >
            {isSaving ? 'Saving & Publishing...' : '💾 Save & Publish Homepage Panels Live'}
          </button>
        </div>
      </form>
    </div>
  );
}
