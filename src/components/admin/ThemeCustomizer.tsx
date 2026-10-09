import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Palette, Type, Layout, Sparkles, Check, Image as ImageIcon, Eye } from 'lucide-react';
import { ThemeSettings, ThemePreset } from '../../types';
import { THEME_PRESETS } from '../../data/mockData';

export const ThemeCustomizer: React.FC = () => {
  const { theme, updateTheme, applyThemePreset, setViewMode } = useCommerce();

  const presets = [
    {
      id: 'nordic',
      name: 'Nordic Boutique',
      desc: 'Warm alabaster surfaces, refined serif titles, organic earthy accents.',
      bg: '#fafaf9',
      primary: '#1c1917',
      accent: '#b45309',
    },
    {
      id: 'minimal',
      name: 'Modern Minimalist',
      desc: 'High contrast monochrome Swiss grid, sharp 0px geometry, electric cobalt accents.',
      bg: '#ffffff',
      primary: '#09090b',
      accent: '#2563eb',
    },
    {
      id: 'luxe',
      name: 'Luxe Noir / Atelier',
      desc: 'Deep obsidian surfaces, golden champagne accents, editorial typography.',
      bg: '#09090b',
      primary: '#18181b',
      accent: '#ca8a04',
    },
    {
      id: 'editorial',
      name: 'Editorial Studio',
      desc: 'Deep forest emerald, rounded corners, warm craft feel.',
      bg: '#f8fafc',
      primary: '#064e3b',
      accent: '#059669',
    },
  ];

  const HERO_PHOTO_PRESETS = [
    {
      label: 'Lifestyle Goods',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    },
    {
      label: 'Minimalist Architecture',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    },
    {
      label: 'Warm Ceramic Studio',
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
    },
    {
      label: 'Artisan Workshop',
      url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-600" />
            <span>WooCommerce Theme Studio</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Customize storefront typography, visual branding, color palettes, and hero layouts. Changes reflect live on the Storefront!
          </p>
        </div>

        <button
          onClick={() => setViewMode('storefront')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Launch Live Storefront</span>
        </button>
      </div>

      {/* 1. Theme Presets Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Curated Theme Archetypes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((p) => {
            const isActive = theme.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyThemePreset(p.id)}
                className={`text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isActive
                    ? 'border-neutral-900 ring-2 ring-neutral-900 shadow-md bg-white'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-neutral-900">{p.name}</span>
                    {isActive && (
                      <span className="bg-neutral-900 text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">{p.desc}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <span className="text-[10px] text-neutral-400">Palette:</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: p.bg }}
                      title="Background"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: p.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: p.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Granular Color & Typography Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors & Geometry */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Color Palette & Geometry
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="text-xs px-2.5 py-1.5 rounded border border-neutral-300 font-mono w-28 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Accent / Call-to-Action Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="text-xs px-2.5 py-1.5 rounded border border-neutral-300 font-mono w-28 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Corner Radius Geometry
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'sm', 'md', 'lg'] as const).map((rad) => (
                  <button
                    key={rad}
                    onClick={() => updateTheme({ borderRadius: rad })}
                    className={`text-xs py-1.5 px-2 rounded border text-center transition-colors capitalize ${
                      theme.borderRadius === rad
                        ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {rad === 'none' ? 'Sharp 0px' : rad === 'sm' ? 'Subtle 4px' : rad === 'md' ? 'Soft 8px' : 'Round 14px'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Layout Density */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Typography & Store Brand
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Storefront Brand Name
              </label>
              <input
                type="text"
                value={theme.storeName}
                onChange={(e) => updateTheme({ storeName: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Store Tagline / Subtitle
              </label>
              <input
                type="text"
                value={theme.storeTagline}
                onChange={(e) => updateTheme({ storeTagline: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Headline Typography Pair
              </label>
              <select
                value={theme.fontHeading}
                onChange={(e) =>
                  updateTheme({ fontHeading: e.target.value as ThemeSettings['fontHeading'] })
                }
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300 bg-white"
              >
                <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                <option value="DM Sans">DM Sans (Warm Studio)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Catalog Grid Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateTheme({ gridColumns: 3 })}
                  className={`text-xs py-1.5 px-3 rounded border text-center transition-colors ${
                    theme.gridColumns === 3
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  3 Columns (Airy & Rich)
                </button>
                <button
                  type="button"
                  onClick={() => updateTheme({ gridColumns: 4 })}
                  className={`text-xs py-1.5 px-3 rounded border text-center transition-colors ${
                    theme.gridColumns === 4
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  4 Columns (Dense Catalog)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Banner & Announcement Studio */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" />
          Storefront Hero Banner & Announcement Bar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={theme.heroHeading}
                onChange={(e) => updateTheme({ heroHeading: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Hero Subtitle Copy
              </label>
              <textarea
                rows={2}
                value={theme.heroSubheading}
                onChange={(e) => updateTheme({ heroSubheading: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={theme.heroCtaText}
                onChange={(e) => updateTheme({ heroCtaText: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Hero Layout Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['split', 'overlay', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateTheme({ heroStyle: style })}
                    className={`text-xs py-1.5 px-2 rounded border text-center capitalize ${
                      theme.heroStyle === style
                        ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Hero Photography URL
              </label>
              <input
                type="url"
                value={theme.heroImageUrl}
                onChange={(e) => updateTheme({ heroImageUrl: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300 mb-2"
              />

              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500 block">Or pick from curated studio photography:</span>
                <div className="grid grid-cols-2 gap-2">
                  {HERO_PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateTheme({ heroImageUrl: p.url })}
                      className="flex items-center gap-2 p-1.5 border border-neutral-200 rounded hover:bg-neutral-50 text-left text-[11px]"
                    >
                      <img src={p.url} alt={p.label} className="w-7 h-7 object-cover rounded" />
                      <span className="truncate text-neutral-700 font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-700">Top Announcement Banner</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={theme.showAnnouncement}
                    onChange={(e) => updateTheme({ showAnnouncement: e.target.checked })}
                    className="rounded text-neutral-900 w-3.5 h-3.5"
                  />
                  <span>Show Banner</span>
                </label>
              </div>
              <input
                type="text"
                disabled={!theme.showAnnouncement}
                value={theme.announcementText}
                onChange={(e) => updateTheme({ announcementText: e.target.value })}
                placeholder="e.g. Free shipping on orders over $100 with code FREESHIP"
                className="w-full text-xs px-3 py-2 rounded-md border border-neutral-300 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
