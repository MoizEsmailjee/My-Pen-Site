import { Bell, Check, X } from 'lucide-react';
import { formatKes } from '../../lib/storefront';
import { resolveAssetUrl } from '../../utils/assetResolver';
import { useStorefront } from '../../store/StorefrontContext';

export function NotifyMeModal() {
  const {
    notifyModalTarget,
    setNotifyModalTarget,
    notifyNameInput,
    setNotifyNameInput,
    notifyContactInput,
    setNotifyContactInput,
    notifySubmittedMessage,
    notifyError,
    submittingNotify,
    handleSubmitRestockAlert,
  } = useStorefront();
  return (
    <>
      {/* OUT-OF-STOCK "NOTIFY ME" WAITLIST MODAL (SAVES TO FIRESTORE /restock_alerts) */}
      {notifyModalTarget && (
        <div
          onClick={() => setNotifyModalTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#FAF8F5] border border-[#DCD5C7] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#0A2246] text-white px-6 py-4 flex items-center justify-between border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-semibold">
                    Notify Me When Back in Stock
                  </h3>
                  <p className="text-[11px] text-white/75">
                    Nairobi Atelier Priority Restock Alert
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyModalTarget(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#E6E1D8]">
                <img
                  src={resolveAssetUrl(
                    notifyModalTarget.variant.image || notifyModalTarget.product.image
                  )}
                  alt={notifyModalTarget.variant.label}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] p-1 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0A2246] truncate">
                    {notifyModalTarget.product.name}
                  </p>
                  <p className="text-xs text-[#5C5852] font-medium mt-0.5">
                    {notifyModalTarget.variant.label.split(' · ')[0]}
                    {notifyModalTarget.nibSize ? ` · ${notifyModalTarget.nibSize} Nib` : ''}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-mono-tabular font-semibold text-rose-700">
                    Currently Out of Stock · {formatKes(notifyModalTarget.product.priceKes)}
                  </span>
                </div>
              </div>

              {notifySubmittedMessage ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Priority Restock Alert Registered</span>
                    </div>
                    <p className="text-xs leading-relaxed">{notifySubmittedMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyModalTarget(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0A2246] hover:bg-[#133468] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Continue Exploring Collection
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRestockAlert} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={notifyNameInput}
                      onChange={(e) => setNotifyNameInput(e.target.value)}
                      placeholder="e.g. Wanjiku Mwangi"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                      Email or Kenyan WhatsApp / Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={notifyContactInput}
                      onChange={(e) => setNotifyContactInput(e.target.value)}
                      placeholder="e.g. +254 712 345 678 or collector@email.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                    />
                  </div>

                  {notifyError && (
                    <p className="text-xs font-semibold text-rose-700">{notifyError}</p>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={submittingNotify}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0A2246] hover:bg-[#133468] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4 text-[#E5B25D]" />
                      <span>
                        {submittingNotify ? 'Saving Alert...' : 'Notify Me on Restock'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifyModalTarget(null)}
                      className="py-3 px-4 rounded-xl border border-[#DCD5C7] bg-white hover:bg-[#F3EFE8] text-[#5C5852] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
