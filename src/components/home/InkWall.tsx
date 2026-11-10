import { useState } from 'react';
import { Link } from 'react-router-dom';
import { INK_STUDIO_SHADES, InkShadeOption } from '../../data/products';
import { stockLabel, stockState } from '../../lib/productDisplay';
import { ROUTES, productPath } from '../../lib/routes';
import { formatKes } from '../../lib/storefront';
import { useStorefront } from '../../store/StorefrontContext';

const INK_PRODUCT_ID = 'pilot-iroshizuku-ink';
const FAMILIES = ['All', ...Array.from(new Set(INK_STUDIO_SHADES.map((s) => s.colorFamily)))];

/** Brush-stroke shaped colour block, shared by the wall and the detail panel. */
const STROKE_RADIUS = '4px 14px 5px 12px / 12px 5px 14px 4px';

export function InkWall() {
  const {
    iroshizukuProduct,
    storeSettings,
    justAddedKey,
    handleAddInkShadeDirectly,
    handleOpenNotifyMeModal,
  } = useStorefront();
  const [family, setFamily] = useState('All');
  const [selectedId, setSelectedId] = useState(INK_STUDIO_SHADES[1]?.id ?? INK_STUDIO_SHADES[0].id);

  const shade: InkShadeOption =
    INK_STUDIO_SHADES.find((s) => s.id === selectedId) ?? INK_STUDIO_SHADES[0];
  const variant = iroshizukuProduct.variants.find((v) => v.id === shade.id);
  const soldOut = variant ? stockState(variant) === 'out' : false;
  const justAdded = justAddedKey === `${INK_PRODUCT_ID}-${shade.id}`;
  const price = iroshizukuProduct.priceKes;
  const bundleSaving = price * 3 - storeSettings.inkMixingSetBundleKes;

  return (
    <section id="inks" className="scroll-mt-28 py-12 md:py-14">
      <div className="page">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h2 className="text-3xl md:text-[2rem]">
              Iroshizuku, all {INK_STUDIO_SHADES.length} shades
            </h2>
            <p className="mt-1 text-ink-soft">
              50 ml bottles, {formatKes(price)} each. Tap a colour to see it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by colour family">
            {FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={family === f}
                onClick={() => setFamily(f)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  family === f
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-sheet hover:border-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-8 md:grid-cols-[1.5fr_1fr]">
          <div className="grid min-w-0 grid-cols-4 gap-2 sm:grid-cols-5">
            {INK_STUDIO_SHADES.filter((s) => family === 'All' || s.colorFamily === family).map(
              (s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === shade.id}
                  onClick={() => setSelectedId(s.id)}
                  className="group flex min-w-0 flex-col gap-1.5 text-left"
                >
                  <span
                    className={`block aspect-[5/3] w-full outline-offset-[3px] ${
                      s.id === shade.id ? 'outline-2 outline-ink' : 'group-hover:outline-1 group-hover:outline-faint'
                    }`}
                    style={{
                      backgroundColor: s.hex,
                      borderRadius: STROKE_RADIUS,
                      boxShadow: 'inset 0 -14px 18px -10px rgba(0,0,0,.28)',
                    }}
                  />
                  <span className="break-words text-xs leading-tight sm:text-[0.8rem]">{s.name}</span>
                </button>
              )
            )}
          </div>

          <aside
            aria-live="polite"
            className="order-first flex min-w-0 flex-col gap-4 rounded-md border border-line bg-sheet p-5 md:sticky md:top-28 md:order-none md:p-6"
          >
            <div
              className="h-20 transition-colors duration-300"
              style={{
                backgroundColor: shade.hex,
                borderRadius: '6px 22px 8px 18px / 18px 8px 22px 6px',
                boxShadow: 'inset 0 -26px 30px -16px rgba(0,0,0,.3)',
              }}
            />
            <div>
              <h3 className="font-serif-display text-2xl leading-tight">
                {shade.name} <span className="text-ink-soft">{shade.kanji}</span>
              </h3>
              <p className="mt-1 text-ink-soft">
                {shade.meaning}. {shade.sheenNote}.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="font-mono-tabular font-semibold">
                  {formatKes(price)} <span className="font-normal text-ink-soft">· 50 ml</span>
                </p>
                {variant && (
                  <p
                    className={`text-sm ${
                      stockState(variant) === 'in' ? 'text-ok' : 'font-medium text-low'
                    }`}
                  >
                    {stockLabel(variant)}
                  </p>
                )}
              </div>
              {soldOut && variant ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => handleOpenNotifyMeModal(iroshizukuProduct, variant)}
                >
                  Notify me
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => handleAddInkShadeDirectly(shade)}>
                  {justAdded ? 'Added' : 'Add to bag'}
                </button>
              )}
            </div>
            <Link to={`${productPath(INK_PRODUCT_ID)}?variant=${shade.id}`} className="link text-sm">
              See the bottle and a handwritten swatch
            </Link>
          </aside>
        </div>

        {bundleSaving > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5">
            <p>
              <strong className="font-semibold">
                Any three bottles for {formatKes(storeSettings.inkMixingSetBundleKes)}.
              </strong>{' '}
              <span className="text-ink-soft">
                That is {formatKes(bundleSaving)} off. The discount applies in the bag automatically.
              </span>
            </p>
            <Link to={ROUTES.sets} className="link">
              Build a set of three
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
