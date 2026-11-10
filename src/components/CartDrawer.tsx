import { Check, History, LogIn, LogOut, Minus, Plus, RotateCcw, Search, ShoppingBag, Truck, UserCheck, X } from 'lucide-react';
import { ResilientImage } from './primitives';
import { ORDER_TRACKING_STAGES, OrderStatus, formatKes } from '../lib/storefront';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { OrderSummary } from './OrderSummary';
import { useStorefront } from '../store/StorefrontContext';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    activeCartTab,
    setActiveCartTab,
    setCustomerName,
    setCustomerPhone,
    isAuthorizedAdmin,
    memberProfile,
    setMemberProfile,
    loginNameInput,
    setLoginNameInput,
    loginContactInput,
    setLoginContactInput,
    authStatusMessage,
    setAuthStatusMessage,
    isSigningIn,
    orderStatusFilter,
    setOrderStatusFilter,
    orderTrackingSearch,
    setOrderTrackingSearch,
    expandedTrackingOrders,
    userOrderHistory,
    totalItemsCount,
    handleUpdateQuantity,
    handleGoogleSignIn,
    handleMemberFormSignIn,
    handleSignOutAccount,
    handleReorderPastPurchase,
    handleToggleOrderTracking,
    handleUpdateOrderStatus,
    buildWhatsAppOrderUrl,
    orderTotal,
  } = useStorefront();
  const navigate = useNavigate();
  return (
    <>
      {/* SLIDE-OVER SHOPPING BAG, ORDER HISTORY & KENYA CHECKOUT DRAWER */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag and Order History"
        >
          <div className="w-full max-w-md bg-paper h-full flex flex-col justify-between border-l border-line shadow-2xl overflow-hidden">
            {/* Drawer Header with Bag / Order History Switcher */}
            <div className="px-6 pt-4 pb-3 border-b border-line bg-paper">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-semibold text-ink">
                    {activeCartTab === 'history'
                      ? 'Member Order History'
                      : 'Your bag'}
                  </h2>
                  <p className="text-xs text-ink-soft">
                    {activeCartTab === 'history'
                      ? memberProfile
                        ? `Signed in as ${memberProfile.name} (${memberProfile.emailOrPhone})`
                        : 'Sign in to view your past PENS R US purchases & reorder'
                      : 'Free delivery in Nairobi and on orders from KES 6,000'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close bag drawer"
                  className="p-2 rounded text-ink-soft hover:text-ink hover:bg-line transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented Tab Switcher: Writing Bag vs Order History */}
              <div className="mt-3.5 grid grid-cols-2 gap-1.5 p-1 bg-wash rounded border border-line">
                <button
                  type="button"
                  onClick={() => setActiveCartTab('bag')}
                  className={`inline-flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeCartTab === 'bag'
                      ? 'bg-ink text-white shadow-2xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">Bag ({totalItemsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCartTab('history')}
                  className={`inline-flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeCartTab === 'history'
                      ? 'bg-ink text-white shadow-2xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">
                    Order History{memberProfile ? ` (${userOrderHistory.length})` : ''}
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeCartTab === 'history' ? (
                !memberProfile ? (
                  /* LOGGED-OUT VIEW IN ORDER HISTORY TAB */
                  <div className="space-y-5">
                    <div className="p-5 rounded-lg border border-line bg-white shadow-2xs">
                      <div className="flex items-center gap-2.5 mb-2">
                        <History className="w-4 h-4 text-brand" />
                        <span className="text-xs font-semibold text-brand">
                          PENS R US Collector Account
                        </span>
                      </div>
                      <h3 className="font-serif-display text-xl font-semibold text-ink">
                        Sign In to View Your Order History
                      </h3>
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                        Access your previous fountain pen, nib, and bottled ink purchases, view
                        itemized KES receipts, and reorder your favourite writing instruments in one
                        click.
                      </p>

                      {authStatusMessage && (
                        <div className="mt-3 p-3 rounded bg-brand/12 border border-brand/40 text-xs text-ink">
                          {authStatusMessage}
                        </div>
                      )}

                      {/* Option 1: Google Sign-In via Firebase Auth */}
                      <button
                        type="button"
                        disabled={isSigningIn}
                        onClick={handleGoogleSignIn}
                        className="mt-4 w-full py-2.5 px-4 text-xs font-semibold bg-ink hover:bg-ink-hover text-white rounded border border-brand/40 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <LogIn className="w-3.5 h-3.5 text-brand" />
                        <span>
                          {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
                        </span>
                      </button>

                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-line" />
                        <span className="text-xs text-faint">
                          Or Atelier Member Login
                        </span>
                        <div className="h-px flex-1 bg-line" />
                      </div>

                      {/* Option 2: Direct Member Login Form (Works inside any iframe/session) */}
                      <form onSubmit={handleMemberFormSignIn} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={loginNameInput}
                            onChange={(e) => setLoginNameInput(e.target.value)}
                            placeholder="e.g. Wanjiku Mwangi"
                            className="w-full px-3 py-2 text-xs bg-paper border border-line rounded focus:outline-none focus:border-ink"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1">
                            Email or Kenyan Mobile Number
                          </label>
                          <input
                            type="text"
                            required
                            value={loginContactInput}
                            onChange={(e) => setLoginContactInput(e.target.value)}
                            placeholder="e.g. +254 712 345 678 or wanjiku@example.co.ke"
                            className="w-full px-3 py-2 text-xs bg-paper border border-line rounded focus:outline-none focus:border-ink"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 text-xs font-semibold bg-white hover:bg-ink text-ink hover:text-white border border-ink rounded transition-colors cursor-pointer"
                        >
                          Sign In &amp; View Purchases
                        </button>
                      </form>

                      {/* Instant Demo Collector Profile Button */}
                      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-soft">
                          Testing the preview?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMemberProfile({
                              uid: 'member-demo-wanjiku',
                              name: 'Wanjiku Mwangi',
                              emailOrPhone: '+254 712 345 678',
                              authMode: 'member',
                            });
                            setCustomerName('Wanjiku Mwangi');
                            setCustomerPhone('+254 712 345 678');
                            setAuthStatusMessage(null);
                          }}
                          className="text-xs font-semibold text-ink hover:text-brand underline underline-offset-4 cursor-pointer"
                        >
                          1-Click Demo Collector Login
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LOGGED-IN ORDER HISTORY LIST */
                  <div className="space-y-4">
                    {/* Member Account Status Bar */}
                    <div className="p-3.5 rounded-lg border border-line bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-ink text-brand flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink truncate">
                            {memberProfile.name}
                          </p>
                          <p className="text-xs text-ink-soft truncate">
                            {memberProfile.emailOrPhone}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOutAccount}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:text-ink bg-wash hover:bg-line rounded border border-line transition-colors cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Order Tracking Filter & Quick Waybill Lookup */}
                    <div className="p-3.5 rounded-lg border border-line bg-white space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-ink" />
                          <span className="text-xs font-semibold text-ink">
                            Live Order Tracking &amp; Status
                          </span>
                        </div>
                        <span className="font-mono-tabular text-xs text-ink-soft">
                          {userOrderHistory.length}{' '}
                          {userOrderHistory.length === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>

                      {/* Search by Order # or Courier Waybill */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-faint absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={orderTrackingSearch}
                          onChange={(e) => setOrderTrackingSearch(e.target.value)}
                          placeholder="Track by Order # (e.g. PRU-5104) or item..."
                          className="w-full pl-8 pr-7 py-1.5 text-xs bg-paper border border-line rounded focus:outline-none focus:border-ink"
                        />
                        {orderTrackingSearch && (
                          <button
                            type="button"
                            onClick={() => setOrderTrackingSearch('')}
                            aria-label="Clear tracking search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ink-soft hover:text-ink cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Interactive Status Filter Buttons */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-wash rounded border border-line">
                        {(['All', 'Processing', 'Out for Courier', 'Delivered'] as const).map(
                          (statusTab) => {
                            const count =
                              statusTab === 'All'
                                ? userOrderHistory.length
                                : userOrderHistory.filter(
                                    (o) => (o.orderStatus || 'Processing') === statusTab
                                  ).length;
                            const isSelected = orderStatusFilter === statusTab;
                            return (
                              <button
                                key={statusTab}
                                type="button"
                                onClick={() => setOrderStatusFilter(statusTab)}
                                className={`py-1.5 px-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap truncate ${
                                  isSelected
                                    ? 'bg-ink text-white shadow-2xs'
                                    : 'text-ink-soft hover:text-ink'
                                }`}
                              >
                                {statusTab === 'Out for Courier' ? 'Courier' : statusTab} ({count})
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {userOrderHistory.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-lg border border-line bg-white">
                        <History className="w-8 h-8 text-faint mx-auto mb-2 stroke-[1.25]" />
                        <p className="font-serif-display text-lg text-ink">
                          No Previous Purchases Yet
                        </p>
                        <p className="text-xs text-ink-soft mt-1">
                          Orders you confirm in checkout will automatically appear here for live
                          tracking and reordering.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrderHistory
                          .filter((order) => {
                            const currentStatus: OrderStatus =
                              order.orderStatus || 'Processing';
                            if (
                              orderStatusFilter !== 'All' &&
                              currentStatus !== orderStatusFilter
                            ) {
                              return false;
                            }
                            if (!orderTrackingSearch.trim()) return true;
                            const q = orderTrackingSearch.trim().toLowerCase();
                            const haystack = [
                              order.orderNumber,
                              order.trackingCode || '',
                              currentStatus,
                              order.city,
                              order.address,
                              ...order.items.map(
                                (i) => `${i.product.name} ${i.variant.label}`
                              ),
                            ]
                              .join(' ')
                              .toLowerCase();
                            return haystack.includes(q);
                          })
                          .map((order) => {
                            const currentStatus: OrderStatus =
                              order.orderStatus || 'Processing';
                            const currentStageIdx = ORDER_TRACKING_STAGES.findIndex(
                              (s) => s.status === currentStatus
                            );
                            const isTrackingExpanded =
                              expandedTrackingOrders[order.orderNumber] ?? false;
                            const trackingCode =
                              order.trackingCode ||
                              `NBO-COUR-${order.orderNumber.replace(/[^0-9]/g, '')}`;
                            const etaText =
                              order.estimatedDelivery ||
                              (currentStatus === 'Delivered'
                                ? `Delivered & Signed · ${order.address}`
                                : currentStatus === 'Out for Courier'
                                ? `Rider En Route to ${order.city.split(' ')[0]}`
                                : 'Preparing at Nairobi Atelier · Nib Inspection');

                            return (
                              <div
                                key={order.id || order.orderNumber}
                                className="p-4 rounded-lg border border-line bg-white shadow-2xs space-y-3.5"
                              >
                                {/* Order Card Top Metadata */}
                                <div className="flex items-start justify-between border-b border-line pb-2.5 gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-mono-tabular text-xs font-bold text-ink">
                                        ORDER #{order.orderNumber}
                                      </span>
                                      <span className="text-faint" aria-hidden="true">
                                        ·
                                      </span>
                                      <span
                                        className={`text-xs font-semibold ${
                                          currentStatus === 'Delivered'
                                            ? 'text-ok'
                                            : currentStatus === 'Out for Courier'
                                            ? 'text-brand'
                                            : 'text-ink'
                                        }`}
                                      >
                                        {currentStatus}
                                      </span>
                                    </div>
                                    <p className="text-xs text-ink-soft mt-0.5">
                                      {order.timestamp} ·{' '}
                                      {order.paymentMethod === 'mpesa'
                                        ? 'M-Pesa Express'
                                        : order.paymentMethod === 'whatsapp'
                                        ? 'WhatsApp Concierge'
                                        : 'Cash on Delivery'}
                                      {order.promoCode ? ` · Promo ${order.promoCode}` : ''}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-mono-tabular text-xs font-semibold text-ink">
                                      {formatKes(order.total)}
                                    </span>
                                    <p className="text-xs font-mono-tabular text-ink-soft">
                                      {trackingCode}
                                    </p>
                                  </div>
                                </div>

                                {/* 3-Stage Order Tracking Progress Stepper */}
                                <div className="p-3 rounded bg-paper border border-line space-y-2.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-ink">
                                      Stage {currentStageIdx + 1} of 3: {currentStatus}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleOrderTracking(order.orderNumber)
                                      }
                                      className="text-xs font-semibold text-ink hover:text-brand underline underline-offset-4 cursor-pointer whitespace-nowrap"
                                    >
                                      {isTrackingExpanded
                                        ? 'Hide Tracking Log'
                                        : 'Track Shipment'}
                                    </button>
                                  </div>

                                  {/* Horizontal 3-Step Visual Progress Bar */}
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {ORDER_TRACKING_STAGES.map((stage, idx) => {
                                      const isCompleted = idx <= currentStageIdx;
                                      const isCurrent = idx === currentStageIdx;
                                      return (
                                        <div key={stage.status} className="space-y-1">
                                          <div
                                            className={`h-1.5 rounded-xs transition-colors ${
                                              isCompleted
                                                ? currentStatus === 'Delivered'
                                                  ? 'bg-ok'
                                                  : isCurrent
                                                  ? 'bg-brand'
                                                  : 'bg-ink'
                                                : 'bg-line'
                                            }`}
                                          />
                                          <div className="flex items-center gap-1">
                                            {isCompleted ? (
                                              <Check
                                                className={`w-3 h-3 shrink-0 ${
                                                  currentStatus === 'Delivered'
                                                    ? 'text-ok'
                                                    : isCurrent
                                                    ? 'text-brand'
                                                    : 'text-ink'
                                                }`}
                                              />
                                            ) : (
                                              <span className="font-mono-tabular text-xs text-faint">
                                                {stage.stepNumber}
                                              </span>
                                            )}
                                            <span
                                              className={`text-xs truncate ${
                                                isCurrent
                                                  ? 'font-bold text-ink'
                                                  : isCompleted
                                                  ? 'font-medium text-ink-soft'
                                                  : 'text-faint'
                                              }`}
                                            >
                                              {stage.label}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <p className="text-xs text-ink-soft leading-snug">
                                    {etaText}
                                  </p>

                                  {/* Expandable Detailed Kenya Courier Tracking Log & Interactive Status Simulator */}
                                  {isTrackingExpanded && (
                                    <div className="pt-2.5 mt-2 border-t border-line space-y-3">
                                      <div className="space-y-2">
                                        {ORDER_TRACKING_STAGES.map((stage, idx) => {
                                          const isCompleted = idx <= currentStageIdx;
                                          const isCurrent = idx === currentStageIdx;
                                          return (
                                            <div
                                              key={stage.status}
                                              className="flex items-start gap-2.5 text-xs"
                                            >
                                              <div
                                                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-mono-tabular shrink-0 mt-0.5 ${
                                                  isCompleted
                                                    ? currentStatus === 'Delivered'
                                                      ? 'bg-ok text-white'
                                                      : isCurrent
                                                      ? 'bg-brand text-white'
                                                      : 'bg-ink text-white'
                                                    : 'bg-line text-ink-soft'
                                                }`}
                                              >
                                                {isCompleted ? (
                                                  <Check className="w-2.5 h-2.5" />
                                                ) : (
                                                  idx + 1
                                                )}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                  <span
                                                    className={`text-xs ${
                                                      isCurrent
                                                        ? 'font-bold text-ink'
                                                        : isCompleted
                                                        ? 'font-semibold text-ink'
                                                        : 'text-faint'
                                                    }`}
                                                  >
                                                    {stage.stepNumber}. {stage.label}
                                                  </span>
                                                  <span className="text-xs font-mono-tabular text-ink-soft">
                                                    {isCurrent
                                                      ? 'Current Stage'
                                                      : isCompleted
                                                      ? 'Completed'
                                                      : 'Pending'}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-ink-soft leading-relaxed">
                                                  {stage.atelierNote}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Courier Waybill & Destination Summary */}
                                      <div className="p-2.5 rounded bg-white border border-line text-xs space-y-1">
                                        <div className="flex justify-between gap-2">
                                          <span className="text-ink-soft">Courier Waybill</span>
                                          <span className="font-mono-tabular font-semibold text-ink">
                                            {trackingCode}
                                          </span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                          <span className="text-ink-soft">Destination</span>
                                          <span className="font-medium text-ink text-right truncate">
                                            {order.address} ({order.city.split(' ')[0]})
                                          </span>
                                        </div>
                                      </div>

                                      {/* Admin-Only Courier Status Control */}
                                      {isAuthorizedAdmin && (
                                        <div className="pt-1">
                                          <span className="block text-xs font-semibold text-ink-soft mb-1.5">
                                            Admin · Update Courier Status
                                          </span>
                                          <div className="grid grid-cols-3 gap-1.5">
                                            {ORDER_TRACKING_STAGES.map((stage) => {
                                              const active = currentStatus === stage.status;
                                              return (
                                                <button
                                                  key={stage.status}
                                                  type="button"
                                                  onClick={() =>
                                                    handleUpdateOrderStatus(order, stage.status)
                                                  }
                                                  className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap truncate ${
                                                    active
                                                      ? 'bg-ink text-white border-ink'
                                                      : 'bg-white text-ink-soft border-line hover:border-ink'
                                                  }`}
                                                >
                                                  {stage.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Itemized Past Purchases */}
                                <div className="space-y-2.5">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={`${order.orderNumber}-${item.product.id}-${item.variant.id}-${idx}`}
                                      className="flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <ResilientImage
                                          src={item.variant.image || item.product.image}
                                          alt={item.product.name}
                                          fallbackTitle={item.product.name}
                                          size="small"
                                          className="w-10 h-10 rounded object-contain bg-white border border-line shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-ink truncate">
                                            {item.quantity}× {item.product.name}
                                          </p>
                                          <p className="text-xs text-ink-soft truncate">
                                            {item.variant.label}
                                            {item.nibSize ? ` · ${item.nibSize} Nib` : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="font-mono-tabular text-xs font-medium text-ink whitespace-nowrap">
                                        {formatKes(item.product.priceKes * item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Delivery, WhatsApp Concierge & 1-Click Reorder Footer */}
                                <div className="pt-2.5 border-t border-line flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs text-ink-soft truncate">
                                    {order.address}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={buildWhatsAppOrderUrl(order)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-ok hover:bg-ok rounded transition-colors whitespace-nowrap shrink-0"
                                    >
                                      <span>WhatsApp Atelier</span>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleReorderPastPurchase(order)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink hover:text-white bg-wash hover:bg-ink rounded border border-line hover:border-ink transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Reorder to Bag</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="w-10 h-10 text-faint stroke-[1.25] mb-3" />
                  <p className="font-serif-display text-xl text-ink">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-ink-soft mt-1 max-w-xs leading-relaxed">
                    Explore the Pilot Prera in Empress Teal (KES 8,500), Kakuno Madoromi (KES 3,200),
                    Kakuno Family (KES 2,500), or all 24 shades of 50ml Iroshizuku bottled inks
                    (KES 6,000).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCartTab('history')}
                    className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink bg-wash hover:bg-ink hover:text-white rounded border border-line transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Past Orders &amp; Reorder</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant.id}-${item.nibSize || 'none'}`}
                      className="p-4 rounded border border-line bg-white flex gap-3.5"
                    >
                      <ResilientImage
                        src={item.variant.image || item.product.image}
                        alt={item.product.name}
                        fallbackTitle={item.product.name}
                        size="small"
                        className="w-16 h-16 rounded object-contain bg-white shrink-0 border border-line"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-semibold text-ink truncate">
                            {item.product.name}
                          </h3>
                          <span className="font-mono-tabular text-xs font-semibold text-ink whitespace-nowrap">
                            {formatKes(item.product.priceKes * item.quantity)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5 truncate">
                          {item.variant.label}
                          {item.nibSize
                            ? ` · ${item.nibSize} Nib (${
                                item.nibSize === 'Fine' ? '0.35mm' : '0.50mm'
                              })`
                            : ''}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-line rounded">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.variant.id,
                                  item.nibSize,
                                  -1
                                )
                              }
                              aria-label="Decrease quantity"
                              className="p-1 text-ink-soft hover:text-ink cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono-tabular">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.variant.id,
                                  item.nibSize,
                                  1
                                )
                              }
                              aria-label="Increase quantity"
                              className="p-1 text-ink-soft hover:text-ink cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono-tabular text-xs text-ink-soft">
                            {formatKes(item.product.priceKes)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-line bg-wash">
              {activeCartTab === 'history' ? (
                <button
                  type="button"
                  onClick={() => setActiveCartTab('bag')}
                  className="w-full py-2.5 px-4 text-xs font-semibold bg-ink text-white rounded hover:bg-ink-hover transition-colors cursor-pointer"
                >
                  Back to bag ({totalItemsCount})
                </button>
              ) : cart.length > 0 ? (
                <div className="space-y-4">
                  <OrderSummary />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate(ROUTES.checkout);
                    }}
                    className="w-full py-3 px-4 text-xs font-semibold bg-ink hover:bg-ink-hover text-white rounded transition-colors cursor-pointer"
                  >
                    Checkout · {formatKes(orderTotal)}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 px-4 text-xs font-semibold border border-ink text-ink rounded hover:bg-ink hover:text-white transition-colors cursor-pointer"
                >
                  Browse Collection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
