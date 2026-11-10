import { MapPin, ShieldCheck, Truck } from 'lucide-react';
import { ResilientImage } from './primitives';

export function StorySection() {
  return (
    <>
      {/* SECTION 4: MORE THAN JUST WRITING (Editorial Story & Kenyan Provenance) */}
      <section
        id="craftsmanship"
        className="py-16 lg:py-24 bg-[#171614] text-[#F5F2EB]"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Macro Nib Photography */}
            <div className="lg:col-span-6 flex">
              <div className="w-full overflow-hidden rounded-lg border border-white/15 bg-[#22201D]">
                <ResilientImage
                  src="/assets/images/japanese_nib_craftsmanship_1794023548186.jpg"
                  alt="Macro close-up of an engraved Japanese fountain pen nib gliding across textured cotton paper with deep indigo ink"
                  fallbackTitle="Japanese Nib Craftsmanship"
                  size="full"
                  className="w-full h-full min-h-[320px] lg:h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Exact Editorial Copy + Craftsmanship Pillars */}
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#A8A298] mb-3">
                  Philosophy &amp; Heritage · Since 1918
                </p>
                <h2
                  className="font-serif-display text-3xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.12] mb-6"
                  style={{ textWrap: 'balance' }}
                >
                  More Than Just Writing.
                </h2>

                <p className="text-base lg:text-lg text-[#E2DDD3] leading-[1.7] tracking-[0.01em] mb-6">
                  Some things deserve to be written by hand. Discover the pleasure of a
                  smoother, more personal writing experience with beautifully crafted Japanese
                  writing instruments.
                </p>

                <p className="font-serif-display italic text-xl lg:text-2xl text-white border-t border-white/15 pt-6">
                  PENS R US – Bringing the Art of Writing to Kenya.
                </p>
              </div>

              {/* 3 Craftsmanship Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/15">
                <div>
                  <p className="font-mono-tabular text-xs text-[#A8A298]">01 · Zero Hand Fatigue</p>
                  <p className="text-sm font-semibold text-white mt-1">Capillary Ink Action</p>
                  <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                    Unlike ballpoints that require downward pressure, a Pilot fountain pen writes
                    under its own light weight.
                  </p>
                </div>
                <div>
                  <p className="font-mono-tabular text-xs text-[#A8A298]">02 · Refillable For Life</p>
                  <p className="text-sm font-semibold text-white mt-1">Sustainable Ritual</p>
                  <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                    One 50ml bottle of Pilot Iroshizuku ink replaces over 60 disposable plastic
                    pens.
                  </p>
                </div>
                <div>
                  <p className="font-mono-tabular text-xs text-[#A8A298]">03 · Personal Character</p>
                  <p className="text-sm font-semibold text-white mt-1">Expressive Line</p>
                  <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                    Subtle tonal shading turns everyday journaling, letters, and signatures into
                    keepsakes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kenya Delivery & Payment Assurance Bar */}
          <div
            id="kenya-delivery"
            className="mt-16 pt-10 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="flex items-start gap-3.5">
              <Truck className="w-5 h-5 text-[#94B8D7] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white font-sans">
                  Same-Day Nairobi Dispatch
                </h3>
                <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                  Orders placed before 3:00 PM EAT are delivered the same afternoon across
                  Nairobi (CBD, Westlands, Kilimani, Lavington, Karen, and Gigiri).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#94B8D7] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white font-sans">
                  Nationwide Kenya Courier
                </h3>
                <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                  Protective foam-lined packaging dispatched overnight to Mombasa, Kisumu,
                  Nakuru, Eldoret, Nanyuki, and across all 47 counties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#94B8D7] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white font-sans">
                  M-Pesa &amp; Cash on Delivery
                </h3>
                <p className="text-xs text-[#BEB8AE] mt-1 leading-relaxed">
                  Settle effortlessly via M-Pesa Till/Paybill or opt for Cash on Delivery upon
                  receiving your package. Free delivery nationwide on orders from KES 6,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
