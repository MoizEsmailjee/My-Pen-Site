import { ArrowRight, ShoppingBag } from 'lucide-react';
import { KENYA_LOCATIONS, formatKes } from '../lib/storefront';
import { Link, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { ROUTES } from '../lib/routes';
import { usePageTitle } from '../lib/usePageTitle';
import { useStorefront } from '../store/StorefrontContext';

export function CheckoutPage() {
  const {
    cart,
    setIsCartOpen,
    setActiveCartTab,
    checkoutStep,
    setCheckoutStep,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedLocationIdx,
    setSelectedLocationIdx,
    deliveryAddress,
    setDeliveryAddress,
    paymentMethod,
    setPaymentMethod,
    copiedWhatsAppOrderNo,
    checkoutError,
    confirmedOrder,
    orderTotal,
    handlePlaceOrder,
    buildWhatsAppOrderUrl,
    handleCopyWhatsAppOrder,
  } = useStorefront();
  const navigate = useNavigate();
  usePageTitle('Checkout');

  const isConfirmed = checkoutStep === 'confirmed' && !!confirmedOrder;
  const openOrderHistory = () => {
    setActiveCartTab('history');
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 lg:py-14">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">
        {isConfirmed ? 'Order Confirmed' : 'Checkout'}
      </h1>
      <p className="mt-1 mb-8 text-xs text-ink-soft">
        {isConfirmed
          ? 'Thank you for choosing PENS R US Kenya'
          : 'Free delivery in Nairobi and on orders from KES 6,000'}
      </p>
      {isConfirmed && confirmedOrder ? (
      <div className="space-y-6">
                      <div className="space-y-6">
                        <div className="p-4 rounded border border-ok/30 bg-ok/8 space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-ok font-mono-tabular">
                            <span>ORDER #{confirmedOrder.orderNumber}</span>
                            <span>{confirmedOrder.timestamp}</span>
                          </div>
                          <p className="text-sm font-semibold text-ink">
                            Order Confirmed — Live Tracking Active ({confirmedOrder.orderStatus || 'Processing'})
                          </p>
                          <p className="text-xs text-ink-soft leading-relaxed">
                            We have reserved your Japanese writing instruments for{' '}
                            <span className="font-medium text-ink">
                              {confirmedOrder.customerName}
                            </span>{' '}
                            ({confirmedOrder.phone}). Waybill:{' '}
                            <span className="font-mono-tabular font-semibold text-ink">
                              {confirmedOrder.trackingCode || 'NBO-COUR'}
                            </span>
                            .
                          </p>
                        </div>

                        <div className="space-y-2 text-xs border-b border-line pb-4">
                          <div className="flex justify-between">
                            <span className="text-ink-soft">Destination</span>
                            <span className="font-medium text-ink text-right">
                              {confirmedOrder.city}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-soft">Address</span>
                            <span className="font-medium text-ink text-right">
                              {confirmedOrder.address}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-soft">Payment Method</span>
                            <span className="font-medium text-ink">
                              {confirmedOrder.paymentMethod === 'mpesa'
                                ? 'M-Pesa STK Push / Paybill'
                                : confirmedOrder.paymentMethod === 'whatsapp'
                                ? 'WhatsApp Order Concierge'
                                : 'Cash on Delivery (KES)'}
                            </span>
                          </div>
                        </div>

                        {/* Instant WhatsApp Concierge Dispatch Box */}
                        <div className="p-3.5 rounded-lg border border-ok/40 bg-white space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ok">
                              WhatsApp Order Concierge · Saved to History
                            </span>
                            <span className="text-xs font-mono-tabular text-ink-soft">
                              #{confirmedOrder.orderNumber}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft leading-relaxed">
                            Your order is saved in your{' '}
                            <button
                              type="button"
                              onClick={openOrderHistory}
                              className="font-semibold text-ink underline cursor-pointer"
                            >
                              Order History
                            </button>
                            . Click below to send your itemized KES receipt directly to our Nairobi Atelier on WhatsApp for priority dispatch.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href={buildWhatsAppOrderUrl(confirmedOrder)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 text-xs font-semibold bg-ok hover:bg-ok text-white rounded transition-colors whitespace-nowrap"
                            >
                              <span>Send Order on WhatsApp</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsAppOrder(confirmedOrder)}
                              className="py-2.5 px-3 text-xs font-semibold border border-line bg-paper hover:bg-wash text-ink rounded transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {copiedWhatsAppOrderNo === confirmedOrder.orderNumber
                                ? 'Copied Summary!'
                                : 'Copy Summary'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-ink-soft">
                            Itemized Summary
                          </p>
                          {confirmedOrder.items.map((item) => (
                            <div
                              key={`${item.product.id}-${item.variant.id}-${item.nibSize || 'none'}`}
                              className="flex justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-medium text-ink">
                                  {item.quantity}× {item.product.name}
                                </span>
                                <p className="text-ink-soft">
                                  {item.variant.label}
                                  {item.nibSize
                                    ? ` · ${item.nibSize} Nib (${
                                        item.nibSize === 'Fine' ? '0.35mm' : '0.50mm'
                                      })`
                                    : ''}
                                </p>
                              </div>
                              <span className="font-mono-tabular font-medium text-ink whitespace-nowrap">
                                {formatKes(item.product.priceKes * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-line space-y-1.5 text-xs">
                          {confirmedOrder.promoCode && confirmedOrder.promoDiscountKes && (
                            <div className="flex justify-between text-ok font-medium">
                              <span>Promo Voucher ({confirmedOrder.promoCode})</span>
                              <span className="font-mono-tabular">
                                -{formatKes(confirmedOrder.promoDiscountKes)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-ink-soft">
                            <span>Subtotal</span>
                            <span className="font-mono-tabular">
                              {formatKes(confirmedOrder.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ink-soft">
                            <span>Courier Delivery</span>
                            <span className="font-mono-tabular">
                              {confirmedOrder.deliveryFee === 0
                                ? 'Free'
                                : formatKes(confirmedOrder.deliveryFee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold text-ink pt-2 border-t border-line">
                            <span>Total Due</span>
                            <span className="font-mono-tabular">{formatKes(confirmedOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={openOrderHistory}
                          className="flex-1 py-3 px-4 text-xs font-semibold border border-ink text-ink bg-white rounded hover:bg-wash transition-colors cursor-pointer"
                        >
                          View Order History
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutStep('bag');
                            navigate(ROUTES.home);
                          }}
                          className="flex-1 py-3 px-4 text-xs font-semibold bg-ink text-white rounded hover:bg-ink-hover transition-colors cursor-pointer"
                        >
                          Continue Exploring
                        </button>
                      </div>
      </div>
      ) : cart.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto text-faint stroke-[1.25] mb-3" />
          <p className="font-serif-display text-xl text-ink">Your bag is empty</p>
          <p className="text-xs text-ink-soft mt-1">Add a pen or a bottle of ink before checking out.</p>
          <Link
            to={ROUTES.range}
            className="mt-6 inline-flex items-center px-5 py-3 text-xs font-semibold bg-ink text-white rounded hover:bg-ink-hover transition-colors"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
      <div className="space-y-6">
                      <form id="kenya-checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                        {checkoutError && (
                          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800">
                            {checkoutError}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Wanjiku Mwangi"
                            className="w-full px-3 py-2 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            Kenyan Mobile Number (For Courier &amp; M-Pesa)
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="e.g. +254 712 345 678"
                            className="w-full px-3 py-2 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            County / Region
                          </label>
                          <select
                            value={selectedLocationIdx}
                            onChange={(e) => setSelectedLocationIdx(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                          >
                            {KENYA_LOCATIONS.map((loc, idx) => (
                              <option key={loc.city} value={idx}>
                                {loc.city} — {loc.eta}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            Building, Road, or Landmark
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="e.g. Delta Corner Tower, Westlands, 4th Floor"
                            className="w-full px-3 py-2 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                          />
                        </div>

                        <div className="pt-2">
                          <span className="block text-xs font-medium text-ink-soft mb-2">
                            Payment method
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('mpesa')}
                              className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                                paymentMethod === 'mpesa'
                                  ? 'border-ink bg-ink/8 font-semibold text-ink'
                                  : 'border-line bg-white text-ink-soft'
                              }`}
                            >
                              <div>M-Pesa Express</div>
                              <div className="text-xs font-normal text-ink-soft mt-0.5">
                                Instant STK / Paybill
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('whatsapp')}
                              className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                                paymentMethod === 'whatsapp'
                                  ? 'border-ok bg-ok/10 font-semibold text-ink'
                                  : 'border-line bg-white text-ink-soft'
                              }`}
                            >
                              <div>WhatsApp Concierge</div>
                              <div className="text-xs font-normal text-ink-soft mt-0.5">
                                Itemized KES Chat + Saved History
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('cod')}
                              className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                                paymentMethod === 'cod'
                                  ? 'border-ink bg-ink/8 font-semibold text-ink'
                                  : 'border-line bg-white text-ink-soft'
                              }`}
                            >
                              <div>Cash on Delivery</div>
                              <div className="text-xs font-normal text-ink-soft mt-0.5">
                                Pay upon inspection
                              </div>
                            </button>
                          </div>
                        </div>
                      </form>
      <OrderSummary />
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCartTab('bag');
                                setIsCartOpen(true);
                              }}
                              className="px-3.5 py-3 text-xs font-medium text-ink-soft hover:text-ink border border-line rounded bg-white cursor-pointer whitespace-nowrap"
                            >
                              Edit Bag
                            </button>
                            <button
                              type="submit"
                              form="kenya-checkout-form"
                              className="flex-1 py-3 px-4 text-xs font-semibold bg-ink hover:bg-ink-hover text-white rounded transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {paymentMethod === 'whatsapp'
                                ? `Save & Order via WhatsApp · ${formatKes(orderTotal)}`
                                : `Confirm Order · ${formatKes(orderTotal)}`}
                            </button>
                          </div>
      </div>
      )}
    </div>
  );
}
