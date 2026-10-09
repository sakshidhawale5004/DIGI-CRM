import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const StoreHero: React.FC<{ onScrollToCatalog: () => void }> = ({ onScrollToCatalog }) => {
  const { theme } = useCommerce();

  if (theme.heroStyle === 'minimal') {
    return (
      <section className="border-b border-neutral-200 py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-2 block">
            Studio Edition 2026
          </span>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-4"
            style={{ fontFamily: theme.fontHeading }}
          >
            {theme.heroHeading}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
            {theme.heroSubheading}
          </p>
          <button
            onClick={onScrollToCatalog}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span>{theme.heroCtaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    );
  }

  if (theme.heroStyle === 'overlay') {
    return (
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden flex items-center justify-center">
        <img
          src={theme.heroImageUrl}
          alt={theme.heroHeading}
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-4">
          <span className="inline-block text-[11px] tracking-widest uppercase font-semibold text-neutral-300">
            Exclusive Release
          </span>
          <h1
            className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-sm"
            style={{ fontFamily: theme.fontHeading }}
          >
            {theme.heroHeading}
          </h1>
          <p className="text-sm sm:text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            {theme.heroSubheading}
          </p>
          <div className="pt-2">
            <button
              onClick={onScrollToCatalog}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 shadow-lg transition-transform active:scale-95"
            >
              <span>{theme.heroCtaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Default 'split' style
  return (
    <section className="border-b border-neutral-200 bg-neutral-50/50 py-10 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>WooCommerce Verified Collection</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.15]"
              style={{ fontFamily: theme.fontHeading }}
            >
              {theme.heroHeading}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
              {theme.heroSubheading}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={onScrollToCatalog}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-xs font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <span>{theme.heroCtaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Photo (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/3 sm:aspect-5/4 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
              <img
                src={theme.heroImageUrl}
                alt={theme.heroHeading}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
