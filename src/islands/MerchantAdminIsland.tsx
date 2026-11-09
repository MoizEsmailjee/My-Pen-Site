import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Package,
  Sliders,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Tag,
  Truck,
  Save,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  MapPin,
  BarChart3,
  TicketPercent,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  Boxes,
  ArrowUpRight,
  CloudUpload,
} from 'lucide-react';
import { Product, ProductVariant } from '../data/products';
import { resolveAssetUrl } from '../utils/assetResolver';

export interface StoreSettings {
  inkMixingSetBundleKes: number;
  freeDeliveryThresholdKes: number;
  whatsappConciergePhone?: string;
}

export interface PromoCodeRecord {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpendKes: number;
  description: string;
  active: boolean;
  updatedAt?: number;
}

export interface AdminOrderItemSummary {
  productName: string;
  variantLabel: string;
  nibSize?: string;
  quantity: number;
  priceKes: number;
}

export interface AdminOrderRecord {
  id?: string;
  userId?: string;
  orderNumber: string;
  orderStatus?: 'Processing' | 'Out for Courier' | 'Delivered';
  trackingCode?: string;
  estimatedDelivery?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: 'mpesa' | 'cod' | 'whatsapp';
  promoCode?: string;
  promoDiscountKes?: number;
  total: number;
  timestamp: string;
  itemsCount: number;
  items?: AdminOrderItemSummary[];
}

interface MerchantAdminIslandProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProduct: (product: Product) => Promise<void>;
  onAddProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onResetCatalogToDefaults: () => Promise<void>;
  onSyncAllProductsToFirestore: () => Promise<void>;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => Promise<void>;
  promoCodes: PromoCodeRecord[];
  onSavePromoCode: (promo: PromoCodeRecord) => Promise<void>;
  onTogglePromoCodeActive: (promoId: string) => Promise<void>;
  onDeletePromoCode: (promoId: string) => Promise<void>;
  orders: AdminOrderRecord[];
  onUpdateOrderStatusByNumber: (
    orderNumber: string,
    nextStatus: 'Processing' | 'Out for Courier' | 'Delivered'
  ) => void;
  firebaseAdminEmail: string | null;
  isAuthorizedAdmin: boolean;
  isSigningIn: boolean;
  onGoogleSignIn: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  cloudSyncStatus: string | null;
}

const DEFAULT_NEW_PRODUCT: Product = {
  id: '',
  name: '',
  japaneseTitle: '万年筆 · Japanese Atelier Edition',
  category: 'Fountain Pens',
  priceKes: 2500,
  image: '/assets/prera/empress_teal_1.jpg',
  imageFit: 'contain',
  hasNibSelector: true,
  Origin: 'Made in Japan',
  availability: 'In Stock in Nairobi',
  shortSummary: '',
  description: '',
  variantLabel: 'Select Finish',
  variants: [
    {
      id: 'standard-edition',
      label: 'Standard Edition',
      sublabel: 'Fine & Medium Japanese Steel Nib',
      swatchHex: '#125A66',
      image: '/assets/prera/empress_teal_1.jpg',
      stockCount: 12,
    },
  ],
  specs: [
    { label: 'Origin', value: 'Made in Japan' },
    { label: 'Dispatch', value: 'Same-Day Nairobi Courier' },
  ],
  includedItems: ['Fountain Pen', 'Pilot Ink Cartridge', 'Presentation Box'],
};

