import { ChevronLeft, ChevronRight, Plus, X, ZoomIn, ZoomOut } from 'lucide-react';
import { INK_STUDIO_SHADES } from '../../data/products';
import { resolveAssetUrl } from '../../utils/assetResolver';
import { useStorefront } from '../../store/StorefrontContext';

export function ZoomLightbox() {
  const {
    zoomModal,
    setZoomModal,
    handleAddInkShadeDirectly,
  } = useStorefront();
  return (
    <>
      {/* FULLSCREEN OPTICAL ZOOM & INK SWATCH INSPECTOR LIGHTBOX */}
      {zoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoom Inspector: ${zoomModal.title}`}
        >
          <div className="relative w-full max-w-5xl bg-paper border border-line rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Top Inspector Bar */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-line bg-paper flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {zoomModal.swatchHex && (
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-xs"
                    style={{ backgroundColor: zoomModal.swatchHex }}
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-serif-display text-lg sm:text-xl font-semibold text-ink truncate">
                    {zoomModal.title}
                  </h3>
                  {zoomModal.subtitle && (
                    <p className="text-xs text-ink-soft truncate">{zoomModal.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bottle + Swatch vs Swatch Card Close-Up Toggle when secondarySrc is present */}
                {zoomModal.secondarySrc && (
                  <div className="inline-flex items-center bg-line p-0.5 rounded border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        setZoomModal((prev) =>
                          prev ? { ...prev, activeView: 'primary' } : null
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                        zoomModal.activeView === 'primary'
                          ? 'bg-ink text-white'
                          : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      Bottle + Swatch
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomModal((prev) =>
                          prev ? { ...prev, activeView: 'secondary' } : null
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                        zoomModal.activeView === 'secondary'
                          ? 'bg-ink text-white'
                          : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      Swatch Card Close-Up
                    </button>
                  </div>
                )}

                {/* Optical Zoom Level Buttons: 1x, 2x, 3x */}
                <div className="inline-flex items-center gap-1 bg-white px-1.5 py-1 rounded border border-line">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              zoomLevel: prev.zoomLevel > 1 ? ((prev.zoomLevel - 1) as 1 | 2) : 1,
                            }
                          : null
                      )
                    }
                    title="Zoom Out"
                    className="p-1 text-ink-soft hover:text-ink cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  {([1, 2, 3] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setZoomModal((prev) => (prev ? { ...prev, zoomLevel: lvl } : null))
                      }
                      className={`px-2 py-0.5 text-xs font-mono-tabular rounded transition-colors cursor-pointer ${
                        zoomModal.zoomLevel === lvl
                          ? 'bg-ink text-white font-semibold'
                          : 'text-ink-soft hover:bg-line'
                      }`}
                    >
                      {lvl}×
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setZoomModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              zoomLevel: prev.zoomLevel < 3 ? ((prev.zoomLevel + 1) as 2 | 3) : 3,
                            }
                          : null
                      )
                    }
                    title="Zoom In"
                    className="p-1 text-ink-soft hover:text-ink cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomModal(null)}
                  aria-label="Close zoom inspector"
                  className="p-1.5 rounded bg-line text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Zoom Viewport */}
            <div
              onMouseMove={(e) => {
                if (zoomModal.zoomLevel === 1) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        panX: Math.max(0, Math.min(100, x)),
                        panY: Math.max(0, Math.min(100, y)),
                      }
                    : null
                );
              }}
              onClick={() =>
                setZoomModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        zoomLevel: prev.zoomLevel === 1 ? 2 : prev.zoomLevel === 2 ? 3 : 1,
                      }
                    : null
                )
              }
              className={`relative flex-1 min-h-[380px] sm:min-h-[500px] bg-white flex items-center justify-center overflow-hidden select-none ${
                zoomModal.zoomLevel > 1 ? 'cursor-crosshair' : 'cursor-zoom-in'
              }`}
            >
              {(() => {
                const activeSrc =
                  zoomModal.activeView === 'secondary' && zoomModal.secondarySrc
                    ? zoomModal.secondarySrc
                    : zoomModal.src;

                return (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={resolveAssetUrl(activeSrc, 'full')}
                    alt={zoomModal.title}
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${zoomModal.zoomLevel})`,
                      transformOrigin: `${zoomModal.panX}% ${zoomModal.panY}%`,
                    }}
                    className="max-h-[66vh] max-w-full object-contain transition-transform duration-75"
                  />
                );
              })()}

              {/* Prev / Next Shade Navigation if viewing an Iroshizuku Ink Shade */}
              {zoomModal.inkShadeId && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = INK_STUDIO_SHADES.findIndex(
                        (s) => s.id === zoomModal.inkShadeId
                      );
                      const prevIdx =
                        (currentIdx - 1 + INK_STUDIO_SHADES.length) %
                        INK_STUDIO_SHADES.length;
                      const prevShade = INK_STUDIO_SHADES[prevIdx];
                      setZoomModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              src: prevShade.image,
                              secondarySrc: prevShade.swatchImage,
                              title: `Pilot Iroshizuku — ${prevShade.name} (${prevShade.kanji})`,
                              subtitle: `${prevShade.meaning} · ${prevShade.sheenNote}`,
                              swatchHex: prevShade.hex,
                              inkShadeId: prevShade.id,
                            }
                          : null
                      );
                    }}
                    title="Previous Iroshizuku Ink Shade"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-paper/95 border border-line text-ink hover:bg-ink hover:text-white shadow-md transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = INK_STUDIO_SHADES.findIndex(
                        (s) => s.id === zoomModal.inkShadeId
                      );
                      const nextIdx = (currentIdx + 1) % INK_STUDIO_SHADES.length;
                      const nextShade = INK_STUDIO_SHADES[nextIdx];
                      setZoomModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              src: nextShade.image,
                              secondarySrc: nextShade.swatchImage,
                              title: `Pilot Iroshizuku — ${nextShade.name} (${nextShade.kanji})`,
                              subtitle: `${nextShade.meaning} · ${nextShade.sheenNote}`,
                              swatchHex: nextShade.hex,
                              inkShadeId: nextShade.id,
                            }
                          : null
                      );
                    }}
                    title="Next Iroshizuku Ink Shade"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-paper/95 border border-line text-ink hover:bg-ink hover:text-white shadow-md transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Inspector Helper & Quick Add Bar */}
            <div className="px-4 sm:px-6 py-3 border-t border-line bg-wash flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
              <span>
                Move cursor across image to pan at <strong>{zoomModal.zoomLevel}×</strong> magnification · Click image to cycle zoom (1× / 2× / 3×)
              </span>

              {zoomModal.inkShadeId && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const shade = INK_STUDIO_SHADES.find(
                        (s) => s.id === zoomModal.inkShadeId
                      );
                      if (shade) {
                        handleAddInkShadeDirectly(shade);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded bg-ink hover:bg-ink text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add 50ml Bottle · KES 6,000</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
