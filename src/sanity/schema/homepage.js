import React from 'react'
import { set } from 'sanity'

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
      description: 'Hand-select the exact masterpieces you want to scroll in the Featured Ticker on the homepage.'
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
