import { ArrowRight, Heart } from 'lucide-react';
import { ResilientImage } from './primitives';
import { Link } from 'react-router-dom';
import { useStorefront } from '../store/StorefrontContext';

export function HeroSection() {
  const {
    wishlist,
  } = useStorefront();
  return (
    <>
      {/* SECTION 1: STOREFRONT HERO (Split-Column Showcase + Full-Width Provenance Strip) */}
      <section className="max-w-[1280px] mx-auto px-6 pt-10 pb-16 lg:pt-14 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Editorial Narrative (No duplicate logo box below header) */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#B58435] mb-3">
                Authorized Kenya Purveyor · Pilot Japan &amp; Waterman Paris
              </p>

              <h1
                className="font-serif-display font-semibold text-[#0A2246] tracking-tight leading-[1.08] mb-6"
                style={{
                  fontSize: 'clamp(2.5rem, 4.2vw, 4rem)',
                  textWrap: 'balance',
                }}
              >
                Discover the Art of Writing.
              </h1>

              <div className="space-y-4 text-base lg:text-[17px] leading-[1.68] text-[#3F3D39] max-w-[60ch]">
                <p>
                  Experience the beauty of Japanese and European craftsmanship through an
                  exclusive collection of Pilot fountain pens, 24 Iroshizuku bottled inks, and
                  Waterman Paris inks.
                </p>
                <p className="text-[#5C5852]">
                  Whether you are discovering fountain pens for the first time or are a
                  passionate writing enthusiast, find your perfect writing companion at{' '}
                  <span className="font-semibold text-[#0A2246]">
                    PENS <span className="italic text-[#B58435]">R</span> US — The Pen Specialists
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[#E6E1D8] flex flex-wrap items-center gap-5">
              <Link
                to="/#collection"
                className="inline-flex items-center gap-3 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase bg-[#0A2246] text-white hover:bg-[#133468] rounded transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Our Collection</span>
                <ArrowRight className="w-4 h-4 text-[#E5B25D]" />
              </Link>

              <Link
                to="/wishlist"
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-[#0A2246] hover:text-[#B58435] transition-colors whitespace-nowrap shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.length > 0 ? 'fill-[#C88A2E] text-[#C88A2E]' : 'text-[#C88A2E]'
                  }`}
                />
                <span className="font-mono-tabular">Saved Wishlist ({wishlist.length})</span>
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity Studio Product Photography */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full overflow-hidden rounded-lg border border-[#E6E1D8] bg-[#F1EDE4]">
              <ResilientImage
                src="/assets/images/hero_pilot_fountain_pen_1794023542555.jpg"
                alt="Japanese Pilot fountain pen resting beside a cut-glass bottle of Pilot Iroshizuku Tsuki-yo ink on cream Japanese washi paper"
                fallbackTitle="Pilot Custom & Iroshizuku Tsuki-yo"
                size="full"
                priority
                className="w-full h-full min-h-[340px] lg:h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs tracking-wider uppercase text-white/80">
                    Featured Pairing · Fine &amp; Medium Nibs Available
                  </p>
                  <p className="font-serif-display text-xl font-medium mt-0.5">
                    Pilot Fountain Pens &amp; 24 Iroshizuku Inks (50ml)
                  </p>
                </div>
                <span className="font-mono-tabular text-xs text-white/90 whitespace-nowrap shrink-0">
                  From KES 2,500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Provenance & Service Strip Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-[#E6E1D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-[#6E6A63]">01 · Origin &amp; Authenticity</p>
            <p className="text-sm font-semibold text-[#171614] mt-1">
              100% Genuine Pilot Japan Imports
            </p>
            <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
              Includes the Pilot Prera Café Series, Kakuno Madoromi Series, Kakuno Family Series, and all 24 Iroshizuku inks.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6E6A63]">02 · Japanese Nib Options</p>
            <p className="text-sm font-semibold text-[#171614] mt-1">
              Fine (0.35mm) &amp; Medium (0.50mm)
            </p>
            <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
              Select your preferred nib grade on every Pilot Prera and Kakuno fountain pen.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6E6A63]">03 · Dispatch in Kenya</p>
            <p className="text-sm font-semibold text-[#171614] mt-1">
              Same-Day Nairobi &amp; Nationwide Courier
            </p>
            <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
              Complimentary Nairobi delivery and nationwide overnight courier to major towns.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6E6A63]">04 · Flexible Settlement</p>
            <p className="text-sm font-semibold text-[#171614] mt-1">
              M-Pesa &amp; Cash on Delivery
            </p>
            <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
              Inspect your writing instrument upon arrival in Nairobi or settle seamlessly via M-Pesa.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
