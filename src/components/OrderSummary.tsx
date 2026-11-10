import { formatKes } from '../lib/storefront';
import { useStorefront } from '../store/StorefrontContext';

export function OrderSummary() {
  const {
    promoCodes,
    promoCodeInput,
    setPromoCodeInput,
    appliedPromoCode,
    setAppliedPromoCode,
    promoFeedbackMsg,
    setPromoFeedbackMsg,
    cartRawSubtotal,
    inkMixingSetDiscount,
    promoDiscountKes,
    cartSubtotal,
    selectedLocation,
    deliveryFee,
    orderTotal,
    handleApplyPromoCode,
  } = useStorefront();
  return (
    <>
      {/* Promo code Bar */}
      <div className="p-3 rounded-lg bg-white border border-line space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">
            Promo code
          </span>
          <div className="flex items-center gap-1">
            {promoCodes
              .filter((p) => p.active)
              .slice(0, 2)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPromoCode(p.code)}
                  className="px-2 py-0.5 text-xs font-mono-tabular font-bold rounded bg-wash hover:bg-ink text-ink hover:text-white border border-line transition-colors cursor-pointer"
                  title={p.description}
                >
                  {p.code}
                </button>
              ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter code (e.g. NAIROBI10)"
            className="flex-1 px-2.5 py-1.5 text-xs font-mono-tabular uppercase bg-paper border border-line rounded focus:outline-none focus:border-ink"
          />
          {appliedPromoCode ? (
            <button
              type="button"
              onClick={() => {
                setAppliedPromoCode(null);
                setPromoCodeInput('');
                setPromoFeedbackMsg(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded hover:bg-rose-100 cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleApplyPromoCode()}
              className="px-3.5 py-1.5 text-xs font-semibold bg-ink text-white rounded hover:bg-ink-hover cursor-pointer"
            >
              Apply
            </button>
          )}
        </div>
        {promoFeedbackMsg && (
          <p
            className={`text-xs font-medium ${
              promoFeedbackMsg.type === 'success'
                ? 'text-ok'
                : 'text-rose-700'
            }`}
          >
            {promoFeedbackMsg.text}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        {(inkMixingSetDiscount > 0 || promoDiscountKes > 0) && (
          <div className="flex justify-between text-ink-soft">
            <span>Items Value</span>
            <span className="font-mono-tabular line-through text-faint">
              {formatKes(cartRawSubtotal)}
            </span>
          </div>
        )}
        {inkMixingSetDiscount > 0 && (
          <div className="flex justify-between text-ok font-medium">
            <span>Ink Mixing Set (10% Trio Bundle)</span>
            <span className="font-mono-tabular">
              -{formatKes(inkMixingSetDiscount)}
            </span>
          </div>
        )}
        {appliedPromoCode && promoDiscountKes > 0 && (
          <div className="flex justify-between text-ok font-medium">
            <span>Promo Voucher ({appliedPromoCode.code})</span>
            <span className="font-mono-tabular">-{formatKes(promoDiscountKes)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span className="font-mono-tabular">{formatKes(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between text-ink-soft">
          <span>Delivery ({selectedLocation.city.split(' ')[0]})</span>
          <span className="font-mono-tabular">
            {deliveryFee === 0 ? 'Free' : formatKes(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-ink pt-2 border-t border-line">
          <span>Total</span>
          <span className="font-mono-tabular">{formatKes(orderTotal)}</span>
        </div>
      </div>
    </>
  );
}
