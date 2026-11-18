import React, { useState, useEffect, useMemo } from 'react'
import { set, useClient } from 'sanity'

function WelcomeColorInput(props) {
  const { value = '#0B1528', onChange, schemaType } = props
  const isText = schemaType?.name === 'welcomeTextColor'
  const presets = isText
    ? [
        { label: 'Gallery Ivory (Default)', hex: '#F8FAFC' },
        { label: 'Pure White', hex: '#FFFFFF' },
        { label: 'Dusk Gold', hex: '#F7C873' },
        { label: 'Sage Marsh Green', hex: '#9AB17A' },
        { label: 'Deep Charcoal', hex: '#0F172A' },
      ]
    : [
        { label: 'Midnight Slate (Default)', hex: '#0B1528' },
        { label: 'Obsidian Black', hex: '#0A0A0A' },
        { label: 'Marsh Green', hex: '#13261C' },
        { label: 'Espresso Bronze', hex: '#211A16' },
        { label: 'Classic Slate', hex: '#1E293B' },
        { label: 'Frosted Ivory', hex: '#F8FAFC' },
      ]

  const handleColorChange = (nextHex) => {
    onChange(set(nextHex))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : isText ? '#F8FAFC' : '#0B1528'}
          onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
          style={{
            width: '48px',
            height: '38px',
            padding: 0,
            border: '1px solid #94a3b8',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder={isText ? '#F8FAFC' : '#0B1528'}
          style={{
            width: '130px',
            padding: '0.45rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {presets.map((p) => (
          <button
            key={p.hex}
            type="button"
            onClick={() => handleColorChange(p.hex)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: (value || '').toUpperCase() === p.hex ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '3px',
                background: p.hex,
                border: '1px solid rgba(0,0,0,0.25)',
              }}
            />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function WelcomeOpacityInput(props) {
  const { value = 75, onChange } = props
  const numVal = typeof value === 'number' && !Number.isNaN(value) ? Math.max(0, Math.min(100, value)) : 75
  const transparency = 100 - numVal

  const updateVal = (nextNum) => {
    const clamped = Math.max(0, Math.min(100, Number(nextNum)))
    onChange(set(clamped))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>
          Background Opacity: {numVal}% &nbsp;|&nbsp; Background Transparency: {transparency}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={numVal}
        onChange={(e) => updateVal(e.target.value)}
        style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {[
          { label: '100% Transparent / Text Only (0% Opacity)', val: 0 },
          { label: '50% Transparent (50% Opacity)', val: 50 },
          { label: 'Industry Standard (75% Opacity / 25% Transparent)', val: 75 },
          { label: 'Deep Contrast (88% Opacity)', val: 88 },
          { label: 'Solid Opaque (100% Opacity)', val: 100 },
        ].map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => updateVal(opt.val)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: numVal === opt.val ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: numVal === opt.val ? '#eff6ff' : '#f8fafc',
              color: '#0f172a',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeaturedTickerArrayInput(props) {
  const { value = [], onChange } = props
  const client = useClient({ apiVersion: '2024-01-01' })

  const [galleryArtworks, setGalleryArtworks] = useState([])
  const [categories, setCategories] = useState([])
  const [uploadVenueId, setUploadVenueId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [venueFilter, setVenueFilter] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([
      client.fetch(
        `*[_type == "artwork" && !(_id in path("drafts.**")) && defined(image.asset)] | order(_createdAt desc)[0...2500] {
          _id,
          title,
          displayTitle,
          species,
          "fileName": coalesce(fileName, image.asset->originalFilename, title),
          "imageUrl": image.asset->url,
          "categoryId": category._ref,
          "venueTitle": category->title
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
    ])
      .then(([arts, cats]) => {
        if (!mounted) return
        setGalleryArtworks(arts || [])
        setCategories(cats || [])
        if (cats && cats.length > 0) {
          setUploadVenueId((prev) => prev || cats[0]._id)
        }
      })
      .catch((err) => console.error('Error loading ticker input options:', err))
    return () => {
      mounted = false
    }
  }, [client])

  const artById = useMemo(() => {
    const map = new Map()
    for (const a of galleryArtworks) {
      map.set(a._id.replace(/^drafts\./, ''), a)
    }
    return map
  }, [galleryArtworks])

  const currentItems = useMemo(() => {
    return (Array.isArray(value) ? value : [])
      .filter((item) => item && item._ref)
      .map((item) => {
        const cleanId = item._ref.replace(/^drafts\./, '')
        const doc = artById.get(cleanId)
        return {
          _key: item._key || cleanId,
          _ref: cleanId,
          title: doc?.displayTitle || doc?.title || cleanId,
          fileName: doc?.fileName || '',
          imageUrl: doc?.imageUrl || '',
          venueTitle: doc?.venueTitle || '',
        }
      })
  }, [value, artById])

  const currentRefSet = useMemo(() => new Set(currentItems.map((i) => i._ref)), [currentItems])

  const handleAddRef = (artId) => {
    const cleanId = (artId || '').replace(/^drafts\./, '')
    if (!cleanId || currentRefSet.has(cleanId)) return
    const next = [
      ...(Array.isArray(value) ? value : []),
      { _key: cleanId, _type: 'reference', _ref: cleanId },
    ]
    onChange(set(next))
  }

  const handleRemoveRef = (artId) => {
    const cleanId = (artId || '').replace(/^drafts\./, '')
    const next = (Array.isArray(value) ? value : []).filter(
      (item) => (item?._ref || '').replace(/^drafts\./, '') !== cleanId
    )
    onChange(set(next))
  }

  const handleMoveRef = (index, direction) => {
    const list = [...(Array.isArray(value) ? value : [])]
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= list.length) return
    const temp = list[index]
    list[index] = list[targetIdx]
    list[targetIdx] = temp
    onChange(set(list))
  }

  const handleDirectUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const chosenCatId = uploadVenueId || categories[0]?._id || ''
    if (!chosenCatId) {
      window.alert('Please select a destination Venue for the uploaded photo(s).')
      return
    }
    const venueObj = categories.find((c) => c._id === chosenCatId)
    const venueTitle = venueObj?.title || 'The Meadowlands'

    setIsUploading(true)
    const addedRefs = []
    const addedDocs = []

    try {
      for (const file of files) {
        const rawBase = file.name.replace(/\.[^/.]+$/, '').trim()
        const yearMatch = rawBase.match(/^(.+?)\s+(1[89]|2[0-9])-[A-Za-z0-9]/)
        const cleanCaption =
          yearMatch && yearMatch[1].trim()
            ? yearMatch[1].trim()
            : rawBase
                .replace(/\b(?:P|PA|PB|PC|DSC_|IMG_|DMC)\d{4,}.*$/i, '')
                .replace(/[-_\s]+Edit.*$/i, '')
                .trim() || rawBase

        const asset = await client.assets.upload('image', file, { filename: file.name })
        const pubId = crypto.randomUUID
          ? crypto.randomUUID()
          : `ticker-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        const slugCurrent =
          cleanCaption
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') +
          '-' +
          Math.random().toString(36).substring(2, 6)

        await client.createOrReplace({
          _id: pubId,
          _type: 'artwork',
          title: cleanCaption,
          displayTitle: cleanCaption,
          caption: cleanCaption,
          species: cleanCaption,
          fileName: file.name,
          location: 'The Meadowlands, New Jersey',
          slug: { _type: 'slug', current: slugCurrent },
          image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
          category: { _type: 'reference', _ref: chosenCatId },
          size: 'Standard 4:3',
          roomSetting: 'living-room',
          status: 'available',
        })

        addedRefs.push({ _key: pubId, _type: 'reference', _ref: pubId })
        addedDocs.push({
          _id: pubId,
          title: cleanCaption,
          displayTitle: cleanCaption,
          species: cleanCaption,
          fileName: file.name,
          imageUrl: asset.url,
          categoryId: chosenCatId,
          venueTitle,
        })
      }

      if (addedRefs.length > 0) {
        setGalleryArtworks((prev) => [...addedDocs, ...prev])
        onChange(set([...(Array.isArray(value) ? value : []), ...addedRefs]))
      }
    } catch (err) {
      console.error('Error uploading photo to ticker:', err)
      window.alert('Failed to upload photo to ticker: ' + err.message)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return galleryArtworks
      .filter((a) => {
        if (venueFilter && a.categoryId !== venueFilter) return false
        if (!q) return true
        return (
          (a.displayTitle || '').toLowerCase().includes(q) ||
          (a.title || '').toLowerCase().includes(q) ||
          (a.species || '').toLowerCase().includes(q) ||
          (a.fileName || '').toLowerCase().includes(q) ||
          (a.venueTitle || '').toLowerCase().includes(q)
        )
      })
      .slice(0, 36)
  }, [galleryArtworks, searchQuery, venueFilter])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        padding: '0.85rem',
        borderRadius: '10px',
        background: '#faf5ff',
        border: '1px solid #d8b4fe',
      }}
    >
      {/* Active Ticker Strip */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: '8px',
          padding: '0.75rem',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.55rem' }}>
          🎞️ Active Ticker Photos ({currentItems.length})
        </div>
        {currentItems.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            No photos in ticker yet. Upload or click &ldquo;+ Add to Ticker&rdquo; below.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
              gap: '0.6rem',
            }}
          >
            {currentItems.map((item, idx) => (
              <div
                key={item._key}
                style={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', height: '95px', background: '#020617' }}>
                  {item.imageUrl && (
                    <img
                      src={`${item.imageUrl}?w=400&fit=max&q=80`}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: '#7e22ce',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>
                <div style={{ padding: '0.45rem' }}>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveRef(idx, -1)}
                      style={{
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.68rem',
                        borderRadius: '4px',
                        border: '1px solid #475569',
                        background: '#334155',
                        color: '#fff',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ⬅️
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentItems.length - 1}
                      onClick={() => handleMoveRef(idx, 1)}
                      style={{
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.68rem',
                        borderRadius: '4px',
                        border: '1px solid #475569',
                        background: '#334155',
                        color: '#fff',
                        cursor: idx === currentItems.length - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ➡️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRef(item._ref)}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.68rem',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#dc2626',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Photo Upload into Ticker */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d8b4fe',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#581c87' }}>
          📤 Upload New Photo(s) Directly Into Ticker:
        </div>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={uploadVenueId}
            onChange={(e) => setUploadVenueId(e.target.value)}
            style={{
              padding: '0.4rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              color: '#0f172a',
              background: '#fff',
            }}
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.parentTitle ? `${c.parentTitle} ▸ ` : ''}
                {c.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            multiple
            id="form-ticker-direct-upload"
            onChange={handleDirectUpload}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="form-ticker-direct-upload"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              background: isUploading ? '#94a3b8' : '#7e22ce',
              color: '#fff',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            {isUploading ? 'Uploading...' : '📤 Upload Photo(s) to Ticker'}
          </label>
        </div>
      </div>

      {/* Gallery Search & Visual Picker */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d8b4fe',
          borderRadius: '8px',
          padding: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              color: '#0f172a',
              background: '#fff',
            }}
          >
            <option value="">All Venues ({galleryArtworks.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.parentTitle ? `${c.parentTitle} ▸ ` : ''}
                {c.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search gallery photos by species, title, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.76rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: '0.5rem',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {filteredCandidates.map((art) => {
            const cleanId = art._id.replace(/^drafts\./, '')
            const inTicker = currentRefSet.has(cleanId)
            return (
              <div
                key={art._id}
                style={{
                  border: inTicker ? '2px solid #059669' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: inTicker ? '#f0fdf4' : '#f8fafc',
                }}
              >
                <div style={{ height: '85px', background: '#0f172a' }}>
                  {art.imageUrl && (
                    <img
                      src={`${art.imageUrl}?w=350&fit=max&q=80`}
                      alt={art.displayTitle || art.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </div>
                <div style={{ padding: '0.4rem' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.3rem',
                    }}
                    title={art.displayTitle || art.title}
                  >
                    {art.displayTitle || art.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => (inTicker ? handleRemoveRef(cleanId) : handleAddRef(cleanId))}
                    style={{
                      width: '100%',
                      padding: '0.28rem 0.4rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: inTicker ? '#059669' : '#7e22ce',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {inTicker ? '✓ In Ticker' : '+ Add to Ticker'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const homepage = {
  name: 'homepage',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Left Panel Static Image (16:9 Frame)',
      type: 'image',
      options: { hotspot: true },
      description: 'The static 16:9 image displayed on the left side of the homepage hero (e.g., 600mm Lens Panorama).'
    },
    {
      name: 'rightPanelImage',
      title: 'Right Panel Static Welcome Image (16:9 Frame)',
      type: 'image',
      options: { hotspot: true },
      description: 'The static 16:9 photograph displayed on the right side of the homepage hero (Welcome section).'
    },
    {
      name: 'rightPanelFit',
      title: 'Right Panel Image Fit Mode',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Fill 16:9 Frame Edge-to-Edge (Cover — Industry Standard)', value: 'cover' },
          { title: 'Fit Entire Uncropped Image (Contain)', value: 'contain' }
        ],
        layout: 'radio'
      },
      description: 'Controls whether the right-panel static image fills the 16:9 frame edge-to-edge or fits the full uncropped image.'
    },
    {
      name: 'showWelcomeOverlay',
      title: 'Show "Welcome" Content Overlay on Right Panel',
      type: 'boolean',
      initialValue: true,
      description: 'Check this box to display the Welcome / Short Bio overlay card on the right homepage panel. Uncheck to hide the text overlay and display the right-panel static photograph 100% unobstructed (just like the left panel).'
    },
    {
      name: 'welcomeHeadline',
      title: 'Welcome Headline',
      type: 'string',
      initialValue: 'Welcome to The Meadow Lens',
      description: 'Headline displayed at the top of the Welcome overlay card (e.g., "Welcome to The Meadow Lens").'
    },
    {
      name: 'welcomeText',
      title: 'Welcome Content / Short Bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The introductory paragraphs displayed inside the Welcome overlay on the right homepage panel.'
    },
    {
      name: 'welcomeBgColor',
      title: 'Welcome Overlay Background Color',
      type: 'string',
      initialValue: '#0B1528',
      components: {
        input: WelcomeColorInput,
      },
      description: 'Color picker and presets for the Welcome overlay background (Industry Standard Default: #0B1528 Deep Midnight Slate).'
    },
    {
      name: 'welcomeBgOpacity',
      title: 'Welcome Overlay Background Transparency & Opacity (%)',
      type: 'number',
      initialValue: 75,
      components: {
        input: WelcomeOpacityInput,
      },
      validation: (Rule) => Rule.min(0).max(100),
      description: 'Controls background transparency/opacity from 0% Opacity (100% Transparent) to 100% Opacity (Solid). Industry Standard Default: 75% Opacity (25% Transparency).'
    },
    {
      name: 'welcomeTextColor',
      title: 'Welcome Overlay Text Color',
      type: 'string',
      initialValue: '#F8FAFC',
      components: {
        input: WelcomeColorInput,
      },
      description: 'Color picker and presets for the Welcome headline and body text (Industry Standard Default: #F8FAFC Crisp Gallery Ivory).'
    },
    {
      name: 'welcomeBackdropBlur',
      title: 'Enable Soft Frosted Glass Blur Behind Welcome Overlay',
      type: 'boolean',
      initialValue: true,
      description: 'Applies subtle optical backdrop blur behind the semi-transparent Welcome card for optimal text legibility over photographs (Industry Standard Default: Enabled).'
    },
    {
      name: 'featuredArtworks',
      title: 'Featured Ticker Photos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
      components: {
        input: FeaturedTickerArrayInput,
      },
      description: 'Hand-select or upload the exact photographs/products you want to scroll in the Featured Works Ticker on the homepage.'
    },
    {
      name: 'quote',
      title: 'Bottom Quote',
      type: 'string',
      description: 'e.g. "Laughter and Nature is the best medicine!"'
    },
    {
      name: 'featuredTickerSpeed',
      title: 'Featured Works Ticker Speed (Seconds)',
      type: 'number',
      description: 'How many seconds it takes for the FEATURED WORKS ticker to complete one loop. Default is 60 (lower is faster).',
      initialValue: 60,
      validation: (Rule) => Rule.min(10).max(300)
    }
  ]
}
