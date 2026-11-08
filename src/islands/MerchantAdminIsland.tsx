import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  RotateCcw,
  Package,
  Truck,
  Tag,
  CloudUpload,
  Edit3,
  Trash2,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { Product, ProductVariant } from '../data/products';
import { OrderStatus } from '../App';
import { resolveAssetUrl } from '../utils/assetResolver';

export interface StoreSettings {
  inkMixingSetBundleKes: number;
  freeDeliveryThresholdKes: number;
}

interface AdminOrderSummary {
  id?: string;
  userId?: string;
  orderNumber: string;
  orderStatus?: OrderStatus;
  trackingCode?: string;
  estimatedDelivery?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: 'mpesa' | 'cod';
  total: number;
  timestamp: string;
  itemsCount: number;
}

interface MerchantAdminIslandProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProduct: (updatedProduct: Product) => Promise<void>;
  onAddProduct: (newProduct: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onResetCatalogToDefaults: () => Promise<void>;
  onSyncAllProductsToFirestore: () => Promise<void>;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (next: StoreSettings) => Promise<void>;
  orders: AdminOrderSummary[];
  onUpdateOrderStatusByNumber: (orderNumber: string, nextStatus: OrderStatus) => void;
  firebaseAdminEmail: string | null;
  isSigningIn: boolean;
  onGoogleSignIn: () => Promise<void>;
  cloudSyncStatus: string | null;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function MerchantAdminIsland({
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
  orders,
  onUpdateOrderStatusByNumber,
  firebaseAdminEmail,
  isSigningIn,
  onGoogleSignIn,
  cloudSyncStatus,
}: MerchantAdminIslandProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'promotions'>(
    'products'
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(
    products[0]?.id || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Quick inline price edits map
  const [inlinePrices, setInlinePrices] = useState<Record<string, string>>({});

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdJapaneseTitle, setNewProdJapaneseTitle] = useState(
    'パイロット 万年筆 · Japanese Writing Instrument'
  );
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>(
    'Fountain Pens'
  );
  const [newProdPriceKes, setNewProdPriceKes] = useState('4500');
  const [newProdAvailability, setNewProdAvailability] = useState('In Stock in Nairobi');
  const [newProdImage, setNewProdImage] = useState('/assets/prera/empress_teal_1.jpg');
  const [newProdHasNib, setNewProdHasNib] = useState(true);
  const [newProdSummary, setNewProdSummary] = useState(
    'Authentic Japanese fountain pen stocked in our Nairobi Atelier with Fine and Medium nib options.'
  );
  const [newVariantLabel, setNewVariantLabel] = useState('Signature Finish');
  const [newVariantSwatch, setNewVariantSwatch] = useState('#163A5F');

  if (!isOpen) return null;

  const selectedProduct =
    products.find((p) => p.id === editingProductId) || products[0] || null;

  const triggerSavedMessage = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => {
      setSavedBanner((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleQuickPriceSave = async (product: Product) => {
    const rawVal = inlinePrices[product.id];
    if (rawVal === undefined) return;
    const parsed = Math.max(0, Math.round(Number(rawVal)));
    if (Number.isNaN(parsed)) return;

    await onUpdateProduct({
      ...product,
      priceKes: parsed,
    });
    triggerSavedMessage(`Updated ${product.name} price to ${formatKes(parsed)}`);
  };

  const handleFieldChange = async <K extends keyof Product>(
    product: Product,
    field: K,
    value: Product[K]
  ) => {
    await onUpdateProduct({
      ...product,
      [field]: value,
    });
  };

  const handleVariantUpdate = async (
    product: Product,
    variantId: string,
    patch: Partial<ProductVariant>
  ) => {
    const nextVariants = product.variants.map((v) =>
      v.id === variantId ? { ...v, ...patch } : v
    );
    await onUpdateProduct({
      ...product,
      variants: nextVariants,
    });
  };

  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const slug =
      'custom-' +
      newProdName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const parsedPrice = Math.max(100, Math.round(Number(newProdPriceKes) || 4500));

    const created: Product = {
      id: slug,
      name: newProdName.trim().toUpperCase(),
      japaneseTitle: newProdJapaneseTitle.trim() || 'Japanese Atelier Collection',
      category: newProdCategory,
      priceKes: parsedPrice,
      image: newProdImage.trim() || '/assets/prera/empress_teal_1.jpg',
      imageFit: 'contain',
      hasNibSelector: newProdHasNib,
      Origin: 'Made in Japan',
      availability: newProdAvailability.trim() || 'In Stock in Nairobi',
      shortSummary: newProdSummary.trim(),
      description: newProdSummary.trim(),
      variantLabel: 'Select Finish',
      variants: [
        {
          id: `${slug}-var-1`,
          label: newVariantLabel.trim() || 'Standard Edition',
          sublabel: newProdSummary.trim(),
          swatchHex: newVariantSwatch,
          image: newProdImage.trim() || '/assets/prera/empress_teal_1.jpg',
        },
      ],
      specs: [
        { label: 'Origin', value: 'Made in Japan · Authorized Nairobi Purveyor' },
        { label: 'Dispatch', value: 'Same-Day Nairobi Courier & Nationwide Express' },
      ],
      includedItems: [
        newProdName.trim(),
        'Official PENS R US Presentation Box',
      ],
    };

    await onAddProduct(created);
    setIsCreatingNew(false);
    setEditingProductId(created.id);
    setNewProdName('');
    triggerSavedMessage(`Added "${created.name}" (${formatKes(parsedPrice)}) to Storefront`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="PENS R US Merchant Admin Back Office"
    >
      <div className="w-full max-w-[1220px] bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Merchant Admin Bar */}
        <div className="px-6 py-4 bg-[#0A2246] text-white flex flex-wrap items-center justify-between gap-4 border-b border-[#C88A2E]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#C88A2E]/20 border border-[#C88A2E]/50 flex items-center justify-center text-[#E5B25D] shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-xl font-semibold tracking-wide text-white">
                  PENS R US · Merchant Admin Console
                </h2>
                <span className="text-xs text-[#E5B25D]">
                  · Shopify-Style Catalog &amp; Pricing Back Office
                </span>
              </div>
              <p className="text-xs text-white/75">
                Edit KES prices, inventory status, variants, and bundles in real time · Backed
                by Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {firebaseAdminEmail ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 border border-white/20 text-xs text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E5B25D]" />
                <span className="truncate max-w-[200px]">{firebaseAdminEmail}</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSigningIn}
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#C88A2E] hover:bg-[#B58435] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Signing In...' : 'Sign In with Google to Sync Cloud'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                await onSyncAllProductsToFirestore();
                triggerSavedMessage('Catalog & Prices synced to Cloud Firestore');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <CloudUpload className="w-3.5 h-3.5 text-[#E5B25D]" />
              <span>Sync to Firestore</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Merchant Admin Console"
              className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs + Live Feedback Banner */}
        <div className="px-6 py-3 bg-[#F3EFE8] border-b border-[#E6E1D8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#0A2246] text-white'
                  : 'bg-white text-[#524E48] border border-[#DCD5C7] hover:text-[#0A2246]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products &amp; KES Pricing ({products.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0A2246] text-white'
                  : 'bg-white text-[#524E48] border border-[#DCD5C7] hover:text-[#0A2246]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Orders &amp; Courier Dispatch ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('promotions')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                activeTab === 'promotions'
                  ? 'bg-[#0A2246] text-white'
                  : 'bg-white text-[#524E48] border border-[#DCD5C7] hover:text-[#0A2246]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Bundle Pricing &amp; Delivery Rules</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {(savedBanner || cloudSyncStatus) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D5B43]">
                <Check className="w-3.5 h-3.5" />
                <span>{savedBanner || cloudSyncStatus}</span>
              </span>
            )}
            <button
              type="button"
              onClick={async () => {
                await onResetCatalogToDefaults();
                setInlinePrices({});
                triggerSavedMessage('Restored default PENS R US catalog & KES prices');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#524E48] hover:text-[#171614] bg-white rounded border border-[#DCD5C7] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Cols 1-7): Shopify-Style Product & Price Table */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-display text-lg font-semibold text-[#0A2246]">
                      Storefront Catalog &amp; Quick KES Price Editor
                    </h3>
                    <p className="text-xs text-[#6E6A63]">
                      Change any price below and click <strong>Save Price</strong> — updates
                      every product page, bundle builder, and shopping bag immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="bg-white border border-[#DCD5C7] rounded-lg overflow-hidden">
                  <div className="divide-y divide-[#ECE8DF]">
                    {products.map((product) => {
                      const isSelected =
                        !isCreatingNew && selectedProduct?.id === product.id;
                      const currentPriceInput =
                        inlinePrices[product.id] !== undefined
                          ? inlinePrices[product.id]
                          : String(product.priceKes);

                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            setIsCreatingNew(false);
                            setEditingProductId(product.id);
                          }}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#0A2246]/6' : 'hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={resolveAssetUrl(product.image)}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded object-contain bg-white border border-[#E6E1D8] p-1 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#0A2246] truncate">
                                  {product.name}
                                </span>
                                <span className="text-[11px] text-[#6E6A63]">
                                  · {product.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#5C5852] mt-0.5">
                                {product.variants.length}{' '}
                                {product.variants.length === 1 ? 'variant' : 'variants'} ·{' '}
                                <span className="text-[#1D5B43] font-medium">
                                  {product.availability}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Inline Price Editor */}
                          <div
                            className="flex items-center gap-2 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center bg-[#FAF8F5] border border-[#DCD5C7] rounded px-2.5 py-1.5">
                              <span className="text-xs font-mono-tabular text-[#6E6A63] mr-1.5">
                                KES
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={currentPriceInput}
                                onChange={(e) =>
                                  setInlinePrices((prev) => ({
                                    ...prev,
                                    [product.id]: e.target.value,
                                  }))
                                }
                                className="w-20 text-xs font-mono-tabular font-semibold text-[#171614] bg-transparent focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceSave(product)}
                              className="px-3 py-1.5 text-xs font-semibold bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Save Price
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingNew(false);
                                setEditingProductId(product.id);
                              }}
                              title="Edit Product Details"
                              className="p-1.5 rounded border border-[#DCD5C7] bg-white text-[#524E48] hover:text-[#0A2246] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column (Cols 8-12): Detailed Product Inspector or New Product Creator */}
              <div className="lg:col-span-5 bg-white border border-[#DCD5C7] rounded-lg p-5 space-y-4">
                {isCreatingNew ? (
                  <form onSubmit={handleCreateNewProduct} className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-3">
                      <h4 className="font-serif-display text-lg font-semibold text-[#0A2246]">
                        Create New Storefront Product
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(false)}
                        className="text-xs text-[#6E6A63] hover:text-[#171614] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Product Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. PILOT CUSTOM 74 FOUNTAIN PEN"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Price (KES)
                        </label>
                        <input
                          type="number"
                          required
                          min={100}
                          step={100}
                          value={newProdPriceKes}
                          onChange={(e) => setNewProdPriceKes(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Category
                        </label>
                        <select
                          value={newProdCategory}
                          onChange={(e) =>
                            setNewProdCategory(e.target.value as Product['category'])
                          }
                          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        >
                          <option value="Fountain Pens">Fountain Pens</option>
                          <option value="Bottled Inks">Bottled Inks</option>
                          <option value="Converters & Refills">Converters &amp; Refills</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Stock Status
                        </label>
                        <input
                          type="text"
                          value={newProdAvailability}
                          onChange={(e) => setNewProdAvailability(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Primary Finish Label
                        </label>
                        <input
                          type="text"
                          value={newVariantLabel}
                          onChange={(e) => setNewVariantLabel(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Product Image Path or URL
                      </label>
                      <input
                        type="text"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Short Summary &amp; Description
                      </label>
                      <textarea
                        rows={3}
                        value={newProdSummary}
                        onChange={(e) => setNewProdSummary(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="inline-flex items-center gap-2 text-xs text-[#3F3D39] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProdHasNib}
                          onChange={(e) => setNewProdHasNib(e.target.checked)}
                        />
                        <span>Enable Fine / Medium Nib Selector</span>
                      </label>
                      <input
                        type="color"
                        value={newVariantSwatch}
                        onChange={(e) => setNewVariantSwatch(e.target.value)}
                        title="Variant Swatch Color"
                        className="w-7 h-7 rounded border border-[#DCD5C7] cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer"
                    >
                      Publish Product to Storefront
                    </button>
                  </form>
                ) : selectedProduct ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-[#ECE8DF] pb-3">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B58435]">
                          Editing Product · {selectedProduct.id}
                        </span>
                        <h4 className="font-serif-display text-lg font-semibold text-[#0A2246]">
                          {selectedProduct.name}
                        </h4>
                      </div>
                      {selectedProduct.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteProduct(selectedProduct.id);
                            setEditingProductId(products[0]?.id || null);
                            triggerSavedMessage(`Removed ${selectedProduct.name}`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.name}
                        onChange={(e) =>
                          handleFieldChange(selectedProduct, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Price in KES
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={selectedProduct.priceKes}
                          onChange={(e) => {
                            const nextVal = Math.max(0, Math.round(Number(e.target.value) || 0));
                            setInlinePrices((prev) => ({
                              ...prev,
                              [selectedProduct.id]: String(nextVal),
                            }));
                            handleFieldChange(selectedProduct, 'priceKes', nextVal);
                          }}
                          className="w-full px-3 py-2 text-xs font-mono-tabular font-semibold bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                          Inventory Status Badge
                        </label>
                        <select
                          value={selectedProduct.availability}
                          onChange={(e) =>
                            handleFieldChange(
                              selectedProduct,
                              'availability',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        >
                          <option value="In Stock in Nairobi">In Stock in Nairobi</option>
                          <option value="Low Stock · 2 Left in Nairobi">
                            Low Stock · 2 Left in Nairobi
                          </option>
                          <option value="Pre-Order · Next Tokyo Shipment">
                            Pre-Order · Next Tokyo Shipment
                          </option>
                          <option value="Sold Out">Sold Out</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Subtitle / Japanese Edition Title
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.japaneseTitle}
                        onChange={(e) =>
                          handleFieldChange(
                            selectedProduct,
                            'japaneseTitle',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                        Storefront Summary
                      </label>
                      <textarea
                        rows={3}
                        value={selectedProduct.shortSummary}
                        onChange={(e) =>
                          handleFieldChange(
                            selectedProduct,
                            'shortSummary',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                      />
                    </div>

                    {/* Variant Editor List */}
                    <div className="pt-2 border-t border-[#ECE8DF]">
                      <span className="block text-xs font-semibold text-[#0A2246] mb-2">
                        Finishes &amp; Variants ({selectedProduct.variants.length})
                      </span>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {selectedProduct.variants.slice(0, 8).map((v) => (
                          <div
                            key={v.id}
                            className="p-2 rounded bg-[#FAF8F5] border border-[#E6E1D8] flex items-center gap-2"
                          >
                            {v.swatchHex && (
                              <span
                                className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: v.swatchHex }}
                              />
                            )}
                            <input
                              type="text"
                              value={v.label}
                              onChange={(e) =>
                                handleVariantUpdate(selectedProduct, v.id, {
                                  label: e.target.value,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs bg-white border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* Tab 2: Merchant Order Fulfillment & Courier Status Manager */
            <div className="space-y-4">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#0A2246]">
                  Customer Orders &amp; Courier Dispatch Control
                </h3>
                <p className="text-xs text-[#6E6A63]">
                  Update order status between <strong>Processing</strong>,{' '}
                  <strong>Out for Courier</strong>, and <strong>Delivered</strong> — syncs
                  immediately with the customer&apos;s Member Order Tracking view.
                </p>
              </div>

              <div className="bg-white border border-[#DCD5C7] rounded-lg overflow-hidden divide-y divide-[#ECE8DF]">
                {orders.map((ord) => {
                  const status = ord.orderStatus || 'Processing';
                  return (
                    <div
                      key={ord.orderNumber}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-tabular text-xs font-bold text-[#0A2246]">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-xs font-semibold text-[#171614]">
                            {ord.customerName}
                          </span>
                          <span className="text-xs text-[#6E6A63]">({ord.phone})</span>
                          <span className="font-mono-tabular text-xs font-semibold text-[#1D5B43]">
                            · {formatKes(ord.total)}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C5852]">
                          {ord.address} · {ord.city.split(' ')[0]} · Waybill:{' '}
                          <span className="font-mono-tabular font-semibold">
                            {ord.trackingCode || 'NBO-COUR'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {(['Processing', 'Out for Courier', 'Delivered'] as const).map(
                          (st) => {
                            const active = status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  onUpdateOrderStatusByNumber(ord.orderNumber, st);
                                  triggerSavedMessage(
                                    `Order #${ord.orderNumber} marked as ${st}`
                                  );
                                }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                                  active
                                    ? 'bg-[#0A2246] text-white border-[#0A2246]'
                                    : 'bg-[#FAF8F5] text-[#524E48] border-[#DCD5C7] hover:border-[#0A2246]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Tab 3: Bundle Pricing & Delivery Rules */
            <div className="max-w-xl bg-white border border-[#DCD5C7] rounded-lg p-6 space-y-5">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#0A2246]">
                  Storefront Bundles &amp; Kenya Courier Thresholds
                </h3>
                <p className="text-xs text-[#6E6A63] mt-1">
                  Configure the discounted bundle price for the 3-Bottle 50ml Pilot
                  Iroshizuku Ink Mixing Set and the complimentary upcountry courier
                  threshold.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171614] mb-1">
                    3-Bottle Iroshizuku Ink Mixing Set Bundle Price (KES)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={storeSettings.inkMixingSetBundleKes}
                    onChange={(e) =>
                      onUpdateStoreSettings({
                        ...storeSettings,
                        inkMixingSetBundleKes: Math.max(
                          1000,
                          Math.round(Number(e.target.value) || 20000)
                        ),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-tabular font-semibold bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                  />
                  <p className="text-[11px] text-[#6E6A63] mt-1">
                    Default: KES 20,000 (10% Trio Bundle Privilege off 3 ×single bottle price).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171614] mb-1">
                    Complimentary Nationwide Kenya Delivery Threshold (KES)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={storeSettings.freeDeliveryThresholdKes}
                    onChange={(e) =>
                      onUpdateStoreSettings({
                        ...storeSettings,
                        freeDeliveryThresholdKes: Math.max(
                          0,
                          Math.round(Number(e.target.value) || 6000)
                        ),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-tabular font-semibold bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                  />
                  <p className="text-[11px] text-[#6E6A63] mt-1">
                    Orders at or above this KES amount receive free courier delivery across all
                    47 counties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