export const MerchantAdminIsland: React.FC<MerchantAdminIslandProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onResetCatalogToDefaults,
  onSyncAllProductsToFirestore,
  storeSettings,
  onUpdateStoreSettings,
  promoCodes,
  onSavePromoCode,
  onTogglePromoCodeActive,
  onDeletePromoCode,
  orders,
  onUpdateOrderStatusByNumber,
  firebaseAdminEmail,
  isAuthorizedAdmin,
  isSigningIn,
  onGoogleSignIn,
  onSignOut,
  cloudSyncStatus,
}) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'analytics' | 'promos' | 'bundles' | 'orders' | 'add-product'
  >('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [draftProduct, setDraftProduct] = useState<Product | null>(null);
  const [newProductDraft, setNewProductDraft] = useState<Product>(DEFAULT_NEW_PRODUCT);
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>(storeSettings);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetCatalog, setConfirmResetCatalog] = useState(false);

  // Promo Voucher creation state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState<number>(10);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState<number>(5000);
  const [newPromoDescription, setNewPromoDescription] = useState('');

  useEffect(() => {
    setSettingsDraft(storeSettings);
  }, [storeSettings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Analytics & Inventory calculations
  const analyticsData = useMemo(() => {
    const totalRevenueKes = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValueKes = orders.length > 0 ? Math.round(totalRevenueKes / orders.length) : 0;

    // Low stock variants across catalog
    const lowStockVariants: {
      productId: string;
      productName: string;
      variant: ProductVariant;
      stockCount: number;
    }[] = [];
    let totalUnitsInStock = 0;

    products.forEach((product) => {
      product.variants.forEach((v) => {
        const count = typeof v.stockCount === 'number' ? v.stockCount : 10;
        totalUnitsInStock += count;
        if (count <= 3) {
          lowStockVariants.push({
            productId: product.id,
            productName: product.name,
            variant: v,
            stockCount: count,
          });
        }
      });
    });

    // Top-selling products / shades from order history
    const productSalesMap = new Map<string, { name: string; units: number; revenueKes: number }>();
    let fineNibCount = 0;
    let mediumNibCount = 0;

    orders.forEach((o) => {
      if (o.items && o.items.length > 0) {
        o.items.forEach((item) => {
          const key = `${item.productName} (${item.variantLabel.split(' · ')[0]})`;
          const existing = productSalesMap.get(key) || { name: key, units: 0, revenueKes: 0 };
          existing.units += item.quantity;
          existing.revenueKes += item.priceKes * item.quantity;
          productSalesMap.set(key, existing);

          if (item.nibSize?.toLowerCase().includes('fine')) fineNibCount += item.quantity;
          if (item.nibSize?.toLowerCase().includes('medium')) mediumNibCount += item.quantity;
        });
      }
    });

    const topSellingItems = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenueKes - a.revenueKes)
      .slice(0, 6);

    // County / City distribution
    const countyMap = new Map<string, { county: string; orders: number; revenueKes: number }>();
    orders.forEach((o) => {
      const c = o.city || 'Nairobi';
      const existing = countyMap.get(c) || { county: c, orders: 0, revenueKes: 0 };
      existing.orders += 1;
      existing.revenueKes += o.total || 0;
      countyMap.set(c, existing);
    });
    const countyBreakdown = Array.from(countyMap.values()).sort((a, b) => b.revenueKes - a.revenueKes);

    // Payment method split
    const paymentCounts = {
      mpesa: orders.filter((o) => o.paymentMethod === 'mpesa').length,
      whatsapp: orders.filter((o) => o.paymentMethod === 'whatsapp').length,
      cod: orders.filter((o) => o.paymentMethod === 'cod').length,
    };

    return {
      totalRevenueKes,
      avgOrderValueKes,
      totalUnitsInStock,
      lowStockVariants,
      topSellingItems,
      fineNibCount,
      mediumNibCount,
      countyBreakdown,
      paymentCounts,
    };
  }, [orders, products]);

  if (!isOpen) return null;

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#DCD5C7] overflow-hidden z-10">
          <div className="bg-[#0A2246] text-white px-6 py-5 flex items-center justify-between border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C88A2E]/20 border border-[#C88A2E]/50 flex items-center justify-center text-[#E5B25D]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-display text-lg font-semibold tracking-tight">
                  Merchant Staff Portal
                </h2>
                <p className="text-[11px] text-white/75">
                  PENS R US Kenya · Restricted Back-Office Access
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {!firebaseAdminEmail ? (
              <>
                <div className="p-4 rounded-xl bg-white border border-[#E6E1D8] space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0A2246]">
                    <ShieldCheck className="w-4 h-4 text-[#C88A2E]" />
                    Administrator Verification Required
                  </span>
                  <p className="text-xs text-[#5C5852] leading-relaxed">
                    Access to the Merchant Inventory Studio, KES Pricing Controls, Promo Vouchers, and Customer Order Dispatch is strictly restricted to verified PENS R US administrators.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={onGoogleSignIn}
                    className="w-full py-3 px-4 rounded-xl bg-[#0A2246] hover:bg-[#133468] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E5B25D]" />
                    <span>
                      {isSigningIn
                        ? 'Verifying Google Credentials...'
                        : 'Sign In with Authorized Google Account'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#DCD5C7] bg-white hover:bg-[#F3EFE6] text-[#3F3D39] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Return to Storefront
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Access Denied · Unauthorized Account</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    You are currently signed in as{' '}
                    <span className="font-mono font-semibold">{firebaseAdminEmail}</span>, which does not have Merchant Administrator permissions for PENS R US Kenya.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={onGoogleSignIn}
                    className="w-full py-3 px-4 rounded-xl bg-[#0A2246] hover:bg-[#133468] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E5B25D]" />
                    <span>
                      {isSigningIn ? 'Switching Account...' : 'Switch to Authorized Admin Account'}
                    </span>
                  </button>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Sign Out ({firebaseAdminEmail})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#DCD5C7] bg-white hover:bg-[#F3EFE6] text-[#3F3D39] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Return to Storefront
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setDraftProduct(JSON.parse(JSON.stringify(product)));
  };

  const handleQuickPriceChange = async (product: Product, newPriceKes: number) => {
    if (isNaN(newPriceKes) || newPriceKes < 0) return;
    setSavingId(product.id);
    try {
      await onUpdateProduct({ ...product, priceKes: newPriceKes });
      showToast(`Updated ${product.name} price to KES ${newPriceKes.toLocaleString()}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleVariantStockCountChange = async (
    product: Product,
    variantId: string,
    newStockCount: number
  ) => {
    const clamped = Math.max(0, Math.round(newStockCount));
    const updatedVariants = product.variants.map((v) =>
      v.id === variantId ? { ...v, stockCount: clamped } : v
    );
    setSavingId(`${product.id}-${variantId}`);
    try {
      await onUpdateProduct({ ...product, variants: updatedVariants });
      showToast(
        `Updated stock for ${product.name} (${variantId}) to ${clamped} ${
          clamped === 1 ? 'unit' : 'units'
        }`
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveDraftProduct = async () => {
    if (!draftProduct) return;
    setSavingId(draftProduct.id);
    try {
      await onUpdateProduct(draftProduct);
      setEditingProductId(null);
      setDraftProduct(null);
      showToast(`Saved changes to ${draftProduct.name}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductDraft.name.trim()) return;
    const slugId =
      newProductDraft.id.trim() ||
      newProductDraft.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const finalProduct: Product = {
      ...newProductDraft,
      id: slugId,
      variants: newProductDraft.variants.map((v, idx) => ({
        ...v,
        id:
          v.id.trim() ||
          v.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') ||
          `variant-${idx + 1}`,
        stockCount: typeof v.stockCount === 'number' ? v.stockCount : 12,
      })),
    };

    setSavingId('new-product');
    try {
      await onAddProduct(finalProduct);
      setNewProductDraft(DEFAULT_NEW_PRODUCT);
      setActiveTab('products');
      showToast(`Added "${finalProduct.name}" to storefront catalog`);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveBundleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingId('settings');
    try {
      await onUpdateStoreSettings(settingsDraft);
      showToast('Updated Ink Mixing Set bundle price, WhatsApp Concierge & free delivery threshold');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCode = newPromoCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanedCode) return;

    const promoRecord: PromoCodeRecord = {
      id: cleanedCode.toLowerCase(),
      code: cleanedCode,
      discountType: newPromoType,
      discountValue: Math.max(1, Number(newPromoValue) || 10),
      minSpendKes: Math.max(0, Number(newPromoMinSpend) || 0),
      description:
        newPromoDescription.trim() ||
        (newPromoType === 'percentage'
          ? `${newPromoValue}% off orders from KES ${Number(newPromoMinSpend).toLocaleString()}`
          : `KES ${Number(newPromoValue).toLocaleString()} off orders from KES ${Number(newPromoMinSpend).toLocaleString()}`),
      active: true,
      updatedAt: Date.now(),
    };

    setSavingId(`promo-${promoRecord.id}`);
    try {
      await onSavePromoCode(promoRecord);
      setNewPromoCode('');
      setNewPromoDescription('');
      showToast(`Saved & activated promo code ${promoRecord.code}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-zinc-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#DCD5C7] flex flex-col overflow-hidden z-10">
        {/* Top Header */}
        <div className="bg-[#0A2246] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/15">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#C88A2E]/20 border border-[#C88A2E]/50 flex items-center justify-center text-[#E5B25D]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif-display text-xl font-semibold tracking-tight">
                  Merchant Back-Office &amp; Inventory Studio
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                    firebaseAdminEmail
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/60'
                      : 'bg-amber-950/90 text-amber-200 border border-amber-700/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {firebaseAdminEmail
                    ? `Cloud Sync Active (${firebaseAdminEmail})`
                    : 'Local Preview Mode · Sign in with Google for Cloud Sync'}
                </span>
              </div>
              <p className="text-xs text-white/75 mt-0.5">
                Edit KES prices, per-variant stock counts, promo vouchers, analytics, and WhatsApp/M-Pesa orders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!firebaseAdminEmail ? (
              <button
                type="button"
                disabled={isSigningIn}
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#C88A2E] hover:bg-[#B57B24] text-white transition-colors cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Signing in...' : 'Sign In for Cloud Sync'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setSavingId('sync-all');
                  try {
                    await onSyncAllProductsToFirestore();
                    showToast('Synced all products & settings to Cloud Firestore');
                  } finally {
                    setSavingId(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{savingId === 'sync-all' ? 'Syncing...' : 'Push All to Cloud'}</span>
              </button>
            )}

            {confirmResetCatalog ? (
              <div className="flex items-center gap-1.5 bg-black/40 border border-amber-400/50 rounded-lg px-2.5 py-1">
                <span className="text-[11px] text-amber-200 font-semibold">Reset catalog &amp; prices?</span>
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmResetCatalog(false);
                    setSavingId('reset');
                    try {
                      await onResetCatalogToDefaults();
                      showToast('Catalog restored to default Nairobi inventory & updated KES prices');
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  className="text-[11px] font-bold px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-500 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetCatalog(false)}
                  className="text-[11px] font-semibold px-2 py-1 rounded text-white/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetCatalog(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Restore default catalog products & updated KES prices"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${savingId === 'reset' ? 'animate-spin' : ''}`} />
                <span>Restore Defaults</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="bg-white border-b border-[#E6E1D8] px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C88A2E]" />
              <span>Products &amp; Stock ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#C88A2E]" />
              <span>Analytics &amp; Low Stock</span>
              {analyticsData.lowStockVariants.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-900 font-bold">
                  {analyticsData.lowStockVariants.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promos')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'promos'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <TicketPercent className="w-4 h-4 text-[#C88A2E]" />
              <span>Promo Vouchers ({promoCodes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bundles')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'bundles'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C88A2E]" />
              <span>Bundles &amp; WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C88A2E]" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add-product')}
              className={`inline-flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'add-product'
                  ? 'border-[#0A2246] text-[#0A2246]'
                  : 'border-transparent text-[#6E6A63] hover:text-[#171614]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#C88A2E]" />
              <span>Add New Product</span>
            </button>
          </div>

          {(toastMessage || cloudSyncStatus) && (
            <div className="my-2 inline-flex items-center gap-2 bg-[#1D5B43] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage || cloudSyncStatus}</span>
            </div>
          )}
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRODUCTS, PRICES & PER-VARIANT STOCK COUNTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {products.map((product) => {
                const isEditing = editingProductId === product.id && draftProduct;
                const totalProductUnits = product.variants.reduce(
                  (sum, v) => sum + (typeof v.stockCount === 'number' ? v.stockCount : 10),
                  0
                );

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-[#E6E1D8] shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Summary Row */}
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <img
                          src={resolveAssetUrl(product.variants[0]?.image || product.image)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-contain bg-white border border-[#E6E1D8] p-1 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B58435]">
                              {product.category}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-[11px] font-medium text-[#6E6A63]">
                              {product.Origin}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {totalProductUnits} total units in stock
                            </span>
                          </div>
                          <h3 className="font-serif-display text-xl font-semibold text-[#0A2246] mt-0.5">
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#5C5852] line-clamp-1 mt-0.5 max-w-xl">
                            {product.shortSummary}
                          </p>
                        </div>
                      </div>

                      {/* Quick Price Editor & Actions */}
                      <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                        <div className="flex items-center bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg px-3 py-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#B58435] mr-2" />
                          <span className="text-xs font-bold text-[#6E6A63] mr-1.5">KES</span>
                          <input
                            type="number"
                            defaultValue={product.priceKes}
                            key={`${product.id}-${product.priceKes}`}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== product.priceKes) {
                                handleQuickPriceChange(product, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-24 font-mono-tabular text-sm font-bold text-[#0A2246] bg-transparent focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            isEditing ? setEditingProductId(null) : startEditingProduct(product)
                          }
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors cursor-pointer ${
                            isEditing
                              ? 'bg-[#0A2246] text-white border-[#0A2246]'
                              : 'bg-white text-[#171614] border-[#DCD5C7] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Close Editor' : 'Edit Details & Variants'}</span>
                        </button>

                        {confirmDeleteId === product.id ? (
                          <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                            <span className="text-[11px] text-rose-800 font-semibold px-1">Delete?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(null);
                                onDeleteProduct(product.id);
                              }}
                              className="text-[11px] font-bold px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[11px] font-semibold px-1.5 py-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove product from catalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Per-Variant Stock Count Controls */}
                    <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E6E1D8]">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A63]">
                          Per-Variant Stock Count ({product.variants.length} Variants · Auto-Deducted on Order):
                        </span>
                        <span className="text-[11px] text-[#6E6A63]">
                          Low-stock badge triggers at ≤ 3 units
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                        {product.variants.map((v) => {
                          const count = typeof v.stockCount === 'number' ? v.stockCount : 10;
                          const isLowStock = count > 0 && count <= 3;
                          const isOut = count === 0;

                          return (
                            <div
                              key={v.id}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                                isOut
                                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                                  : isLowStock
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                                  : 'bg-white border-[#E6E1D8] text-[#171614]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                                  style={{ backgroundColor: v.swatchHex || '#0A2246' }}
                                />
                                <div className="truncate">
                                  <p className="font-semibold truncate">{v.label.split(' · ')[0]}</p>
                                  <p className="text-[10px] text-[#6E6A63]">
                                    {isOut
                                      ? 'Sold Out (0 left)'
                                      : isLowStock
                                      ? `Low Stock · Only ${count} left`
                                      : `${count} units in stock`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVariantStockCountChange(product, v.id, Math.max(0, count - 1))
                                  }
                                  className="w-6 h-6 rounded bg-[#F3EFE8] hover:bg-[#E6E1D8] text-[#171614] font-bold flex items-center justify-center cursor-pointer"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={count}
                                  key={`${product.id}-${v.id}-${count}`}
                                  onBlur={(e) => {
                                    const nextVal = Number(e.target.value);
                                    if (!isNaN(nextVal) && nextVal !== count) {
                                      handleVariantStockCountChange(product, v.id, nextVal);
                                    }
                                  }}
                                  className="w-11 text-center font-mono-tabular font-bold text-xs bg-white border border-[#DCD5C7] rounded py-0.5 focus:outline-none focus:border-[#0A2246]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantStockCountChange(product, v.id, count + 1)}
                                  className="w-6 h-6 rounded bg-[#F3EFE8] hover:bg-[#E6E1D8] text-[#171614] font-bold flex items-center justify-center cursor-pointer"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVariantStockCountChange(product, v.id, isOut ? 10 : 0)
                                  }
                                  className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                    isOut
                                      ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                                  }`}
                                  title={isOut ? 'Restock to 10 units' : 'Mark Sold Out (0)'}
                                >
                                  {isOut ? 'Restock' : 'Out'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded Product & Variant Editor */}
                    {isEditing && draftProduct && (
                      <div className="p-6 bg-[#F3EFE8] border-t border-[#DCD5C7] space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                              Product Name
                            </label>
                            <input
                              type="text"
                              value={draftProduct.name}
                              onChange={(e) =>
                                setDraftProduct({ ...draftProduct, name: e.target.value })
                              }
                              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                              Japanese Subtitle / Edition
                            </label>
                            <input
                              type="text"
                              value={draftProduct.japaneseTitle}
                              onChange={(e) =>
                                setDraftProduct({ ...draftProduct, japaneseTitle: e.target.value })
                              }
                              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                                Price (KES)
                              </label>
                              <input
                                type="number"
                                value={draftProduct.priceKes}
                                onChange={(e) =>
                                  setDraftProduct({
                                    ...draftProduct,
                                    priceKes: Number(e.target.value),
                                  })
                                }
                                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                                Availability
                              </label>
                              <input
                                type="text"
                                value={draftProduct.availability}
                                onChange={(e) =>
                                  setDraftProduct({ ...draftProduct, availability: e.target.value })
                                }
                                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                              Short Card Summary
                            </label>
                            <textarea
                              rows={2}
                              value={draftProduct.shortSummary}
                              onChange={(e) =>
                                setDraftProduct({
                                  ...draftProduct,
                                  shortSummary: e.target.value,
                                })
                              }
                              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                              Full Editorial Description
                            </label>
                            <textarea
                              rows={2}
                              value={draftProduct.description}
                              onChange={(e) =>
                                setDraftProduct({
                                  ...draftProduct,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#DCD5C7] text-sm"
                            />
                          </div>
                        </div>

                        {/* Variants Manager */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2246] flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-[#C88A2E]" />
                              <span>Finishes / Shades &amp; Stock Units ({draftProduct.variants.length})</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                const newVar: ProductVariant = {
                                  id: `edition-${Date.now()}`,
                                  label: 'New Shade / Finish',
                                  sublabel: 'Limited Nairobi Atelier Edition',
                                  swatchHex: '#1D4ED8',
                                  image: draftProduct.variants[0]?.image || draftProduct.image,
                                  stockCount: 10,
                                };
                                setDraftProduct({
                                  ...draftProduct,
                                  variants: [...draftProduct.variants, newVar],
                                });
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A2246] hover:text-[#C88A2E] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Variant</span>
                            </button>
                          </div>

                          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                            {draftProduct.variants.map((variant, idx) => (
                              <div
                                key={variant.id || idx}
                                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-[#E6E1D8]"
                              >
                                <div className="md:col-span-3">
                                  <label className="block text-[10px] font-bold uppercase text-[#6E6A63]">
                                    Variant Label
                                  </label>
                                  <input
                                    type="text"
                                    value={variant.label}
                                    onChange={(e) => {
                                      const updated = [...draftProduct.variants];
                                      updated[idx] = { ...variant, label: e.target.value };
                                      setDraftProduct({ ...draftProduct, variants: updated });
                                    }}
                                    className="w-full text-xs font-semibold text-[#171614] border-b border-[#E6E1D8] py-1 focus:outline-none"
                                  />
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-[10px] font-bold uppercase text-[#6E6A63]">
                                    Sublabel / Notes
                                  </label>
                                  <input
                                    type="text"
                                    value={variant.sublabel}
                                    onChange={(e) => {
                                      const updated = [...draftProduct.variants];
                                      updated[idx] = { ...variant, sublabel: e.target.value };
                                      setDraftProduct({ ...draftProduct, variants: updated });
                                    }}
                                    className="w-full text-xs text-[#5C5852] border-b border-[#E6E1D8] py-1 focus:outline-none"
                                  />
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-[10px] font-bold uppercase text-[#6E6A63]">
                                    Image Path / URL
                                  </label>
                                  <input
                                    type="text"
                                    value={variant.image || ''}
                                    onChange={(e) => {
                                      const updated = [...draftProduct.variants];
                                      updated[idx] = { ...variant, image: e.target.value };
                                      setDraftProduct({ ...draftProduct, variants: updated });
                                    }}
                                    className="w-full text-xs text-[#5C5852] border-b border-[#E6E1D8] py-1 focus:outline-none"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-[10px] font-bold uppercase text-[#6E6A63]">
                                    Stock Count
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={typeof variant.stockCount === 'number' ? variant.stockCount : 10}
                                    onChange={(e) => {
                                      const count = Math.max(0, Number(e.target.value) || 0);
                                      const updated = [...draftProduct.variants];
                                      updated[idx] = { ...variant, stockCount: count };
                                      setDraftProduct({ ...draftProduct, variants: updated });
                                    }}
                                    className="w-20 text-xs font-mono-tabular font-bold text-[#0A2246] border-b border-[#E6E1D8] py-1 focus:outline-none"
                                  />
                                </div>

                                <div className="md:col-span-1 flex items-center justify-end">
                                  {draftProduct.variants.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = draftProduct.variants.filter(
                                          (_, i) => i !== idx
                                        );
                                        setDraftProduct({ ...draftProduct, variants: updated });
                                      }}
                                      className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setDraftProduct(null);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5C5852] hover:bg-[#E6E1D8] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveDraftProduct}
                            disabled={savingId === draftProduct.id}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A2246] hover:bg-[#133468] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingId === draftProduct.id ? 'Saving...' : 'Save Product Changes'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ANALYTICS, REVENUE & LOW-STOCK INVENTORY INSIGHTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#E6E1D8]">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6E6A63]">
                    <span>Total Store Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="font-serif-display text-2xl font-bold text-[#0A2246] mt-2">
                    KES {analyticsData.totalRevenueKes.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#6E6A63] mt-1">
                    Across {orders.length} recorded {orders.length === 1 ? 'order' : 'orders'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E6E1D8]">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6E6A63]">
                    <span>Average Order Value</span>
                    <ArrowUpRight className="w-4 h-4 text-[#C88A2E]" />
                  </div>
                  <p className="font-serif-display text-2xl font-bold text-[#0A2246] mt-2">
                    KES {analyticsData.avgOrderValueKes.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#6E6A63] mt-1">
                    M-Pesa ({analyticsData.paymentCounts.mpesa}) • WhatsApp (
                    {analyticsData.paymentCounts.whatsapp}) • COD ({analyticsData.paymentCounts.cod})
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E6E1D8]">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6E6A63]">
                    <span>Total Catalog Units</span>
                    <Boxes className="w-4 h-4 text-[#0A2246]" />
                  </div>
                  <p className="font-serif-display text-2xl font-bold text-[#0A2246] mt-2">
                    {analyticsData.totalUnitsInStock} units
                  </p>
                  <p className="text-xs text-[#6E6A63] mt-1">
                    Fine (F): {analyticsData.fineNibCount} sold • Medium (M):{' '}
                    {analyticsData.mediumNibCount} sold
                  </p>
                </div>

                <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-300">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-900">
                    <span>Low-Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="font-serif-display text-2xl font-bold text-amber-950 mt-2">
                    {analyticsData.lowStockVariants.length} variants
                  </p>
                  <p className="text-xs text-amber-900/80 mt-1">
                    Variants with ≤ 3 units or Sold Out
                  </p>
                </div>
              </div>

              {/* Low-Stock Action Table */}
              <div className="bg-white rounded-xl border border-[#E6E1D8] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif-display text-xl font-semibold text-[#0A2246]">
                      Low-Stock &amp; Restock Watchlist
                    </h3>
                    <p className="text-xs text-[#6E6A63]">
                      Variants with 3 or fewer bottles/pens remaining in Nairobi inventory. Click +5 or +10 to restock immediately.
                    </p>
                  </div>
                </div>

                {analyticsData.lowStockVariants.length === 0 ? (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-4 font-medium">
                    All product variants are well stocked (above 3 units each).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analyticsData.lowStockVariants.map(({ productId, productName, variant, stockCount }) => {
                      const parentProduct = products.find((p) => p.id === productId);
                      return (
                        <div
                          key={`${productId}-${variant.id}`}
                          className="flex items-center justify-between p-3.5 rounded-lg border border-amber-200 bg-amber-50/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: variant.swatchHex || '#0A2246' }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0A2246] truncate">{productName}</p>
                              <p className="text-xs text-[#5C5852] truncate">
                                {variant.label.split(' · ')[0]} —{' '}
                                <span
                                  className={
                                    stockCount === 0
                                      ? 'font-bold text-rose-600'
                                      : 'font-bold text-amber-800'
                                  }
                                >
                                  {stockCount === 0 ? 'SOLD OUT (0)' : `Only ${stockCount} left`}
                                </span>
                              </p>
                            </div>
                          </div>

                          {parentProduct && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleVariantStockCountChange(
                                    parentProduct,
                                    variant.id,
                                    stockCount + 5
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-[#0A2246] hover:bg-[#133468] text-white text-[11px] font-bold cursor-pointer"
                              >
                                +5 Units
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleVariantStockCountChange(
                                    parentProduct,
                                    variant.id,
                                    stockCount + 10
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                              >
                                +10 Units
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top-Selling Products & County Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-[#E6E1D8] p-6">
                  <h3 className="font-serif-display text-xl font-semibold text-[#0A2246] mb-1">
                    Best-Selling Editions &amp; Ink Shades
                  </h3>
                  <p className="text-xs text-[#6E6A63] mb-4">
                    Ranked by cumulative revenue across customer orders.
                  </p>
                  {analyticsData.topSellingItems.length === 0 ? (
                    <p className="text-xs text-[#6E6A63] py-6 text-center">
                      No item velocity data yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.topSellingItems.map((item, idx) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-xs border-b border-[#ECE8DF] pb-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#F3EFE8] text-[#0A2246] font-bold flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-[#171614] truncate">{item.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono-tabular font-bold text-[#0A2246]">
                              KES {item.revenueKes.toLocaleString()}
                            </span>
                            <span className="text-[#6E6A63] ml-2">({item.units} sold)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-[#E6E1D8] p-6">
                  <h3 className="font-serif-display text-xl font-semibold text-[#0A2246] mb-1">
                    Regional Dispatch Breakdown (Kenya)
                  </h3>
                  <p className="text-xs text-[#6E6A63] mb-4">
                    Order volume and revenue by Kenyan delivery region.
                  </p>
                  {analyticsData.countyBreakdown.length === 0 ? (
                    <p className="text-xs text-[#6E6A63] py-6 text-center">
                      No regional dispatch data recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.countyBreakdown.map((c) => (
                        <div
                          key={c.county}
                          className="flex items-center justify-between text-xs border-b border-[#ECE8DF] pb-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span className="font-semibold text-[#171614]">{c.county}</span>
                          </div>
                          <div>
                            <span className="font-mono-tabular font-bold text-[#0A2246]">
                              KES {c.revenueKes.toLocaleString()}
                            </span>
                            <span className="text-[#6E6A63] ml-2">
                              ({c.orders} {c.orders === 1 ? 'order' : 'orders'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROMO VOUCHERS & DISCOUNT CODES */}
          {activeTab === 'promos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Create Promo Form */}
              <form
                onSubmit={handleCreatePromoSubmit}
                className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E6E1D8] space-y-4 h-fit"
              >
                <div className="border-b border-[#ECE8DF] pb-3">
                  <h3 className="font-serif-display text-xl font-semibold text-[#0A2246] flex items-center gap-2">
                    <TicketPercent className="w-5 h-5 text-[#C88A2E]" />
                    <span>Create Promo Voucher</span>
                  </h3>
                  <p className="text-xs text-[#6E6A63] mt-0.5">
                    Create percentage (%) or fixed KES discount codes synced with Firestore `/promo_codes`.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                    Voucher Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NAIROBI10 or KAKUNO500"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm font-mono-tabular font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                      Discount Type
                    </label>
                    <select
                      value={newPromoType}
                      onChange={(e) =>
                        setNewPromoType(e.target.value as 'percentage' | 'fixed')
                      }
                      className="w-full px-3 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-xs font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (KES)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                      {newPromoType === 'percentage' ? 'Discount (%)' : 'Discount (KES)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={newPromoType === 'percentage' ? 90 : 50000}
                      value={newPromoValue}
                      onChange={(e) => setNewPromoValue(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                    Minimum Cart Spend (KES)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newPromoMinSpend}
                    onChange={(e) => setNewPromoMinSpend(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1">
                    Customer Note / Description
                  </label>
                  <input
                    type="text"
                    value={newPromoDescription}
                    onChange={(e) => setNewPromoDescription(e.target.value)}
                    placeholder="e.g. 10% off Collector orders above KES 5,000"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingId?.startsWith('promo-')}
                  className="w-full py-3 rounded-xl bg-[#0A2246] hover:bg-[#133468] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save &amp; Activate Voucher
                </button>
              </form>

              {/* Existing Promo Codes List */}
              <div className="lg:col-span-7 space-y-3">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className={`bg-white p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      promo.active ? 'border-[#E6E1D8]' : 'border-[#E6E1D8] opacity-65 bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono-tabular text-sm font-bold px-3 py-1 rounded-md bg-amber-50 text-amber-950 border border-amber-300">
                          {promo.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}% OFF`
                            : `KES ${promo.discountValue.toLocaleString()} OFF`}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            promo.active
                              ? 'bg-[#1D5B43] text-white'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {promo.active ? 'Active' : 'Expired / Paused'}
                        </span>
                      </div>
                      <p className="text-xs text-[#3F3D39] mt-1.5">{promo.description}</p>
                      <p className="text-[11px] text-[#6E6A63] mt-0.5">
                        Minimum Spend: KES {promo.minSpendKes.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onTogglePromoCodeActive(promo.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          promo.active
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-600'
                        }`}
                      >
                        {promo.active ? 'Pause / Expire' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePromoCode(promo.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUNDLES, WHATSAPP CONCIERGE & SHIPPING SETTINGS */}
          {activeTab === 'bundles' && (
            <form
              onSubmit={handleSaveBundleSettings}
              className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#E6E1D8] space-y-6"
            >
              <div className="border-b border-[#ECE8DF] pb-4">
                <h3 className="font-serif-display text-2xl font-semibold text-[#0A2246]">
                  Bundle Offers, WhatsApp Concierge &amp; Free Delivery Threshold
                </h3>
                <p className="text-xs text-[#6E6A63] mt-1">
                  Configure your 3-Bottle Iroshizuku Ink Mixing Set price, Free Delivery threshold, and WhatsApp Concierge phone number.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2246] mb-1">
                    3-Bottle Iroshizuku Ink Bundle Price (KES)
                  </label>
                  <p className="text-[11px] text-[#6E6A63] mb-3">
                    Standard price for 3 bottles is KES 18,000 (3 × KES 6,000). Default 10% privilege bundle is KES 16,200.
                  </p>
                  <input
                    type="number"
                    value={settingsDraft.inkMixingSetBundleKes}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        inkMixingSetBundleKes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#DCD5C7] text-base font-mono-tabular font-bold text-[#0A2246]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2246] mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#C88A2E]" />
                    <span>Complimentary Kenya Delivery Threshold (KES)</span>
                  </label>
                  <p className="text-[11px] text-[#6E6A63] mb-3">
                    Orders meeting or exceeding this amount receive free courier delivery nationwide.
                  </p>
                  <input
                    type="number"
                    value={settingsDraft.freeDeliveryThresholdKes}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        freeDeliveryThresholdKes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#DCD5C7] text-base font-mono-tabular font-bold text-[#0A2246]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2246] mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Concierge Phone Number (International Format without +)</span>
                </label>
                <p className="text-[11px] text-[#6E6A63] mb-2.5">
                  Used for the Checkout WhatsApp Order Concierge link (`https://wa.me/...`).
                </p>
                <input
                  type="text"
                  value={settingsDraft.whatsappConciergePhone || '254700000000'}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      whatsappConciergePhone: e.target.value.replace(/[^0-9]/g, ''),
                    })
                  }
                  placeholder="254700000000"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#DCD5C7] text-sm font-mono-tabular font-bold text-[#0A2246]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingId === 'settings'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A2246] hover:bg-[#133468] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingId === 'settings' ? 'Saving...' : 'Save Storefront Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-[#E6E1D8] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#0A2246]">
                    Customer Orders &amp; Dispatch Queue
                  </h3>
                  <p className="text-xs text-[#6E6A63]">
                    View M-Pesa Express, WhatsApp Concierge, and Cash-on-Delivery orders across Kenya.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F3EFE8] text-[#0A2246]">
                  {orders.length} Total Orders
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-[#E6E1D8] text-center">
                  <ShoppingBag className="w-8 h-8 text-[#9E988E] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#171614]">No orders placed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id || order.orderNumber}
                      className="bg-white p-5 rounded-xl border border-[#E6E1D8] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono-tabular text-sm font-bold text-[#0A2246]">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-[#8C857B]">•</span>
                          <span className="text-xs text-[#6E6A63]">{order.timestamp}</span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                              order.paymentMethod === 'mpesa'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : order.paymentMethod === 'whatsapp'
                                ? 'bg-green-50 text-green-800 border border-green-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {order.paymentMethod === 'mpesa'
                              ? 'M-Pesa Express'
                              : order.paymentMethod === 'whatsapp'
                              ? 'WhatsApp Concierge'
                              : 'Cash on Delivery'}
                          </span>
                          {order.promoCode && (
                            <span className="text-[11px] font-mono-tabular font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                              Promo: {order.promoCode} (-KES{' '}
                              {(order.promoDiscountKes || 0).toLocaleString()})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#3F3D39] font-medium flex flex-wrap items-center gap-3 mt-1">
                          <span>
                            {order.customerName} ({order.phone})
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#6E6A63]">
                            <MapPin className="w-3 h-3 text-[#C88A2E]" />
                            {order.city} — {order.address}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 self-end lg:self-center">
                        <div className="text-right">
                          <div className="text-xs text-[#6E6A63]">{order.itemsCount} items</div>
                          <div className="font-mono-tabular text-base font-bold text-[#0A2246]">
                            KES {order.total.toLocaleString()}
                          </div>
                        </div>

                        <select
                          value={order.orderStatus || 'Processing'}
                          onChange={(e) => {
                            const newStatus = e.target.value as
                              | 'Processing'
                              | 'Out for Courier'
                              | 'Delivered';
                            onUpdateOrderStatusByNumber(order.orderNumber, newStatus);
                            showToast(`Order ${order.orderNumber} marked as ${newStatus}`);
                          }}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border cursor-pointer ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : order.orderStatus === 'Out for Courier'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Out for Courier">Out for Courier</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ADD NEW PRODUCT */}
          {activeTab === 'add-product' && (
            <form
              onSubmit={handleCreateNewProduct}
              className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#E6E1D8] space-y-6"
            >
              <div className="border-b border-[#ECE8DF] pb-4">
                <h3 className="font-serif-display text-2xl font-semibold text-[#0A2246]">
                  Add New Pen, Ink, or Accessory to Storefront
                </h3>
                <p className="text-xs text-[#6E6A63] mt-1">
                  New products appear immediately in the storefront catalog and sync to Cloud Firestore.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductDraft.name}
                    onChange={(e) =>
                      setNewProductDraft({ ...newProductDraft, name: e.target.value })
                    }
                    placeholder="e.g. Pilot Metropolitan Classic"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductDraft.priceKes}
                    onChange={(e) =>
                      setNewProductDraft({
                        ...newProductDraft,
                        priceKes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                    Category
                  </label>
                  <select
                    value={newProductDraft.category}
                    onChange={(e) =>
                      setNewProductDraft({
                        ...newProductDraft,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                  >
                    <option value="Fountain Pens">Fountain Pens</option>
                    <option value="Bottled Inks">Bottled Inks</option>
                    <option value="Converters & Refills">Converters &amp; Refills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                    Japanese Subtitle
                  </label>
                  <input
                    type="text"
                    value={newProductDraft.japaneseTitle}
                    onChange={(e) =>
                      setNewProductDraft({ ...newProductDraft, japaneseTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                    Availability
                  </label>
                  <input
                    type="text"
                    value={newProductDraft.availability}
                    onChange={(e) =>
                      setNewProductDraft({ ...newProductDraft, availability: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                  Short Card Summary *
                </label>
                <input
                  type="text"
                  required
                  value={newProductDraft.shortSummary}
                  onChange={(e) =>
                    setNewProductDraft({
                      ...newProductDraft,
                      shortSummary: e.target.value,
                    })
                  }
                  placeholder="Brief summary shown on product cards..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-1.5">
                  Full Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={newProductDraft.description}
                  onChange={(e) =>
                    setNewProductDraft({
                      ...newProductDraft,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed craftsmanship notes and story..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#DCD5C7] text-sm"
                />
              </div>

              {/* Initial Variant */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2246] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#C88A2E]" />
                  <span>Primary Variant &amp; Photo</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6A63] mb-1">
                      Finish / Color Name
                    </label>
                    <input
                      type="text"
                      value={newProductDraft.variants[0]?.label || ''}
                      onChange={(e) => {
                        const v = [...newProductDraft.variants];
                        v[0] = { ...v[0], label: e.target.value };
                        setNewProductDraft({ ...newProductDraft, variants: v });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DCD5C7] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6A63] mb-1">
                      Swatch Hex Color
                    </label>
                    <input
                      type="text"
                      value={newProductDraft.variants[0]?.swatchHex || '#125A66'}
                      onChange={(e) => {
                        const v = [...newProductDraft.variants];
                        v[0] = { ...v[0], swatchHex: e.target.value };
                        setNewProductDraft({ ...newProductDraft, variants: v });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DCD5C7] text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6A63] mb-1">
                      Initial Stock Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newProductDraft.variants[0]?.stockCount ?? 12}
                      onChange={(e) => {
                        const count = Math.max(0, Number(e.target.value) || 0);
                        const v = [...newProductDraft.variants];
                        v[0] = { ...v[0], stockCount: count };
                        setNewProductDraft({ ...newProductDraft, variants: v });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DCD5C7] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6A63] mb-1">
                      Image Path or URL
                    </label>
                    <input
                      type="text"
                      value={newProductDraft.variants[0]?.image || ''}
                      onChange={(e) => {
                        const v = [...newProductDraft.variants];
                        v[0] = { ...v[0], image: e.target.value };
                        setNewProductDraft({
                          ...newProductDraft,
                          image: e.target.value,
                          variants: v,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DCD5C7] text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingId === 'new-product'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A2246] hover:bg-[#133468] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingId === 'new-product' ? 'Creating...' : 'Create Product in Catalog'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default MerchantAdminIsland;
