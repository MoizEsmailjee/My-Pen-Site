/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  Feather,
  Sparkles,
  Truck,
  ShieldCheck,
  MapPin,
  Eye,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash2,
  History,
  LogIn,
  LogOut,
  RotateCcw,
  UserCheck,
  Search,
  Bell,
} from 'lucide-react';
import {
  FEATURED_PRODUCTS,
  INK_STUDIO_SHADES,
  InkShadeOption,
  NibOption,
  Product,
  ProductVariant,
} from './data/products';
import { ChromaticInkRibbonIsland } from './islands/ChromaticInkRibbonIsland';
import { WritingSetBuilderIsland } from './islands/WritingSetBuilderIsland';
import { InkMixingSetBuilderIsland } from './islands/InkMixingSetBuilderIsland';
import { QuickBuyModalIsland } from './islands/QuickBuyModalIsland';
import {
  MerchantAdminIsland,
  StoreSettings,
  PromoCodeRecord,
  RestockAlertRecord,
} from './islands/MerchantAdminIsland';
import {
  CustomerReviewsIsland,
  ProductReviewRecord,
  StarRatingDisplay,
} from './islands/CustomerReviewsIsland';
import { UniformProductPageIsland } from './islands/UniformProductPageIsland';
import { resolveAssetUrl } from './utils/assetResolver';
import {
  auth,
  db,
  signInWithGooglePopup,
  signOutFirebase,
  onAuthStateChanged,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  User,
} from './firebase';

interface CartItem {
  product: Product;
  variant: ProductVariant;
  nibSize?: NibOption;
  quantity: number;
}

interface WishlistItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sublabel: string;
  priceKes: number;
  image: string;
  category: Product['category'];
  nibSize?: NibOption;
  swatchHex?: string;
  addedAt: number;
}

const BRAND_LOGO_SRC =
  '/assets/aistudio/Gemini_Generated_Image_644qn3644qn3644q_cd72faa3.jpg';
const WISHLIST_STORAGE_KEY = 'pens_r_us_wishlist_v1';
const ORDERS_STORAGE_KEY = 'pens_r_us_orders_v1';
const MEMBER_SESSION_STORAGE_KEY = 'pens_r_us_member_session_v1';
const CATALOG_STORAGE_KEY = 'pens_r_us_catalog_v4';
const STORE_SETTINGS_STORAGE_KEY = 'pens_r_us_store_settings_v2';
const PROMO_CODES_STORAGE_KEY = 'pens_r_us_promo_codes_v1';
const REVIEWS_STORAGE_KEY = 'pens_r_us_reviews_v1';
const RESTOCK_ALERTS_STORAGE_KEY = 'pens_r_us_restock_alerts_v1';
const AUTHORIZED_ADMIN_EMAIL = 'ananyapoudel641@gmail.com';

const DEFAULT_SEED_RESTOCK_ALERTS: RestockAlertRecord[] = [
  {
    id: 'seed-alert-madoromi-lb-1',
    productId: 'pilot-kakuno-madoromi',
    productName: 'Pilot Kakuno Fountain Pen — Madoromi Series',
    variantId: 'madoromi-lightblue',
    variantLabel: 'Madoromi Light Blue',
    nibSize: 'Medium',
    customerName: 'Njeri Karanja',
    contact: '+254 722 891 304',
    status: 'waiting',
    timestamp: '07 Nov · 04:15 PM',
    createdAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'seed-alert-family-clear-1',
    productId: 'pilot-kakuno-family',
    productName: 'Pilot Kakuno Fountain Pen — Family Series',
    variantId: 'family-clear',
    variantLabel: 'Clear Demonstrator',
    nibSize: 'Fine',
    customerName: 'David Omondi',
    contact: 'david.omondi@kilimani.co.ke',
    status: 'waiting',
    timestamp: '08 Nov · 09:40 AM',
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'seed-alert-tsukiyo-1',
    productId: 'pilot-iroshizuku-ink',
    productName: 'Pilot Iroshizuku Bottled Fountain Pen Ink (50ml)',
    variantId: 'iroshizuku-tsuki-yo',
    variantLabel: 'Tsuki-yo (月夜) · Moonlight Deep Teal-Blue',
    customerName: 'Farah Abdi',
    contact: '+254 733 410 922',
    status: 'waiting',
    timestamp: '08 Nov · 11:20 AM',
    createdAt: Date.now() - 3600000 * 3,
  },
];

const DEFAULT_PROMO_CODES: PromoCodeRecord[] = [
  {
    id: 'nairobi10',
    code: 'NAIROBI10',
    discountType: 'percentage',
    discountValue: 10,
    minSpendKes: 5000,
    description: '10% privilege on orders from KES 5,000',
    active: true,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'collector1000',
    code: 'COLLECTOR1000',
    discountType: 'fixed',
    discountValue: 1000,
    minSpendKes: 10000,
    description: 'KES 1,000 off orders from KES 10,000',
    active: true,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'atelier15',
    code: 'ATELIER15',
    discountType: 'percentage',
    discountValue: 15,
    minSpendKes: 18000,
    description: '15% VIP Collector discount on orders from KES 18,000',
    active: true,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

const DEFAULT_SEED_REVIEWS: ProductReviewRecord[] = [
  {
    id: 'seed-rev-prera-1',
    productId: 'pilot-prera',
    userId: 'seed-collector-1',
    authorName: 'Dr. Kamau Njoroge',
    authorLocation: 'Karen, Nairobi',
    variantLabel: 'Empress Teal · Medium Nib',
    rating: 5,
    comment:
      'The magnetic-feel slip cap click on the Pilot Prera is addictive, and the Empress Teal acrylic looks stunning on my desk. Having the CON-40 converter included in the box made filling with Iroshizuku Ku-jaku effortless.',
    timestamp: '02 Nov · Verified Purchase',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'seed-rev-prera-2',
    productId: 'pilot-prera',
    userId: 'seed-collector-2',
    authorName: 'Zainab Hassan',
    authorLocation: 'Nyali, Mombasa',
    variantLabel: 'Cinnamon Brown · Fine Nib',
    rating: 5,
    comment:
      'Compact when capped and perfectly balanced when posted. The Japanese Fine nib writes razor-sharp notes in my planner with zero feathering.',
    timestamp: '26 Oct · Verified Purchase',
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'seed-rev-madoromi-1',
    productId: 'pilot-kakuno-madoromi',
    userId: 'seed-collector-3',
    authorName: 'Amina Ochieng',
    authorLocation: 'Kilimani, Nairobi',
    variantLabel: 'Madoromi Ivory · Medium Nib',
    rating: 5,
    comment:
      'The gold-tone smiling nib on the Madoromi Ivory is so smooth and joyful to write with. Same-day courier arrived in Kilimani in under 3 hours!',
    timestamp: '04 Nov · Verified Purchase',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'seed-rev-family-1',
    productId: 'pilot-kakuno-family',
    userId: 'seed-collector-4',
    authorName: 'Peter Mutua',
    authorLocation: 'Westlands, Nairobi',
    variantLabel: 'Kakuno Papa (Blue) · Fine Nib',
    rating: 5,
    comment:
      'Bought the Papa Blue and Mama Red for daily journaling. The hexagonal grip naturally aligns your fingers and the Fine nib glides effortlessly.',
    timestamp: '29 Oct · Verified Purchase',
    createdAt: Date.now() - 86400000 * 9,
  },
  {
    id: 'seed-rev-iroshizuku-1',
    productId: 'pilot-iroshizuku-ink',
    userId: 'seed-collector-5',
    authorName: 'Wanjiku Mwangi',
    authorLocation: 'Westlands, Nairobi',
    variantLabel: 'Yama-budo & Ama-iro (50ml)',
    rating: 5,
    comment:
      'Nothing compares to Pilot Iroshizuku ink flow and shading. The heavy faceted 50ml glass bottle with the internal dip reservoir is a work of art.',
    timestamp: '01 Nov · Verified Purchase',
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'seed-rev-con40-1',
    productId: 'pilot-con-40',
    userId: 'seed-collector-6',
    authorName: 'Brian Kiprop',
    authorLocation: 'Eldoret',
    variantLabel: 'CON-40 Twist Converter (69810)',
    rating: 5,
    comment:
      'Essential upgrade for my Kakuno Madoromi. The four tiny stainless steel agitator beads keep saturated inks flowing without ever skipping.',
    timestamp: '21 Oct · Verified Purchase',
    createdAt: Date.now() - 86400000 * 17,
  },
  {
    id: 'seed-rev-waterman-1',
    productId: 'waterman-ink-bottle',
    userId: 'seed-collector-7',
    authorName: 'Grace Wambui',
    authorLocation: 'CBD, Nairobi',
    variantLabel: 'Serenity Blue (50ml)',
    rating: 5,
    comment:
      'Waterman Serenity Blue is my benchmark office ink—well-behaved on every Kenyan office paper and the angled bottle facets make filling so easy.',
    timestamp: '25 Oct · Verified Purchase',
    createdAt: Date.now() - 86400000 * 13,
  },
];

interface MemberProfile {
  uid: string;
  name: string;
  emailOrPhone: string;
  authMode: 'google' | 'member';
}

export type OrderStatus = 'Processing' | 'Out for Courier' | 'Delivered';

const ORDER_TRACKING_STAGES: {
  status: OrderStatus;
  stepNumber: string;
  label: string;
  atelierNote: string;
}[] = [
  {
    status: 'Processing',
    stepNumber: '01',
    label: 'Processing',
    atelierNote: 'Japanese nib tine alignment check & protective flacon wrapping at Nairobi Atelier',
  },
  {
    status: 'Out for Courier',
    stepNumber: '02',
    label: 'Out for Courier',
    atelierNote: 'Handed to Nairobi same-day dispatch rider / nationwide express courier',
  },
  {
    status: 'Delivered',
    stepNumber: '03',
    label: 'Delivered',
    atelierNote: 'Package handed over & verified at recipient destination',
  },
];

interface OrderConfirmation {
  id?: string;
  userId?: string;
  userEmail?: string;
  orderNumber: string;
  orderStatus?: OrderStatus;
  trackingCode?: string;
  estimatedDelivery?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: 'mpesa' | 'cod' | 'whatsapp';
  promoCode?: string;
  promoDiscountKes?: number;
  bundleDiscountKes?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  timestamp: string;
  createdAt?: number;
}

const KENYA_LOCATIONS = [
  { city: 'Nairobi (CBD, Westlands, Kilimani, Karen)', fee: 0, eta: 'Same-Day Courier (2–4 hrs)' },
  { city: 'Kiambu / Thika / Machakos / Ngong', fee: 250, eta: 'Next Morning Delivery' },
  { city: 'Mombasa / Diani / Nyali', fee: 450, eta: 'Next-Day Overnight Courier' },
  { city: 'Kisumu / Nakuru / Eldoret / Nanyuki', fee: 400, eta: 'Next-Day Fargo / G4S Courier' },
];

const INK_COLOR_FAMILIES = [
  'All 24 Shades',
  'Blues & Teals',
  'Reds, Pinks & Purples',
  'Greens & Golds',
  'Blacks, Greys & Browns',
] as const;

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function VariantStockIndicator({
  stockCount,
  availabilityLabel,
  compact = false,
}: {
  stockCount?: number;
  availabilityLabel?: string;
  compact?: boolean;
}) {
  const count = typeof stockCount === 'number' ? stockCount : 10;

  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
        <span>Sold Out (0 left)</span>
      </span>
    );
  }

  if (count < 3) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold animate-pulse">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <span>
          {compact
            ? `Low Stock · Only ${count} left`
            : `Low Stock · Only ${count} left in Nairobi`}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[#6E6A63] font-normal">
      <span className="w-1.5 h-1.5 rounded-full bg-[#9E988E] shrink-0" />
      <span>
        {availabilityLabel && !compact
          ? `${availabilityLabel} (${count} in stock)`
          : `${count} in stock`}
      </span>
    </span>
  );
}

/**
 * Resilient image component complying with the Zero-Broken-Image Policy.
 */
function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAssetUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFE9] to-[#E5DFD3] text-[#3F3D39] p-6 text-center ${className}`}
      >
        <Feather className="w-8 h-8 mb-2 stroke-[1.25] text-[#163A5F]" />
        <span className="font-serif-display text-lg font-medium tracking-wide">
          {fallbackTitle}
        </span>
        <span className="text-xs text-[#6E6A63] mt-1">Pilot Corporation · Japan</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/**
 * Tightly-cropped, background-normalized official PENS R US — THE PEN SPECIALISTS logo lockup.
 * Eliminates the outer 16:9 vignette margins and normalizes the off-white canvas to pure white
 * so mix-blend-multiply blends seamlessly into #FAF8F5 without a visible box or duplicate text.
 */
function BrandLogoLockup({
  size = 'header',
}: {
  size?: 'header' | 'footer';
}) {
  const dimensions =
    size === 'header'
      ? 'w-[164px] h-[66px] sm:w-[184px] sm:h-[74px]'
      : 'w-[176px] h-[70px]';

  return (
    <div className={`relative overflow-hidden select-none shrink-0 ${dimensions}`}>
      <img
        src={resolveAssetUrl(BRAND_LOGO_SRC)}
        alt="PENS R US — The Pen Specialists"
        referrerPolicy="no-referrer"
        style={{
          filter: 'brightness(1.06) contrast(1.08)',
          mixBlendMode: 'multiply',
        }}
        className="absolute left-1/2 top-[52.5%] -translate-x-1/2 -translate-y-1/2 w-[138%] max-w-none h-auto pointer-events-none"
      />
    </div>
  );
}

export default function App() {
  // Dynamic Storefront Catalog State (Editable via Merchant Admin Console + Synced with Firestore /products)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    try {
      const saved = window.localStorage.getItem(CATALOG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default catalog
    }
    return FEATURED_PRODUCTS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = window.localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.inkMixingSetBundleKes === 'number') {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return {
      inkMixingSetBundleKes: 16200,
      freeDeliveryThresholdKes: 6000,
      whatsappConciergePhone: '254700000000',
    };
  });

  const [promoCodes, setPromoCodes] = useState<PromoCodeRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem(PROMO_CODES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_PROMO_CODES;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(promoCodes));
    } catch {
      // Ignore storage error
    }
  }, [promoCodes]);

  const [isMerchantAdminOpen, setIsMerchantAdminOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);

  // Out-of-Stock "Notify Me" Waitlist State (Local + Real-Time Firestore /restock_alerts Sync)
  const [localRestockAlerts, setLocalRestockAlerts] = useState<RestockAlertRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem(RESTOCK_ALERTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_SEED_RESTOCK_ALERTS;
  });
  const [firestoreRestockAlerts, setFirestoreRestockAlerts] = useState<RestockAlertRecord[]>([]);
  const [notifyModalTarget, setNotifyModalTarget] = useState<{
    product: Product;
    variant: ProductVariant;
    nibSize?: NibOption;
  } | null>(null);
  const [notifyNameInput, setNotifyNameInput] = useState('');
  const [notifyContactInput, setNotifyContactInput] = useState('');
  const [notifySubmittedMessage, setNotifySubmittedMessage] = useState<string | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [submittingNotify, setSubmittingNotify] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RESTOCK_ALERTS_STORAGE_KEY,
        JSON.stringify(localRestockAlerts)
      );
    } catch {
      // Ignore storage error
    }
  }, [localRestockAlerts]);

  const allRestockAlerts = useMemo(() => {
    const map = new Map<string, RestockAlertRecord>();
    for (const a of firestoreRestockAlerts) {
      map.set(`${a.variantId}::${a.contact.toLowerCase()}`, a);
    }
    for (const a of localRestockAlerts) {
      const key = `${a.variantId}::${a.contact.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, a);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [firestoreRestockAlerts, localRestockAlerts]);

  // Customer Reviews State (Local + Real-Time Firestore /reviews Sync)
  const [localReviews, setLocalReviews] = useState<ProductReviewRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default seed reviews
    }
    return DEFAULT_SEED_REVIEWS;
  });
  const [firestoreReviews, setFirestoreReviews] = useState<ProductReviewRecord[]>([]);
  const [expandedCardReviews, setExpandedCardReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(localReviews));
    } catch {
      // Ignore storage quota error
    }
  }, [localReviews]);

  // Real-time Firestore listener for /reviews collection
  useEffect(() => {
    const reviewsPath = 'reviews';
    const unsubscribe = onSnapshot(
      collection(db, reviewsPath),
      (snapshot) => {
        const fetched: ProductReviewRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            productId: String(data.productId || ''),
            userId: String(data.userId || ''),
            authorName: String(data.authorName || 'Atelier Collector'),
            authorLocation: data.authorLocation ? String(data.authorLocation) : undefined,
            variantLabel: data.variantLabel ? String(data.variantLabel) : undefined,
            rating: Number(data.rating) || 5,
            comment: String(data.comment || ''),
            timestamp: String(data.timestamp || 'Verified Collector'),
            createdAt: Number(data.createdAt) || 0,
          };
        });
        setFirestoreReviews(fetched);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, reviewsPath);
        } catch {
          // Structured error logged
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Combined deduplicated reviews across Firestore and seeded/local reviews
  const allProductReviews = useMemo(() => {
    const map = new Map<string, ProductReviewRecord>();
    for (const rev of firestoreReviews) {
      map.set(`${rev.productId}::${rev.authorName}::${rev.comment}`, rev);
    }
    for (const rev of localReviews) {
      const key = `${rev.productId}::${rev.authorName}::${rev.comment}`;
      if (!map.has(key)) {
        map.set(key, rev);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [firestoreReviews, localReviews]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogProducts));
    } catch {
      // Ignore storage quota error
    }
  }, [catalogProducts]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORE_SETTINGS_STORAGE_KEY,
        JSON.stringify(storeSettings)
      );
    } catch {
      // Ignore storage quota error
    }
  }, [storeSettings]);

  // Real-Time Firestore Listener for Storefront Product Catalog (/products) & Store Settings (/store_settings/config)
  useEffect(() => {
    const productsUnsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (snapshot.empty) return;
        const cloudMap = new Map<string, Partial<Product>>();
        snapshot.docs.forEach((docSnap) => {
          cloudMap.set(docSnap.id, docSnap.data() as Partial<Product>);
        });

        setCatalogProducts((prev) => {
          const merged = prev.map((prod) => {
            const override = cloudMap.get(prod.id);
            if (!override) return prod;
            cloudMap.delete(prod.id);
            return {
              ...prod,
              name: override.name ?? prod.name,
              japaneseTitle: override.japaneseTitle ?? prod.japaneseTitle,
              category: override.category ?? prod.category,
              priceKes:
                typeof override.priceKes === 'number'
                  ? override.priceKes
                  : prod.priceKes,
              image: override.image ?? prod.image,
              availability: override.availability ?? prod.availability,
              shortSummary: override.shortSummary ?? prod.shortSummary,
              description: override.description ?? prod.description,
              hasNibSelector:
                typeof override.hasNibSelector === 'boolean'
                  ? override.hasNibSelector
                  : prod.hasNibSelector,
              variants:
                Array.isArray(override.variants) && override.variants.length > 0
                  ? override.variants
                  : prod.variants,
            };
          });

          // Append any custom merchant products created in Firestore
          cloudMap.forEach((customProd, id) => {
            if (customProd.name && typeof customProd.priceKes === 'number') {
              merged.push({
                id,
                name: customProd.name,
                japaneseTitle: customProd.japaneseTitle || 'Japanese Atelier Collection',
                category: customProd.category || 'Fountain Pens',
                priceKes: customProd.priceKes,
                image: customProd.image || '/assets/prera/empress_teal_1.jpg',
                imageFit: 'contain',
                hasNibSelector: Boolean(customProd.hasNibSelector),
                Origin: 'Made in Japan',
                availability: customProd.availability || 'In Stock in Nairobi',
                shortSummary: customProd.shortSummary || '',
                description: customProd.description || customProd.shortSummary || '',
                variantLabel: 'Select Finish',
                variants:
                  Array.isArray(customProd.variants) && customProd.variants.length > 0
                    ? customProd.variants
                    : [
                        {
                          id: `${id}-default`,
                          label: customProd.name,
                          sublabel: customProd.shortSummary || '',
                          image: customProd.image || '/assets/prera/empress_teal_1.jpg',
                        },
                      ],
                specs: [
                  { label: 'Origin', value: 'Made in Japan' },
                  { label: 'Dispatch', value: 'Same-Day Nairobi Courier' },
                ],
                includedItems: [customProd.name, 'Presentation Box'],
              });
            }
          });
          return merged;
        });
      },
      () => {
        // Fallback silently to local catalog if offline
      }
    );

    const settingsUnsub = onSnapshot(
      doc(db, 'store_settings', 'config'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (
            typeof data.inkMixingSetBundleKes === 'number' &&
            typeof data.freeDeliveryThresholdKes === 'number'
          ) {
          setStoreSettings({
              inkMixingSetBundleKes: data.inkMixingSetBundleKes,
              freeDeliveryThresholdKes: data.freeDeliveryThresholdKes,
              whatsappConciergePhone:
                typeof data.whatsappConciergePhone === 'string'
                  ? data.whatsappConciergePhone
                  : '254700000000',
            });
          }
        }
      },
      () => {
        // Ignore offline error
      }
    );

    const promosUnsub = onSnapshot(
      collection(db, 'promo_codes'),
      (snapshot) => {
        if (snapshot.empty) return;
        const fetched: PromoCodeRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            code: String(data.code || docSnap.id).toUpperCase(),
            discountType: data.discountType === 'fixed' ? 'fixed' : 'percentage',
            discountValue: Number(data.discountValue) || 10,
            minSpendKes: Number(data.minSpendKes) || 0,
            description: String(data.description || ''),
            active: Boolean(data.active),
            updatedAt: Number(data.updatedAt) || Date.now(),
          };
        });
        setPromoCodes((prev) => {
          const map = new Map<string, PromoCodeRecord>();
          prev.forEach((p) => map.set(p.code.toUpperCase(), p));
          fetched.forEach((p) => map.set(p.code.toUpperCase(), p));
          return Array.from(map.values());
        });
      },
      () => {
        // Ignore offline error
      }
    );

    return () => {
      productsUnsub();
      settingsUnsub();
      promosUnsub();
    };
  }, []);

  // Dynamically sync live catalog prices, stock status, and review counts into Schema.org JSON-LD
  useEffect(() => {
    const scriptEl = document.getElementById('schema-org-static');
    if (!scriptEl) return;
    try {
      const totalReviews = allProductReviews.length || 18;
      const avgRating =
        allProductReviews.length > 0
          ? (
              allProductReviews.reduce((sum, r) => sum + r.rating, 0) /
              allProductReviews.length
            ).toFixed(1)
          : '4.9';
      const productGraphs = catalogProducts.map((p) => {
        const totalUnits = p.variants.reduce(
          (sum, v) => sum + (typeof v.stockCount === 'number' ? v.stockCount : 10),
          0
        );
        return {
          '@type': 'Product',
          '@id': `https://pensrus.co.ke/#product-${p.id}`,
          name: p.name,
          description: p.shortSummary || p.description,
          category: p.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KES',
            price: String(p.priceKes),
            availability:
              totalUnits > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        };
      });
      const schemaPayload = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Store',
            '@id': 'https://pensrus.co.ke/#store',
            name: 'PENS R US — The Pen Specialists',
            url: 'https://pensrus.co.ke/',
            currenciesAccepted: 'KES',
            paymentAccepted: 'M-Pesa, Cash on Delivery, WhatsApp Concierge',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: avgRating,
              reviewCount: String(totalReviews),
              bestRating: '5',
              worstRating: '1',
            },
          },
          ...productGraphs,
        ],
      };
      scriptEl.textContent = JSON.stringify(schemaPayload);
    } catch {
      // Ignore DOM JSON-LD update error
    }
  }, [catalogProducts, allProductReviews]);

  // Category filter state for main Featured Collection
  const [activeCategory, setActiveCategory] = useState<
    'All' | 'Fountain Pens' | 'Bottled Inks' | 'Converters & Refills'
  >('All');

  // Unified Atelier Series View Switcher ('all' | 'madoromi' | 'family' | 'prera' | 'iroshizuku' | 'pilot-30ml' | 'con40' | 'waterman' | 'wishlist')
  const [activeSeriesView, setActiveSeriesView] = useState<
    'all' | 'madoromi' | 'family' | 'prera' | 'iroshizuku' | 'pilot-30ml' | 'con40' | 'waterman' | 'wishlist'
  >('all');

  // Filter state for the Full 24-Shade Iroshizuku Variety Showcase
  const [activeInkFamily, setActiveInkFamily] =
    useState<(typeof INK_COLOR_FAMILIES)[number]>('All 24 Shades');

  // Header Search Bar State (search pens & ink shades by name or characteristics)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Selected variants per product ID
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    'pilot-kakuno-madoromi': 'madoromi-ivory',
    'pilot-kakuno-family': 'family-papa-blue',
    'pilot-prera': 'prera-empress-teal',
    'pilot-iroshizuku-ink': 'iroshizuku-ama-iro',
    'pilot-con-40': 'con-40-single',
    'waterman-ink-bottle': 'waterman-serenity-blue',
    'pilot-30ml-ink': 'pilot-30ml-blue',
  });

  // Selected Nib Size (Fine or Medium) per product ID and per individual Madoromi, Family & Prera variant
  const [selectedNibs, setSelectedNibs] = useState<Record<string, NibOption>>({
    'pilot-kakuno-madoromi': 'Medium',
    'pilot-kakuno-family': 'Fine',
    'pilot-prera': 'Medium',
    'madoromi-ivory': 'Medium',
    'madoromi-blue': 'Medium',
    'madoromi-pink': 'Fine',
    'madoromi-brown': 'Fine',
    'madoromi-lightblue': 'Medium',
    'family-papa-blue': 'Fine',
    'family-mama-red': 'Fine',
    'family-boy-green': 'Medium',
    'family-girl-pink': 'Fine',
    'family-baby-yellow': 'Medium',
    'family-clear': 'Fine',
    'prera-empress-teal': 'Medium',
    'prera-cinnamon-brown': 'Medium',
    'prera-porcelain-white': 'Fine',
  });

  // Active image override per product card / modal
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<string, string>>({
    'pilot-kakuno-madoromi': '/assets/madoromi/madoromi_series.jpg',
    'pilot-kakuno-family': '/assets/kakuno_family/family_papa_blue.jpg',
    'pilot-prera': '/assets/prera/empress_teal_1.jpg',
    'pilot-iroshizuku-ink': '/assets/iroshizuku/ama_iro.jpg',
    'pilot-con-40': '/assets/converters/pilot_con40.jpg',
    'waterman-ink-bottle': '/assets/waterman/waterman_serenity_blue.jpg',
    'pilot-30ml-ink':
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-30ml-ink')?.image || '',
  });

  // Per-shade view mode in the 24-shade Iroshizuku gallery ('bottle' = Bottle + Swatch, 'swatch' = Swatch Card Close-Up)
  const [inkCardViewMode, setInkCardViewMode] = useState<Record<string, 'bottle' | 'swatch'>>({});

  // Hover magnifier state for Iroshizuku gallery cards
  const [hoveredInkZoom, setHoveredInkZoom] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  // Fullscreen Optical Zoom Lightbox Modal State
  const [zoomModal, setZoomModal] = useState<{
    src: string;
    secondarySrc?: string;
    activeView: 'primary' | 'secondary';
    title: string;
    subtitle?: string;
    swatchHex?: string;
    inkShadeId?: string;
    zoomLevel: 1 | 2 | 3;
    panX: number;
    panY: number;
  } | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);

  // Persistent Wishlist State (synced with localStorage across sessions)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty wishlist if localStorage is unavailable or corrupt
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlist]);

  // Active Product Detail Modal & Quick Buy Modal Overlay
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);

  // Checkout & Order History state inside Cart Drawer
  const [activeCartTab, setActiveCartTab] = useState<'bag' | 'history'>('bag');
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod' | 'whatsapp'>('mpesa');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCodeRecord | null>(null);
  const [promoFeedbackMsg, setPromoFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedWhatsAppOrderNo, setCopiedWhatsAppOrderNo] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  // User Login & Order History State (Firebase Auth + Atelier Member Login)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirestoreAdminDoc, setIsFirestoreAdminDoc] = useState(false);

  const isAuthorizedAdmin = useMemo(() => {
    if (!firebaseUser) return false;
    const isBootstrappedOwner =
      firebaseUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL &&
      firebaseUser.emailVerified;
    return Boolean(isBootstrappedOwner || isFirestoreAdminDoc);
  }, [firebaseUser, isFirestoreAdminDoc]);

  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(() => {
    try {
      const saved = window.localStorage.getItem(MEMBER_SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return null;
  });
  const [loginNameInput, setLoginNameInput] = useState('');
  const [loginContactInput, setLoginContactInput] = useState('');
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [orderTrackingSearch, setOrderTrackingSearch] = useState('');
  const [expandedTrackingOrders, setExpandedTrackingOrders] = useState<Record<string, boolean>>({
    'PRU-5104': true,
    'PRU-4892': true,
  });

  // Persisted Local Orders + Firestore Real-Time Orders
  const [localOrders, setLocalOrders] = useState<OrderConfirmation[]>(() => {
    const preraPen = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-prera')!;
    const kakunoFamilyPen = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-family')!;
    const watermanInk = FEATURED_PRODUCTS.find((p) => p.id === 'waterman-ink-bottle')!;
    const madoromiPen = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-madoromi')!;
    const iroshizukuInk = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!;
    const con40 = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-con-40')!;

    const defaultSeedOrders: OrderConfirmation[] = [
      {
        id: 'seed-order-pru-5104',
        orderNumber: 'PRU-5104',
        orderStatus: 'Processing',
        trackingCode: 'NBO-COUR-5104',
        estimatedDelivery: 'Same-Day Nairobi Courier · Dispatching within 90 mins',
        customerName: 'Wanjiku Mwangi',
        phone: '+254 712 345 678',
        city: 'Nairobi (CBD, Westlands, Kilimani, Karen)',
        address: 'Delta Corner Tower, Westlands, Nairobi',
        paymentMethod: 'mpesa',
        items: [
          {
            product: preraPen,
            variant: preraPen.variants[0],
            nibSize: 'Medium',
            quantity: 1,
          },
        ],
        subtotal: 8500,
        deliveryFee: 0,
        total: 8500,
        timestamp: 'Today · 10:15 AM',
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'seed-order-pru-4892',
        orderNumber: 'PRU-4892',
        orderStatus: 'Out for Courier',
        trackingCode: 'NBO-COUR-4892',
        estimatedDelivery: 'Rider En Route via Waiyaki Way · Est. 40 mins',
        customerName: 'Wanjiku Mwangi',
        phone: '+254 712 345 678',
        city: 'Nairobi (CBD, Westlands, Kilimani, Karen)',
        address: 'Delta Corner Tower, Westlands, Nairobi',
        paymentMethod: 'mpesa',
        items: [
          {
            product: kakunoFamilyPen,
            variant: kakunoFamilyPen.variants[0],
            nibSize: 'Fine',
            quantity: 1,
          },
          {
            product: watermanInk,
            variant: watermanInk.variants[0],
            quantity: 1,
          },
        ],
        subtotal: 4500,
        deliveryFee: 0,
        total: 4500,
        timestamp: 'Yesterday · 03:45 PM',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'seed-order-pru-3910',
        orderNumber: 'PRU-3910',
        orderStatus: 'Delivered',
        trackingCode: 'NBO-COUR-3910',
        estimatedDelivery: 'Delivered & Signed · Received at Reception',
        customerName: 'Wanjiku Mwangi',
        phone: '+254 712 345 678',
        city: 'Nairobi (CBD, Westlands, Kilimani, Karen)',
        address: 'Delta Corner Tower, Westlands, Nairobi',
        paymentMethod: 'mpesa',
        items: [
          {
            product: madoromiPen,
            variant: madoromiPen.variants[0],
            nibSize: 'Medium',
            quantity: 1,
          },
          {
            product: con40,
            variant: con40.variants[0],
            quantity: 1,
          },
          {
            product: iroshizukuInk,
            variant: iroshizukuInk.variants[0],
            quantity: 1,
          },
        ],
        subtotal: 10400,
        deliveryFee: 0,
        total: 10400,
        timestamp: '14 Oct · 11:20 AM',
        createdAt: Date.now() - 86400000 * 7,
      },
    ];

    try {
      const saved = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydratedSaved: OrderConfirmation[] = parsed.map((ord: OrderConfirmation) => ({
            ...ord,
            orderStatus:
              ord.orderStatus ||
              (ord.orderNumber === 'PRU-3910' ? 'Delivered' : 'Processing'),
            trackingCode:
              ord.trackingCode ||
              `NBO-COUR-${ord.orderNumber.replace(/[^0-9]/g, '') || '4021'}`,
            estimatedDelivery:
              ord.estimatedDelivery ||
              (ord.orderNumber === 'PRU-3910'
                ? 'Delivered & Signed · Received at Destination'
                : 'Same-Day Nairobi Courier (2–4 hrs)'),
          }));
          // Ensure the seed orders for 'Processing' and 'Out for Courier' exist so all 3 tracking states are visible
          const existingNumbers = new Set(hydratedSaved.map((o) => o.orderNumber));
          for (const seedOrd of defaultSeedOrders) {
            if (!existingNumbers.has(seedOrd.orderNumber)) {
              hydratedSaved.push(seedOrd);
            }
          }
          return hydratedSaved.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
      }
    } catch {
      // Ignore storage error
    }
    return defaultSeedOrders;
  });
  const [firestoreOrders, setFirestoreOrders] = useState<OrderConfirmation[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localOrders));
    } catch {
      // Ignore storage quota errors
    }
  }, [localOrders]);

  useEffect(() => {
    try {
      if (memberProfile) {
        window.localStorage.setItem(
          MEMBER_SESSION_STORAGE_KEY,
          JSON.stringify(memberProfile)
        );
      } else {
        window.localStorage.removeItem(MEMBER_SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [memberProfile]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile: MemberProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Atelier Collector',
          emailOrPhone: user.email || 'Verified Google Account',
          authMode: 'google',
        };
        setMemberProfile(profile);
        if (!customerName && profile.name) setCustomerName(profile.name);
      }
    });
    return () => unsubscribe();
  }, []);

  // Verify whether the signed-in Firebase user has a document in /admins/{uid}
  useEffect(() => {
    if (!firebaseUser) {
      setIsFirestoreAdminDoc(false);
      return;
    }
    const adminDocRef = doc(db, 'admins', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      adminDocRef,
      (snap) => {
        setIsFirestoreAdminDoc(snap.exists());
      },
      () => {
        setIsFirestoreAdminDoc(false);
      }
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  // Subscribe to authenticated user's Firestore orders in real time (or all orders for verified admin)
  useEffect(() => {
    if (!firebaseUser) {
      setFirestoreOrders([]);
      return;
    }
    const ordersPath = 'orders';
    const q = isAuthorizedAdmin
      ? collection(db, ordersPath)
      : query(collection(db, ordersPath), where('userId', '==', firebaseUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: OrderConfirmation[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const hydratedItems: CartItem[] = Array.isArray(data.items)
            ? data.items.map((rawItem: CartItem) => {
                const matchedProd =
                  FEATURED_PRODUCTS.find((p) => p.id === rawItem.product?.id) ||
                  FEATURED_PRODUCTS[0];
                const matchedVar =
                  matchedProd.variants.find((v) => v.id === rawItem.variant?.id) ||
                  rawItem.variant ||
                  matchedProd.variants[0];
                return {
                  product: matchedProd,
                  variant: matchedVar,
                  nibSize: rawItem.nibSize,
                  quantity: rawItem.quantity || 1,
                };
              })
            : [];
          return {
            id: docSnap.id,
            userId: data.userId,
            userEmail: data.userEmail,
            orderNumber: data.orderNumber,
            orderStatus:
              (data.orderStatus as OrderStatus) || 'Processing',
            trackingCode:
              data.trackingCode ||
              `NBO-COUR-${String(data.orderNumber || '').replace(/[^0-9]/g, '') || '4000'}`,
            estimatedDelivery:
              data.estimatedDelivery || 'Same-Day Nairobi Courier (2–4 hrs)',
            customerName: data.customerName,
            phone: data.phone,
            city: data.city,
            address: data.address,
            paymentMethod: data.paymentMethod,
            items: hydratedItems,
            subtotal: data.subtotal,
            deliveryFee: data.deliveryFee,
            total: data.total,
            timestamp: data.timestamp,
            createdAt: data.createdAt || 0,
          };
        });
        fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setFirestoreOrders(fetched);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, ordersPath);
        } catch {
          // Handled structured log
        }
      }
    );
    return () => unsubscribe();
  }, [firebaseUser, isAuthorizedAdmin]);

  // Subscribe to /restock_alerts in real time when signed in as verified Merchant Admin
  useEffect(() => {
    if (!firebaseUser || !isAuthorizedAdmin) {
      setFirestoreRestockAlerts([]);
      return;
    }
    const alertsPath = 'restock_alerts';
    const unsubscribe = onSnapshot(
      collection(db, alertsPath),
      (snapshot) => {
        const fetched: RestockAlertRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            productId: String(data.productId || ''),
            productName: String(data.productName || ''),
            variantId: String(data.variantId || ''),
            variantLabel: String(data.variantLabel || ''),
            nibSize: data.nibSize ? String(data.nibSize) : undefined,
            customerName: data.customerName ? String(data.customerName) : undefined,
            contact: String(data.contact || ''),
            userId: data.userId ? String(data.userId) : undefined,
            status: data.status === 'notified' ? 'notified' : 'waiting',
            timestamp: String(data.timestamp || ''),
            createdAt: Number(data.createdAt) || Date.now(),
          };
        });
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        setFirestoreRestockAlerts(fetched);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, alertsPath);
        } catch {
          // Structured log
        }
      }
    );
    return () => unsubscribe();
  }, [firebaseUser, isAuthorizedAdmin]);

  // Combined deduplicated order history for the logged-in user
  const userOrderHistory = useMemo(() => {
    if (!memberProfile) return [];
    const map = new Map<string, OrderConfirmation>();
    for (const ord of firestoreOrders) {
      map.set(ord.orderNumber, ord);
    }
    for (const ord of localOrders) {
      if (!map.has(ord.orderNumber)) {
        map.set(ord.orderNumber, ord);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  }, [memberProfile, firestoreOrders, localOrders]);

  const kakunoMadoromiProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-kakuno-madoromi') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-madoromi')!,
    [catalogProducts]
  );

  const kakunoFamilyProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-kakuno-family') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-kakuno-family')!,
    [catalogProducts]
  );

  const pilotPreraProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-prera') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-prera')!,
    [catalogProducts]
  );

  const pilotCon40Product = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-con-40') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-con-40')!,
    [catalogProducts]
  );

  const watermanInkProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'waterman-ink-bottle') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'waterman-ink-bottle')!,
    [catalogProducts]
  );

  const iroshizukuProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-iroshizuku-ink') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!,
    [catalogProducts]
  );

  const pilot30mlInkProduct = useMemo(
    () =>
      catalogProducts.find((p) => p.id === 'pilot-30ml-ink') ||
      FEATURED_PRODUCTS.find((p) => p.id === 'pilot-30ml-ink')!,
    [catalogProducts]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    const base =
      activeCategory === 'All'
        ? catalogProducts
        : catalogProducts.filter((p) => p.category === activeCategory);

    if (!normalizedSearch) return base;

    return base.filter((product) => {
      const productFields = [
        product.name,
        product.japaneseTitle,
        product.category,
        product.Origin,
        product.description,
        product.hasNibSelector ? 'fine medium nib 0.35mm 0.50mm' : '',
        ...product.specs.map((s) => `${s.label} ${s.value}`),
        ...product.includedItems,
        ...product.variants.map((v) => `${v.label} ${v.sublabel}`),
      ]
        .join(' ')
        .toLowerCase();

      return productFields.includes(normalizedSearch);
    });
  }, [activeCategory, normalizedSearch, catalogProducts]);

  const filteredInkVariety = useMemo(() => {
    const base =
      activeInkFamily === 'All 24 Shades'
        ? INK_STUDIO_SHADES
        : INK_STUDIO_SHADES.filter((shade) => shade.colorFamily === activeInkFamily);

    if (!normalizedSearch) return base;

    return base.filter((shade) => {
      const shadeFields = [
        shade.name,
        shade.kanji,
        shade.meaning,
        shade.colorFamily,
        shade.sheenNote,
        'pilot iroshizuku 50ml bottled ink japan',
      ]
        .join(' ')
        .toLowerCase();
      return shadeFields.includes(normalizedSearch);
    });
  }, [activeInkFamily, normalizedSearch]);

  // Instant Header Search Dropdown Results (Pens/Finishes + Ink Shades by Name or Characteristic)
  const headerSearchResults = useMemo(() => {
    if (!normalizedSearch) {
      return { penMatches: [], inkMatches: [], totalCount: 0 };
    }

    // 1. Match products and specific variants/finishes
    const penMatches: {
      key: string;
      product: Product;
      matchedVariant: ProductVariant;
      matchNote: string;
    }[] = [];

    for (const product of catalogProducts) {
      // Check if specific variants match first (e.g. "Ivory", "Papa", "Serenity Blue", "Demonstrator")
      const matchingVariants = product.variants.filter((v) =>
        `${v.label} ${v.sublabel}`.toLowerCase().includes(normalizedSearch)
      );

      const generalProductText = [
        product.name,
        product.japaneseTitle,
        product.category,
        product.description,
        product.hasNibSelector ? 'fine nib medium nib 0.35mm 0.50mm' : '',
        ...product.specs.map((s) => `${s.label} ${s.value}`),
      ]
        .join(' ')
        .toLowerCase();

      if (matchingVariants.length > 0 && product.id !== 'pilot-iroshizuku-ink') {
        for (const variant of matchingVariants.slice(0, 3)) {
          penMatches.push({
            key: `${product.id}-${variant.id}`,
            product,
            matchedVariant: variant,
            matchNote: `${variant.label} · ${variant.sublabel}`,
          });
        }
      } else if (generalProductText.includes(normalizedSearch)) {
        const defaultVariant =
          product.variants.find((v) => v.id === selectedVariants[product.id]) ||
          product.variants[0];
        penMatches.push({
          key: `${product.id}-default`,
          product,
          matchedVariant: defaultVariant,
          matchNote:
            product.specs.map((s) => s.value).slice(0, 2).join(' · ') ||
            defaultVariant.sublabel,
        });
      }
    }

    // 2. Match all 24 Iroshizuku ink shades by name, kanji, meaning, color family, or sheen/shading characteristic
    const inkMatches = INK_STUDIO_SHADES.filter((shade) => {
      const searchable = [
        shade.name,
        shade.kanji,
        shade.meaning,
        shade.colorFamily,
        shade.sheenNote,
        'iroshizuku ink',
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    });

    return {
      penMatches: penMatches.slice(0, 5),
      inkMatches: inkMatches.slice(0, 6),
      totalCount: penMatches.length + inkMatches.length,
    };
  }, [normalizedSearch, selectedVariants, catalogProducts]);

  const totalItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartRawSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.priceKes * item.quantity, 0),
    [cart]
  );

  // Automatic Ink Mixing Set Trio Discount: Every 3 × 50ml Pilot Iroshizuku bottles
  // are bundled at storeSettings.inkMixingSetBundleKes (default KES 20,000)
  const inkMixingSetDiscount = useMemo(() => {
    const iroshizukuQty = cart
      .filter((item) => item.product.id === 'pilot-iroshizuku-ink')
      .reduce((acc, item) => acc + item.quantity, 0);
    const trioCount = Math.floor(iroshizukuQty / 3);
    const singlePrice = iroshizukuProduct.priceKes;
    const discountPerTrio = Math.max(
      0,
      singlePrice * 3 - storeSettings.inkMixingSetBundleKes
    );
    return trioCount * discountPerTrio;
  }, [cart, iroshizukuProduct.priceKes, storeSettings.inkMixingSetBundleKes]);

  const cartSubtotalAfterBundle = Math.max(0, cartRawSubtotal - inkMixingSetDiscount);

  const promoDiscountKes = useMemo(() => {
    if (!appliedPromoCode || !appliedPromoCode.active) return 0;
    if (cartSubtotalAfterBundle < appliedPromoCode.minSpendKes) return 0;
    if (appliedPromoCode.discountType === 'percentage') {
      return Math.round((cartSubtotalAfterBundle * appliedPromoCode.discountValue) / 100);
    }
    return Math.min(cartSubtotalAfterBundle, appliedPromoCode.discountValue);
  }, [appliedPromoCode, cartSubtotalAfterBundle]);

  const cartSubtotal = Math.max(0, cartSubtotalAfterBundle - promoDiscountKes);

  const selectedLocation = KENYA_LOCATIONS[selectedLocationIdx];
  const deliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    if (cartSubtotal >= storeSettings.freeDeliveryThresholdKes) return 0;
    return selectedLocation.fee;
  }, [cartSubtotal, selectedLocation, storeSettings.freeDeliveryThresholdKes]);

  const orderTotal = cartSubtotal + deliveryFee;

  const handleApplyPromoCode = (codeToApply?: string) => {
    const raw = (codeToApply ?? promoCodeInput).trim().toUpperCase();
    if (!raw) {
      setPromoFeedbackMsg({ type: 'error', text: 'Enter a promo voucher code.' });
      return;
    }
    const matched = promoCodes.find((p) => p.code.toUpperCase() === raw);
    if (!matched) {
      setPromoFeedbackMsg({
        type: 'error',
        text: `Code "${raw}" was not found. Try NAIROBI10 or COLLECTOR1000.`,
      });
      return;
    }
    if (!matched.active) {
      setPromoFeedbackMsg({
        type: 'error',
        text: `Promo code "${matched.code}" is currently paused or expired.`,
      });
      return;
    }
    if (cartSubtotalAfterBundle < matched.minSpendKes) {
      setPromoFeedbackMsg({
        type: 'error',
        text: `${matched.code} requires a minimum bag total of ${formatKes(matched.minSpendKes)}.`,
      });
      return;
    }
    setAppliedPromoCode(matched);
    setPromoCodeInput(matched.code);
    setPromoFeedbackMsg({
      type: 'success',
      text: `Applied ${matched.code}: ${matched.description}`,
    });
  };

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
    const product = catalogProducts.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (variant?.image) {
      setActiveImageByProduct((prev) => ({ ...prev, [productId]: variant.image! }));
    }
  };

  const handleSelectNib = (key: string, nib: NibOption) => {
    setSelectedNibs((prev) => ({ ...prev, [key]: nib }));
  };

  const renderUniformProductPage = (product: Product) => {
    const activeVariantId =
      selectedVariants[product.id] || product.variants[0]?.id || '';
    const activeNib: NibOption =
      selectedNibs[product.id] ||
      (product.id === 'pilot-kakuno-family' ? 'Fine' : 'Medium');
    return (
      <UniformProductPageIsland
        product={product}
        selectedVariantId={activeVariantId}
        selectedNib={activeNib}
        activeImageSrc={activeImageByProduct[product.id]}
        justAddedKey={justAddedKey}
        isWishlisted={isItemWishlisted(product.id, activeVariantId)}
        reviews={allProductReviews}
        currentUser={
          memberProfile
            ? {
                uid: firebaseUser?.uid || memberProfile.uid,
                name: memberProfile.name,
                emailOrPhone: memberProfile.emailOrPhone,
                isFirebaseAuthenticated: Boolean(firebaseUser),
              }
            : null
        }
        isSigningIn={isSigningIn}
        onSelectVariant={handleSelectVariant}
        onSelectImage={(pid, src) =>
          setActiveImageByProduct((prev) => ({ ...prev, [pid]: src }))
        }
        onSelectNib={handleSelectNib}
        onOpenZoom={(payload) =>
          setZoomModal({
            ...payload,
            zoomLevel: 2,
            panX: 50,
            panY: 50,
          })
        }
        onAddToCart={handleAddToCart}
        onQuickBuy={(prod) => setQuickBuyProduct(prod)}
        onNotifyMe={(prod, variant, nib) =>
          handleOpenNotifyMeModal(prod, variant, nib)
        }
        onToggleWishlist={handleToggleWishlist}
        onGoogleSignIn={handleGoogleSignIn}
        onQuickMemberSignIn={handleQuickMemberSignInForReviews}
        onSubmitReview={handleSubmitProductReview}
        onDeleteReview={handleDeleteProductReview}
      />
    );
  };

  const handleAddToCart = (
    product: Product,
    customVariant?: ProductVariant,
    customNib?: NibOption,
    openDrawer = false,
    customFeedbackKey?: string
  ) => {
    const chosenVariant =
      customVariant ||
      product.variants.find((v) => v.id === selectedVariants[product.id]) ||
      product.variants[0];

    const chosenNib: NibOption | undefined = product.hasNibSelector
      ? customNib || selectedNibs[product.id] || 'Fine'
      : undefined;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.variant.id === chosenVariant.id &&
          item.nibSize === chosenNib
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          variant: chosenVariant,
          nibSize: chosenNib,
          quantity: 1,
        },
      ];
    });

    setCheckoutStep('bag');
    const feedbackKey =
      customFeedbackKey || `${product.id}-${chosenVariant.id}-${chosenNib || 'none'}`;
    setJustAddedKey(feedbackKey);
    setTimeout(() => {
      setJustAddedKey((curr) => (curr === feedbackKey ? null : curr));
    }, 1600);

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const handleConfirmQuickBuy = ({
    product,
    variant,
    nibSize,
    quantity,
    includeCon40,
    openCartDrawer,
  }: {
    product: Product;
    variant: ProductVariant;
    nibSize?: NibOption;
    quantity: number;
    includeCon40: boolean;
    openCartDrawer: boolean;
  }) => {
    setCart((prev) => {
      let next = [...prev];
      const existingIdx = next.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.variant.id === variant.id &&
          item.nibSize === nibSize
      );
      if (existingIdx > -1) {
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
      } else {
        next.push({
          product,
          variant,
          nibSize,
          quantity,
        });
      }

      if (includeCon40) {
        const con40Var = pilotCon40Product.variants[0];
        const con40Idx = next.findIndex(
          (item) =>
            item.product.id === pilotCon40Product.id &&
            item.variant.id === con40Var.id
        );
        if (con40Idx > -1) {
          next[con40Idx] = {
            ...next[con40Idx],
            quantity: next[con40Idx].quantity + 1,
          };
        } else {
          next.push({
            product: pilotCon40Product,
            variant: con40Var,
            quantity: 1,
          });
        }
      }

      return next;
    });

    setCheckoutStep('bag');
    const feedbackKey = `${product.id}-${variant.id}-${nibSize || 'none'}`;
    setJustAddedKey(feedbackKey);
    setTimeout(() => {
      setJustAddedKey((curr) => (curr === feedbackKey ? null : curr));
    }, 1600);

    if (openCartDrawer) {
      setIsCartOpen(true);
    }
  };

  const handleAddInkShadeDirectly = (shade: InkShadeOption) => {
    const inkProduct = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!;
    const matchingVariant =
      inkProduct.variants.find((v) => v.id === shade.id) || inkProduct.variants[0];
    handleSelectVariant('pilot-iroshizuku-ink', shade.id);
    handleAddToCart(
      inkProduct,
      matchingVariant,
      undefined,
      false,
      `pilot-iroshizuku-ink-${shade.id}`
    );
  };

  const isItemWishlisted = (productId: string, variantId: string): boolean => {
    const key = `${productId}::${variantId}`;
    return wishlist.some((item) => item.id === key);
  };

  const handleToggleWishlist = (
    product: Product,
    customVariant?: ProductVariant,
    customNib?: NibOption
  ) => {
    const chosenVariant =
      customVariant ||
      product.variants.find((v) => v.id === selectedVariants[product.id]) ||
      product.variants[0];
    const chosenNib: NibOption | undefined = product.hasNibSelector
      ? customNib || selectedNibs[chosenVariant.id] || selectedNibs[product.id] || 'Fine'
      : undefined;
    const key = `${product.id}::${chosenVariant.id}`;

    setWishlist((prev) => {
      if (prev.some((item) => item.id === key)) {
        return prev.filter((item) => item.id !== key);
      }
      return [
        ...prev,
        {
          id: key,
          productId: product.id,
          variantId: chosenVariant.id,
          productName: product.name,
          variantLabel: chosenVariant.label,
          sublabel: chosenVariant.sublabel,
          priceKes: product.priceKes,
          image: chosenVariant.image || product.image,
          category: product.category,
          nibSize: chosenNib,
          swatchHex: chosenVariant.swatchHex,
          addedAt: Date.now(),
        },
      ];
    });
  };

  const handleToggleInkShadeWishlist = (shade: InkShadeOption) => {
    const inkProduct = FEATURED_PRODUCTS.find((p) => p.id === 'pilot-iroshizuku-ink')!;
    const matchingVariant =
      inkProduct.variants.find((v) => v.id === shade.id) || inkProduct.variants[0];
    handleToggleWishlist(inkProduct, matchingVariant);
  };

  const handleRemoveWishlistItem = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    nibSize: NibOption | undefined,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.variant.id === variantId &&
            item.nibSize === nibSize
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };



  const handleAddBundleToCart = (
    items: {
      product: Product;
      variant: ProductVariant;
      nibSize?: NibOption;
    }[]
  ) => {
    items.forEach((entry, index) => {
      const isLast = index === items.length - 1;
      handleAddToCart(entry.product, entry.variant, entry.nibSize, isLast);
    });
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthStatusMessage(null);
    try {
      const user = await signInWithGooglePopup();
      const profile: MemberProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Atelier Collector',
        emailOrPhone: user.email || 'Google Account',
        authMode: 'google',
      };
      setMemberProfile(profile);
      if (!customerName && profile.name) setCustomerName(profile.name);
    } catch {
      setAuthStatusMessage(
        'Google popup was blocked or closed in preview. You can sign in below using your Name & Kenyan Phone or Email.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleMemberFormSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = loginNameInput.trim();
    const trimmedContact = loginContactInput.trim();
    if (!trimmedName || !trimmedContact) {
      setAuthStatusMessage('Please enter your name and email or Kenyan mobile number.');
      return;
    }
    const profile: MemberProfile = {
      uid: `member-${trimmedContact.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: trimmedName,
      emailOrPhone: trimmedContact,
      authMode: 'member',
    };
    setMemberProfile(profile);
    if (!customerName) setCustomerName(trimmedName);
    if (!customerPhone && /^\+?\d/.test(trimmedContact)) setCustomerPhone(trimmedContact);
    setAuthStatusMessage(null);
  };

  const handleSignOutAccount = async () => {
    try {
      if (firebaseUser) {
        await signOutFirebase();
      }
    } catch {
      // Ignore signout error
    }
    setMemberProfile(null);
    setAuthStatusMessage(null);
  };

  const handleReorderPastPurchase = (pastOrder: OrderConfirmation) => {
    setCart((prev) => {
      const next = [...prev];
      for (const orderItem of pastOrder.items) {
        const existingIdx = next.findIndex(
          (item) =>
            item.product.id === orderItem.product.id &&
            item.variant.id === orderItem.variant.id &&
            item.nibSize === orderItem.nibSize
        );
        if (existingIdx > -1) {
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + orderItem.quantity,
          };
        } else {
          next.push({
            product: orderItem.product,
            variant: orderItem.variant,
            nibSize: orderItem.nibSize,
            quantity: orderItem.quantity,
          });
        }
      }
      return next;
    });
    setCheckoutStep('bag');
    setActiveCartTab('bag');
  };

  const handleToggleOrderTracking = (orderNumber: string) => {
    setExpandedTrackingOrders((prev) => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }));
  };

  const handleUpdateOrderStatus = async (
    order: OrderConfirmation,
    nextStatus: OrderStatus
  ) => {
    if (!isAuthorizedAdmin) return;
    const nextEta =
      nextStatus === 'Processing'
        ? 'Preparing at Nairobi Atelier · Nib Inspection in Progress'
        : nextStatus === 'Out for Courier'
        ? `Courier Dispatched (${order.city.split(' ')[0]}) · Rider En Route`
        : `Delivered & Signed · ${order.address}`;

    setLocalOrders((prev) =>
      prev.map((item) =>
        item.orderNumber === order.orderNumber
          ? {
              ...item,
              orderStatus: nextStatus,
              estimatedDelivery: nextEta,
            }
          : item
      )
    );

    if (confirmedOrder?.orderNumber === order.orderNumber) {
      setConfirmedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: nextStatus,
              estimatedDelivery: nextEta,
            }
          : null
      );
    }

    // If signed in with Firebase Auth, either update the existing Firestore document or promote the local order into Firestore
    if (auth.currentUser) {
      if (
        order.id &&
        !order.id.startsWith('seed-order-') &&
        order.userId === auth.currentUser.uid
      ) {
        const orderDocPath = `orders/${order.id}`;
        try {
          await updateDoc(doc(db, 'orders', order.id), {
            orderStatus: nextStatus,
            estimatedDelivery: nextEta,
          });
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.UPDATE, orderDocPath);
          } catch {
            // Structured error logged
          }
        }
      } else {
        const firestorePayload = {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || '',
          orderNumber: order.orderNumber,
          orderStatus: nextStatus,
          trackingCode:
            order.trackingCode ||
            `NBO-COUR-${order.orderNumber.replace(/[^0-9]/g, '') || '4000'}`,
          estimatedDelivery: nextEta,
          customerName: order.customerName,
          phone: order.phone,
          city: order.city,
          address: order.address,
          paymentMethod: order.paymentMethod,
          items: order.items.map((item) => ({
            product: {
              id: item.product.id,
              name: item.product.name,
              priceKes: item.product.priceKes,
              image: item.product.image,
            },
            variant: {
              id: item.variant.id,
              label: item.variant.label,
              sublabel: item.variant.sublabel,
              image: item.variant.image || item.product.image,
            },
            nibSize: item.nibSize || null,
            quantity: item.quantity,
          })),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          timestamp: order.timestamp,
          createdAt: order.createdAt || Date.now(),
        };
        try {
          await addDoc(collection(db, 'orders'), firestorePayload);
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.CREATE, 'orders');
          } catch {
            // Structured error logged
          }
        }
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setCheckoutError('Please enter your full name, Kenyan mobile number, and delivery address.');
      return;
    }
    setCheckoutError(null);

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const nowFormatted = new Date().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
    }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAtMs = Date.now();
    const orderNumber = `PRU-${randomCode}`;
    const trackingCode = `${
      selectedLocationIdx === 0 ? 'NBO-COUR' : 'KE-FGO'
    }-${randomCode}`;
    const initialEta = `${selectedLocation.eta} · Preparing at Nairobi Atelier`;

    const confirmation: OrderConfirmation = {
      orderNumber,
      orderStatus: 'Processing',
      trackingCode,
      estimatedDelivery: initialEta,
      customerName: customerName.trim(),
      phone: customerPhone.trim(),
      city: selectedLocation.city,
      address: deliveryAddress.trim(),
      paymentMethod,
      promoCode: appliedPromoCode && promoDiscountKes > 0 ? appliedPromoCode.code : undefined,
      promoDiscountKes: promoDiscountKes > 0 ? promoDiscountKes : undefined,
      bundleDiscountKes: inkMixingSetDiscount > 0 ? inkMixingSetDiscount : undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      total: orderTotal,
      timestamp: nowFormatted,
      createdAt: createdAtMs,
    };

    // Expand tracking view automatically for newly placed order
    setExpandedTrackingOrders((prev) => ({
      ...prev,
      [orderNumber]: true,
    }));

    // Save to local orders immediately so Order History updates instantaneously
    setLocalOrders((prev) => [confirmation, ...prev]);

    // Deduct ordered quantities from per-variant stockCount in catalogProducts
    setCatalogProducts((prevCatalog) =>
      prevCatalog.map((prod) => {
        const orderedForProd = cart.filter((c) => c.product.id === prod.id);
        if (orderedForProd.length === 0) return prod;
        const nextVariants = prod.variants.map((v) => {
          const orderedQty = orderedForProd
            .filter((c) => c.variant.id === v.id)
            .reduce((sum, c) => sum + c.quantity, 0);
          if (orderedQty === 0) return v;
          const currStock = typeof v.stockCount === 'number' ? v.stockCount : 10;
          return {
            ...v,
            stockCount: Math.max(0, currStock - orderedQty),
          };
        });
        const updatedProd = { ...prod, variants: nextVariants };
        if (auth.currentUser && isAuthorizedAdmin) {
          persistProductToFirestore(updatedProd);
        }
        return updatedProd;
      })
    );

    // Auto-sign in customer to Member Profile if they placed an order while logged out
    if (!memberProfile) {
      setMemberProfile({
        uid: `member-${customerPhone.trim().replace(/[^a-z0-9]/gi, '')}`,
        name: customerName.trim(),
        emailOrPhone: customerPhone.trim(),
        authMode: 'member',
      });
    }

    // If authenticated with Firebase Auth, also persist the order to Firestore /orders
    if (auth.currentUser) {
      const firestorePayload: Record<string, unknown> = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        orderNumber: confirmation.orderNumber,
        orderStatus: confirmation.orderStatus,
        trackingCode: confirmation.trackingCode,
        estimatedDelivery: confirmation.estimatedDelivery,
        customerName: confirmation.customerName,
        phone: confirmation.phone,
        city: confirmation.city,
        address: confirmation.address,
        paymentMethod: confirmation.paymentMethod,
        items: confirmation.items.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            priceKes: item.product.priceKes,
            image: item.product.image,
          },
          variant: {
            id: item.variant.id,
            label: item.variant.label,
            sublabel: item.variant.sublabel,
            image: item.variant.image || item.product.image,
          },
          nibSize: item.nibSize || null,
          quantity: item.quantity,
        })),
        subtotal: confirmation.subtotal,
        deliveryFee: confirmation.deliveryFee,
        total: confirmation.total,
        timestamp: confirmation.timestamp,
        createdAt: createdAtMs,
      };
      if (confirmation.promoCode) {
        firestorePayload.promoCode = confirmation.promoCode;
      }
      if (typeof confirmation.promoDiscountKes === 'number') {
        firestorePayload.promoDiscountKes = confirmation.promoDiscountKes;
      }
      if (typeof confirmation.bundleDiscountKes === 'number') {
        firestorePayload.bundleDiscountKes = confirmation.bundleDiscountKes;
      }
      try {
        await addDoc(collection(db, 'orders'), firestorePayload);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.CREATE, 'orders');
        } catch {
          // Structured error logged
        }
      }
    }

    setConfirmedOrder(confirmation);
    setCheckoutStep('confirmed');
    setCart([]);
    setAppliedPromoCode(null);
    setPromoCodeInput('');
    setPromoFeedbackMsg(null);
  };

  const buildWhatsAppOrderText = (order: OrderConfirmation): string => {
    const lines = [
      `*PENS R US KENYA — ORDER #${order.orderNumber}*`,
      `Customer: ${order.customerName} (${order.phone})`,
      `Region: ${order.city}`,
      `Delivery Address: ${order.address}`,
      `Waybill: ${order.trackingCode || 'NBO-COUR'}`,
      ``,
      `*Items Ordered:*`,
      ...order.items.map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (${item.variant.label.split(' · ')[0]}${
            item.nibSize ? `, ${item.nibSize} Nib` : ''
          }) — KES ${(item.product.priceKes * item.quantity).toLocaleString()}`
      ),
      ``,
    ];
    if (order.bundleDiscountKes && order.bundleDiscountKes > 0) {
      lines.push(`3-Bottle Ink Bundle Privilege: -KES ${order.bundleDiscountKes.toLocaleString()}`);
    }
    if (order.promoCode && order.promoDiscountKes) {
      lines.push(
        `Promo Voucher (${order.promoCode}): -KES ${order.promoDiscountKes.toLocaleString()}`
      );
    }
    lines.push(
      `Courier Delivery: ${
        order.deliveryFee === 0 ? 'Complimentary' : `KES ${order.deliveryFee.toLocaleString()}`
      }`
    );
    lines.push(`*Total Due: KES ${order.total.toLocaleString()}*`);
    lines.push(
      `Settlement: ${
        order.paymentMethod === 'whatsapp'
          ? 'WhatsApp Order Concierge'
          : order.paymentMethod === 'mpesa'
          ? 'M-Pesa Express'
          : 'Cash on Delivery'
      }`
    );
    return lines.join('\n');
  };

  const buildWhatsAppOrderUrl = (order: OrderConfirmation): string => {
    const phone = (storeSettings.whatsappConciergePhone || '254700000000').replace(
      /[^0-9]/g,
      ''
    );
    const text = encodeURIComponent(buildWhatsAppOrderText(order));
    return `https://wa.me/${phone}?text=${text}`;
  };

  const handleCopyWhatsAppOrder = async (order: OrderConfirmation) => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppOrderText(order));
      setCopiedWhatsAppOrderNo(order.orderNumber);
      setTimeout(() => setCopiedWhatsAppOrderNo(null), 2500);
    } catch {
      // Fallback if clipboard blocked
    }
  };

  // Merchant Admin Product & Store Settings Handlers (Local State + Cloud Firestore Sync)
  const persistProductToFirestore = async (product: Product) => {
    if (!auth.currentUser || !isAuthorizedAdmin) return;
    const docPath = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), {
        id: product.id,
        name: product.name,
        japaneseTitle: product.japaneseTitle,
        category: product.category,
        priceKes: product.priceKes,
        image: product.image,
        availability: product.availability,
        shortSummary: product.shortSummary,
        description: product.description,
        hasNibSelector: product.hasNibSelector,
        variants: product.variants,
        updatedAt: Date.now(),
      });
      setCloudSyncStatus('Saved to Cloud Firestore');
      setTimeout(() => setCloudSyncStatus(null), 2500);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      } catch {
        // Structured log
      }
    }
  };

  const handleMerchantUpdateProduct = async (updatedProduct: Product) => {
    if (!isAuthorizedAdmin) return;
    setCatalogProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
    await persistProductToFirestore(updatedProduct);
  };

  const handleMerchantAddProduct = async (newProduct: Product) => {
    if (!isAuthorizedAdmin) return;
    setCatalogProducts((prev) => [newProduct, ...prev]);
    setSelectedVariants((prev) => ({
      ...prev,
      [newProduct.id]: newProduct.variants[0]?.id || '',
    }));
    if (newProduct.hasNibSelector) {
      setSelectedNibs((prev) => ({
        ...prev,
        [newProduct.id]: 'Fine',
      }));
    }
    await persistProductToFirestore(newProduct);
  };

  const handleMerchantDeleteProduct = async (productId: string) => {
    if (!isAuthorizedAdmin) return;
    setCatalogProducts((prev) => prev.filter((p) => p.id !== productId));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleMerchantResetCatalog = async () => {
    if (!isAuthorizedAdmin) return;
    setCatalogProducts(FEATURED_PRODUCTS);
    setStoreSettings({
      inkMixingSetBundleKes: 16200,
      freeDeliveryThresholdKes: 6000,
      whatsappConciergePhone: '254700000000',
    });
    if (auth.currentUser) {
      for (const prod of FEATURED_PRODUCTS) {
        await persistProductToFirestore(prod);
      }
    }
  };

  const handleSyncAllProductsToFirestore = async () => {
    if (!auth.currentUser) {
      await handleGoogleSignIn();
    }
    if (!isAuthorizedAdmin) return;
    if (auth.currentUser) {
      for (const prod of catalogProducts) {
        await persistProductToFirestore(prod);
      }
      try {
        await setDoc(doc(db, 'store_settings', 'config'), {
          inkMixingSetBundleKes: storeSettings.inkMixingSetBundleKes,
          freeDeliveryThresholdKes: storeSettings.freeDeliveryThresholdKes,
          whatsappConciergePhone: storeSettings.whatsappConciergePhone || '254700000000',
          updatedAt: Date.now(),
        });
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'store_settings/config');
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleMerchantUpdateStoreSettings = async (next: StoreSettings) => {
    if (!isAuthorizedAdmin) return;
    setStoreSettings(next);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'store_settings', 'config'), {
          inkMixingSetBundleKes: next.inkMixingSetBundleKes,
          freeDeliveryThresholdKes: next.freeDeliveryThresholdKes,
          whatsappConciergePhone: next.whatsappConciergePhone || '254700000000',
          updatedAt: Date.now(),
        });
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'store_settings/config');
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleSavePromoCode = async (promo: PromoCodeRecord) => {
    if (!isAuthorizedAdmin) return;
    setPromoCodes((prev) => {
      const exists = prev.some((p) => p.id === promo.id || p.code === promo.code);
      if (exists) {
        return prev.map((p) => (p.id === promo.id || p.code === promo.code ? promo : p));
      }
      return [promo, ...prev];
    });
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'promo_codes', promo.id), {
          id: promo.id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          minSpendKes: promo.minSpendKes,
          description: promo.description,
          active: promo.active,
          updatedAt: Date.now(),
        });
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, `promo_codes/${promo.id}`);
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleTogglePromoCodeActive = async (promoId: string) => {
    if (!isAuthorizedAdmin) return;
    const target = promoCodes.find((p) => p.id === promoId);
    if (!target) return;
    const updated: PromoCodeRecord = {
      ...target,
      active: !target.active,
      updatedAt: Date.now(),
    };
    await handleSavePromoCode(updated);
    if (appliedPromoCode?.id === promoId && !updated.active) {
      setAppliedPromoCode(null);
    }
  };

  const handleDeletePromoCode = async (promoId: string) => {
    if (!isAuthorizedAdmin) return;
    setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
    if (appliedPromoCode?.id === promoId) {
      setAppliedPromoCode(null);
    }
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'promo_codes', promoId));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, `promo_codes/${promoId}`);
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleOpenNotifyMeModal = (
    product: Product,
    variant: ProductVariant,
    nibSize?: NibOption
  ) => {
    setNotifyModalTarget({ product, variant, nibSize });
    setNotifyNameInput(
      firebaseUser?.displayName || memberProfile?.name || customerName || ''
    );
    setNotifyContactInput(
      firebaseUser?.email || memberProfile?.emailOrPhone || customerPhone || ''
    );
    setNotifySubmittedMessage(null);
    setNotifyError(null);
  };

  const handleSubmitRestockAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyModalTarget) return;
    const trimmedContact = notifyContactInput.trim();
    if (trimmedContact.length < 4) {
      setNotifyError('Please enter a valid email address or Kenyan phone number.');
      return;
    }
    setNotifyError(null);
    setSubmittingNotify(true);

    const createdAtMs = Date.now();
    const nowFormatted =
      new Date().toLocaleDateString('en-KE', {
        day: '2-digit',
        month: 'short',
      }) +
      ' · ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAlert: RestockAlertRecord = {
      id: `local-alert-${createdAtMs}`,
      productId: notifyModalTarget.product.id.slice(0, 100),
      productName: notifyModalTarget.product.name.slice(0, 160),
      variantId: notifyModalTarget.variant.id.slice(0, 100),
      variantLabel: notifyModalTarget.variant.label.slice(0, 160),
      nibSize: notifyModalTarget.nibSize,
      customerName: notifyNameInput.trim()
        ? notifyNameInput.trim().slice(0, 120)
        : undefined,
      contact: trimmedContact.slice(0, 160),
      userId: auth.currentUser?.uid,
      status: 'waiting',
      timestamp: nowFormatted,
      createdAt: createdAtMs,
    };

    setLocalRestockAlerts((prev) => [newAlert, ...prev]);

    const firestorePayload: Record<string, unknown> = {
      productId: newAlert.productId,
      productName: newAlert.productName,
      variantId: newAlert.variantId,
      variantLabel: newAlert.variantLabel,
      contact: newAlert.contact,
      status: 'waiting',
      timestamp: newAlert.timestamp,
      createdAt: newAlert.createdAt,
    };
    if (newAlert.nibSize) firestorePayload.nibSize = newAlert.nibSize;
    if (newAlert.customerName) firestorePayload.customerName = newAlert.customerName;
    if (auth.currentUser?.uid) firestorePayload.userId = auth.currentUser.uid;

    try {
      await addDoc(collection(db, 'restock_alerts'), firestorePayload);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'restock_alerts');
      } catch {
        // Stored locally in fallback
      }
    } finally {
      setSubmittingNotify(false);
      setNotifySubmittedMessage(
        `We'll notify ${newAlert.contact} as soon as ${
          notifyModalTarget.variant.label.split(' · ')[0]
        } is back in stock in Nairobi.`
      );
    }
  };

  const handleToggleRestockAlertStatus = async (alert: RestockAlertRecord) => {
    if (!isAuthorizedAdmin) return;
    const nextStatus: 'waiting' | 'notified' =
      alert.status === 'waiting' ? 'notified' : 'waiting';
    setLocalRestockAlerts((prev) =>
      prev.map((a) =>
        a.id === alert.id ||
        (a.variantId === alert.variantId && a.contact === alert.contact)
          ? { ...a, status: nextStatus }
          : a
      )
    );
    if (
      auth.currentUser &&
      alert.id &&
      !alert.id.startsWith('local-alert-') &&
      !alert.id.startsWith('seed-alert-')
    ) {
      try {
        await updateDoc(doc(db, 'restock_alerts', alert.id), {
          status: nextStatus,
        });
      } catch (error) {
        try {
          handleFirestoreError(
            error,
            OperationType.UPDATE,
            `restock_alerts/${alert.id}`
          );
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleDeleteRestockAlert = async (alert: RestockAlertRecord) => {
    if (!isAuthorizedAdmin) return;
    setLocalRestockAlerts((prev) =>
      prev.filter(
        (a) =>
          a.id !== alert.id &&
          !(a.variantId === alert.variantId && a.contact === alert.contact)
      )
    );
    if (
      auth.currentUser &&
      alert.id &&
      !alert.id.startsWith('local-alert-') &&
      !alert.id.startsWith('seed-alert-')
    ) {
      try {
        await deleteDoc(doc(db, 'restock_alerts', alert.id));
      } catch (error) {
        try {
          handleFirestoreError(
            error,
            OperationType.DELETE,
            `restock_alerts/${alert.id}`
          );
        } catch {
          // Structured log
        }
      }
    }
  };

  const handleSubmitProductReview = async ({
    productId,
    rating,
    comment,
    variantLabel,
    authorLocation,
  }: {
    productId: string;
    rating: number;
    comment: string;
    variantLabel: string;
    authorLocation: string;
  }) => {
    const nowStr =
      new Date().toLocaleDateString('en-KE', {
        day: '2-digit',
        month: 'short',
      }) + ' · Verified Collector';
    const createdAtMs = Date.now();
    const authorName =
      firebaseUser?.displayName ||
      memberProfile?.name ||
      customerName.trim() ||
      'Atelier Collector';
    const userId =
      firebaseUser?.uid || memberProfile?.uid || `local-${createdAtMs}`;

    const newLocalReview: ProductReviewRecord = {
      id: `local-rev-${createdAtMs}`,
      productId,
      userId,
      authorName: authorName.slice(0, 100),
      authorLocation: authorLocation.slice(0, 100),
      variantLabel: variantLabel.slice(0, 140),
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      comment: comment.slice(0, 600),
      timestamp: nowStr,
      createdAt: createdAtMs,
    };

    setLocalReviews((prev) => [newLocalReview, ...prev]);

    if (auth.currentUser) {
      const firestorePayload = {
        productId: newLocalReview.productId,
        userId: auth.currentUser.uid,
        authorName: newLocalReview.authorName,
        authorLocation: newLocalReview.authorLocation || 'Nairobi, Kenya',
        variantLabel: newLocalReview.variantLabel || '',
        rating: newLocalReview.rating,
        comment: newLocalReview.comment,
        timestamp: newLocalReview.timestamp,
        createdAt: createdAtMs,
      };
      try {
        await addDoc(collection(db, 'reviews'), firestorePayload);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.CREATE, 'reviews');
        } catch {
          // Structured error logged
        }
      }
    }
  };

  const handleDeleteProductReview = async (review: ProductReviewRecord) => {
    setLocalReviews((prev) =>
      prev.filter(
        (r) =>
          r.id !== review.id &&
          !(
            r.productId === review.productId &&
            r.authorName === review.authorName &&
            r.comment === review.comment
          )
      )
    );
    if (
      auth.currentUser &&
      review.id &&
      !review.id.startsWith('local-rev-') &&
      !review.id.startsWith('seed-rev-')
    ) {
      const docPath = `reviews/${review.id}`;
      try {
        await deleteDoc(doc(db, 'reviews', review.id));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, docPath);
        } catch {
          // Structured error logged
        }
      }
    }
  };

  const handleQuickMemberSignInForReviews = (name: string, contact: string) => {
    const profile: MemberProfile = {
      uid: `member-${contact.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name,
      emailOrPhone: contact,
      authMode: 'member',
    };
    setMemberProfile(profile);
    if (!customerName) setCustomerName(name);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171614]">
      {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 lg:gap-8 px-6 py-2">
          {/* Zone 1: Single Official PENS R US Logo Lockup (No Duplicate Text) */}
          <a
            href="#top"
            aria-label="PENS R US — The Pen Specialists Home"
            className="inline-flex items-center whitespace-nowrap shrink-0 group"
          >
            <BrandLogoLockup size="header" />
          </a>

          {/* Zone 2: Navigation Links + Interactive Search Bar */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end md:justify-center max-w-3xl">
            <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-[#524E48] shrink-0">
              <a
                href="#collection"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Collection
              </a>
              <a
                href="#pilot-prera-showcase"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Prera Teal
              </a>
              <a
                href="#kakuno-family-showcase"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Family Series
              </a>
              <a
                href="#iroshizuku-gallery"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                24 Ink Shades
              </a>
              <a
                href="#writing-set-builder"
                className="hover:text-[#0A2246] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Set Builder
              </a>
            </nav>

            {/* Search Bar Next to Navigation Links */}
            <div className="relative w-full max-w-[230px] sm:max-w-[270px] lg:max-w-[290px]">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSearchFocused(false);
                  const el = document.getElementById(
                    headerSearchResults.inkMatches.length > 0 &&
                      headerSearchResults.penMatches.length === 0
                      ? 'iroshizuku-gallery'
                      : 'collection'
                  );
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative flex items-center"
              >
                <Search className="w-3.5 h-3.5 text-[#6E6A63] absolute left-3 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    // Delay closing slightly so dropdown button clicks register cleanly
                    setTimeout(() => setIsSearchFocused(false), 180);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search pens, ink shades, sheen..."
                  aria-label="Search fountain pens or ink shades by name or characteristics"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#DCD5C7] focus:border-[#0A2246] rounded text-[#171614] placeholder:text-[#8C857B] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2 p-0.5 text-[#6E6A63] hover:text-[#171614] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Instant Search Results & Characteristic Discovery Dropdown */}
              {isSearchFocused && (
                <div className="absolute right-0 left-0 sm:left-auto sm:w-[410px] mt-2 bg-[#FAF8F5] border border-[#DCD5C7] rounded-lg shadow-xl z-50 overflow-hidden">
                  {!normalizedSearch ? (
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B58435] mb-2.5">
                        Search by Name or Characteristic
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Empress Teal',
                          'Copper Sheen',
                          'Gold Sheen',
                          'Pastel',
                          'Demonstrator',
                          'Ama-iro',
                          'Yama-budo',
                          'Serenity Blue',
                          'Fine Nib',
                          'Converter',
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(tag);
                            }}
                            className="px-2.5 py-1 text-xs bg-white hover:bg-[#0A2246] text-[#3F3D39] hover:text-white border border-[#DCD5C7] rounded transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : headerSearchResults.totalCount === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-xs font-semibold text-[#171614]">
                        No pens or ink shades matched "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-[#6E6A63] mt-1">
                        Try searching "Prera", "Kakuno", "Ama-iro", "copper sheen", "pastel",
                        or "teal".
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E6E1D8]">
                      {/* Matched Fountain Pens, Converters & Finishes */}
                      {headerSearchResults.penMatches.length > 0 && (
                        <div className="p-3">
                          <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
                              Fountain Pens &amp; Instruments ({headerSearchResults.penMatches.length})
                            </span>
                            <a
                              href="#collection"
                              onMouseDown={() => setActiveSeriesView('all')}
                              className="text-[11px] font-semibold text-[#0A2246] hover:underline"
                            >
                              View in Collection
                            </a>
                          </div>
                          <div className="space-y-1.5">
                            {headerSearchResults.penMatches.map((match) => (
                              <div
                                key={match.key}
                                className="p-2 rounded bg-white border border-[#E6E1D8] hover:border-[#0A2246] flex items-center justify-between gap-2.5 transition-colors"
                              >
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectVariant(
                                      match.product.id,
                                      match.matchedVariant.id
                                    );
                                    setActiveProductModal(match.product);
                                    setIsSearchFocused(false);
                                  }}
                                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                                >
                                  <img
                                    src={resolveAssetUrl(
                                      match.matchedVariant.image || match.product.image
                                    )}
                                    alt={match.product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded object-contain bg-white border border-[#ECE8DF] shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0A2246] truncate">
                                      {match.product.name}
                                    </p>
                                    <p className="text-[11px] text-[#5C5852] truncate">
                                      {match.matchNote}
                                    </p>
                                  </div>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono-tabular text-xs font-semibold text-[#171614]">
                                    {formatKes(match.product.priceKes)}
                                  </span>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectVariant(
                                        match.product.id,
                                        match.matchedVariant.id
                                      );
                                      setQuickBuyProduct(match.product);
                                      setIsSearchFocused(false);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#0A2246] text-white rounded hover:bg-[#133468] cursor-pointer"
                                  >
                                    Quick Buy
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Iroshizuku Ink Shades by Name or Characteristic */}
                      {headerSearchResults.inkMatches.length > 0 && (
                        <div className="p-3">
                          <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
                              Iroshizuku Ink Shades ({headerSearchResults.inkMatches.length})
                            </span>
                            <a
                              href="#iroshizuku-gallery"
                              className="text-[11px] font-semibold text-[#0A2246] hover:underline"
                            >
                              Jump to Ink Gallery
                            </a>
                          </div>
                          <div className="space-y-1.5">
                            {headerSearchResults.inkMatches.map((shade) => (
                              <div
                                key={shade.id}
                                className="p-2 rounded bg-white border border-[#E6E1D8] hover:border-[#0A2246] flex items-center justify-between gap-2.5 transition-colors"
                              >
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setZoomModal({
                                      src: shade.image,
                                      secondarySrc: shade.swatchImage,
                                      activeView: 'primary',
                                      title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                                      subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                                      swatchHex: shade.hex,
                                      inkShadeId: shade.id,
                                      zoomLevel: 2,
                                      panX: 50,
                                      panY: 50,
                                    });
                                    setIsSearchFocused(false);
                                  }}
                                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                                >
                                  <span
                                    className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                    style={{ backgroundColor: shade.hex }}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0A2246] truncate">
                                      {shade.name} ({shade.kanji}) ·{' '}
                                      <span className="font-normal text-[#5C5852]">
                                        {shade.meaning}
                                      </span>
                                    </p>
                                    <p className="text-[11px] text-[#6E6A63] truncate">
                                      {shade.sheenNote}
                                    </p>
                                  </div>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono-tabular text-xs font-semibold text-[#171614]">
                                    KES 6,000
                                  </span>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleAddInkShadeDirectly(shade);
                                      setIsSearchFocused(false);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#0A2246] text-white rounded hover:bg-[#133468] cursor-pointer"
                                  >
                                    + Bag
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (checkoutStep === 'confirmed' && cart.length === 0) {
                  setCheckoutStep('bag');
                }
                setIsCartOpen(true);
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#0A2246] hover:bg-[#133468] border border-[#C88A2E]/40 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E5B25D]" />
              <span className="font-mono-tabular">Bag ({totalItemsCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
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
                <a
                  href="#collection"
                  className="inline-flex items-center gap-3 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase bg-[#0A2246] text-white hover:bg-[#133468] rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Our Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#E5B25D]" />
                </a>

                <a
                  href="#collection"
                  onClick={() => setActiveSeriesView('wishlist')}
                  className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-[#0A2246] hover:text-[#B58435] transition-colors whitespace-nowrap shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlist.length > 0 ? 'fill-[#C88A2E] text-[#C88A2E]' : 'text-[#C88A2E]'
                    }`}
                  />
                  <span className="font-mono-tabular">Saved Wishlist ({wishlist.length})</span>
                </a>
              </div>
            </div>

            {/* Right Column: High-Fidelity Studio Product Photography */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full overflow-hidden rounded-lg border border-[#E6E1D8] bg-[#F1EDE4]">
                <ResilientImage
                  src="/assets/images/hero_pilot_fountain_pen_1794023542555.jpg"
                  alt="Japanese Pilot fountain pen resting beside a cut-glass bottle of Pilot Iroshizuku Tsuki-yo ink on cream Japanese washi paper"
                  fallbackTitle="Pilot Custom & Iroshizuku Tsuki-yo"
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

        {/* SECTION 2: OUR FEATURED COLLECTION */}
        <section
          id="collection"
          className="py-16 lg:py-24 bg-[#F3EFE8] border-y border-[#E6E1D8]"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            {/* Section Header + Interactive Segmented Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                  Signature Writing Instruments · Fine &amp; Medium Nibs In Stock
                </p>
                <h2
                  className="font-serif-display text-3xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Our Featured Collection
                </h2>
              </div>

              {/* Interactive Filter Controls (Functional Buttons) */}
              <div
                role="tablist"
                aria-label="Filter collection by category"
                className="flex flex-wrap items-center gap-1 p-1 bg-[#E6E1D8] rounded-md self-start md:self-auto"
              >
                {(['All', 'Fountain Pens', 'Bottled Inks', 'Converters & Refills'] as const).map(
                  (tab) => {
                    const active = activeCategory === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveCategory(tab)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#FAF8F5] text-[#171614] shadow-xs'
                            : 'text-[#5C5852] hover:text-[#171614]'
                        }`}
                      >
                        {tab === 'All' ? `All Instruments (${catalogProducts.length})` : tab}
                      </button>
                    );
                  }
                )}
                {isAuthorizedAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsMerchantAdminOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#0A2246] text-white hover:bg-[#133468] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Merchant Admin (Edit Prices)
                  </button>
                )}
              </div>
            </div>

            {/* Unified Interactive "Shop by Series" Atelier Switcher Bar */}
            <div className="mb-10 p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#6E6A63] px-1">
                <span className="font-semibold uppercase tracking-[0.14em] text-[#171614]">
                  Atelier View
                </span>
                <span aria-hidden="true">·</span>
                <span>Isolate a specific series or explore the full catalog</span>
              </div>

              <div
                role="tablist"
                aria-label="Isolate specific pen or ink series"
                className="flex flex-wrap items-center gap-1.5"
              >
                {(
                  [
                    { id: 'all', label: 'All Series Overview' },
                    { id: 'madoromi', label: `Kakuno Madoromi (${formatKes(kakunoMadoromiProduct.priceKes)})` },
                    { id: 'family', label: `Kakuno Family (${formatKes(kakunoFamilyProduct.priceKes)})` },
                    { id: 'prera', label: `Pilot Prera Café (${formatKes(pilotPreraProduct.priceKes)})` },
                    { id: 'iroshizuku', label: `24 Iroshizuku Inks (${formatKes(iroshizukuProduct.priceKes)})` },
                    { id: 'pilot-30ml', label: `Pilot 30ml Inks (${formatKes(pilot30mlInkProduct.priceKes)})` },
                    { id: 'con40', label: `CON-40 Converter (${formatKes(pilotCon40Product.priceKes)})` },
                    { id: 'waterman', label: `Waterman Inks (${formatKes(watermanInkProduct.priceKes)})` },
                  ] as const
                ).map((series) => {
                  const active = activeSeriesView === series.id;
                  return (
                    <button
                      key={series.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveSeriesView(series.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'border-[#0A2246] bg-[#0A2246] text-white'
                          : 'border-[#E6E1D8] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                      }`}
                    >
                      {series.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeSeriesView === 'wishlist'}
                  onClick={() => setActiveSeriesView('wishlist')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSeriesView === 'wishlist'
                      ? 'border-[#C88A2E] bg-[#0A2246] text-white'
                      : 'border-[#C88A2E]/60 bg-white text-[#0A2246] hover:border-[#C88A2E]'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      wishlist.length > 0 ? 'fill-[#C88A2E] text-[#C88A2E]' : 'text-[#C88A2E]'
                    }`}
                  />
                  <span className="font-mono-tabular">Saved Wishlist ({wishlist.length})</span>
                </button>
              </div>
            </div>

            {/* Active Header Search Filter Indicator Bar */}
            {normalizedSearch && (
              <div className="mb-8 px-4 py-3 bg-white border border-[#0A2246]/30 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#171614]">
                  <Search className="w-3.5 h-3.5 text-[#0A2246]" />
                  <span>
                    Filtering catalog by{' '}
                    <strong className="text-[#0A2246]">"{searchQuery.trim()}"</strong> ·{' '}
                    <span className="font-mono-tabular">
                      {filteredProducts.length} instrument series &amp; {filteredInkVariety.length}{' '}
                      Iroshizuku ink shades matched
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#0A2246] bg-[#F3EFE8] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              </div>
            )}

            {/* SAVED WISHLIST PERSISTENT VIEW */}
            {activeSeriesView === 'wishlist' && (
              <div className="mb-14 bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E1D8]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B58435]">
                      Persisted Across Sessions · Local Storage
                    </p>
                    <h3 className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#0A2246] mt-1">
                      Your Saved Writing Instruments &amp; Inks ({wishlist.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {wishlist.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setWishlist([])}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C5852] hover:text-red-700 border border-[#DCD5C7] rounded bg-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Wishlist</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveSeriesView('all')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#0A2246] text-white rounded hover:bg-[#133468] transition-colors cursor-pointer"
                    >
                      Back to All Series
                    </button>
                  </div>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="w-10 h-10 text-[#C88A2E] stroke-[1.25] mx-auto mb-3" />
                    <p className="font-serif-display text-xl text-[#0A2246]">
                      Your Wishlist is Currently Empty
                    </p>
                    <p className="text-xs text-[#6E6A63] mt-1 max-w-md mx-auto leading-relaxed">
                      Click the “Add to Wishlist” heart button on any Pilot Prera, Kakuno fountain
                      pen, CON-40 converter, Iroshizuku ink bottle, or Waterman ink bottle to save
                      it here across visits.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {wishlist.map((item) => {
                      const matchedProduct = FEATURED_PRODUCTS.find(
                        (p) => p.id === item.productId
                      );
                      const matchedVariant = matchedProduct?.variants.find(
                        (v) => v.id === item.variantId
                      );

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center">
                              <ResilientImage
                                src={item.image}
                                alt={`${item.productName} — ${item.variantLabel}`}
                                fallbackTitle={item.productName}
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveWishlistItem(item.id)}
                                title="Remove from Wishlist"
                                className="absolute top-3 right-3 p-2 rounded-full bg-[#FAF8F5] border border-[#E6E1D8] text-[#C88A2E] hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Heart className="w-4 h-4 fill-[#C88A2E]" />
                              </button>
                            </div>
                            <div className="p-5">
                              <div className="text-xs text-[#6E6A63]">{item.category}</div>
                              <div className="flex items-baseline justify-between gap-2 mt-1">
                                <h4 className="text-base font-semibold text-[#0A2246]">
                                  {item.productName}
                                </h4>
                                <span className="font-mono-tabular text-sm font-semibold text-[#0A2246]">
                                  {formatKes(item.priceKes)}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-[#B58435] mt-1">
                                {item.variantLabel}
                                {item.nibSize ? ` · ${item.nibSize} Nib` : ''}
                              </p>
                              <p className="text-xs text-[#5C5852] mt-1.5 line-clamp-2">
                                {item.sublabel}
                              </p>
                            </div>
                          </div>
                          <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                            {matchedProduct && matchedVariant && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddToCart(
                                    matchedProduct,
                                    matchedVariant,
                                    item.nibSize,
                                    true
                                  )
                                }
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-[#0A2246] hover:bg-[#133468] text-white transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Move to Bag</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveWishlistItem(item.id)}
                              className="px-3 py-2.5 text-xs font-medium text-[#5C5852] hover:text-red-700 border border-[#DCD5C7] rounded bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2-Column Product Showcase Grid */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                activeSeriesView !== 'all' ? 'hidden' : ''
              }`}
            >
              {filteredProducts.map((product) => {
                const chosenVariantId =
                  selectedVariants[product.id] || product.variants[0].id;
                const chosenVariant =
                  product.variants.find((v) => v.id === chosenVariantId) ||
                  product.variants[0];
                const chosenNib: NibOption = selectedNibs[product.id] || 'Fine';
                const displayedImage =
                  activeImageByProduct[product.id] ||
                  chosenVariant.image ||
                  product.image;
                const isContainImage =
                  product.imageFit === 'contain' ||
                  displayedImage.includes('madoromi_ivory') ||
                  displayedImage.includes('madoromi_blue') ||
                  displayedImage.includes('madoromi_pink') ||
                  displayedImage.includes('madoromi_brown') ||
                  displayedImage.includes('madoromi_lightblue') ||
                  displayedImage.includes('madoromi_nib_detail');
                const feedbackKey = `${product.id}-${chosenVariant.id}-${
                  product.hasNibSelector ? chosenNib : 'none'
                }`;
                const isAdded = justAddedKey === feedbackKey;
                const isWishlisted = isItemWishlisted(product.id, chosenVariant.id);

                return (
                  <article
                    key={product.id}
                    className="group bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Product Image Slot (4:3 Uniform Aspect Ratio) */}
                      <div
                        className={`relative aspect-[4/3] w-full overflow-hidden border-b border-[#E6E1D8] ${
                          isContainImage ? 'bg-white p-4' : 'bg-[#EFECE5]'
                        }`}
                      >
                        <ResilientImage
                          src={displayedImage}
                          alt={`${product.name} — ${chosenVariant.label}`}
                          fallbackTitle={product.name}
                          className={`w-full h-full transition-transform duration-300 group-hover:scale-[1.02] ${
                            isContainImage ? 'object-contain' : 'object-cover'
                          }`}
                        />

                        {/* Gallery Thumbnail Switcher for Multi-Image Series */}
                        {product.galleryImages && product.galleryImages.length > 1 && (
                          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 bg-[#FAF8F5]/95 p-1.5 rounded border border-[#E6E1D8] w-fit max-w-[calc(100%-1.5rem)] overflow-x-auto">
                            {product.galleryImages.slice(0, 7).map((imgItem, idx) => {
                              const isCurrentImg = displayedImage === imgItem.src;
                              return (
                                <button
                                  key={imgItem.src}
                                  type="button"
                                  onClick={() => {
                                    setActiveImageByProduct((prev) => ({
                                      ...prev,
                                      [product.id]: imgItem.src,
                                    }));
                                    // If this thumbnail matches a variant's image, also sync the variant selection
                                    const matchingVar = product.variants.find(
                                      (v) => v.image === imgItem.src
                                    );
                                    if (matchingVar) {
                                      setSelectedVariants((prev) => ({
                                        ...prev,
                                        [product.id]: matchingVar.id,
                                      }));
                                    }
                                  }}
                                  title={imgItem.caption}
                                  className={`w-8 h-8 rounded overflow-hidden border transition-all cursor-pointer shrink-0 bg-white ${
                                    isCurrentImg
                                      ? 'border-[#163A5F] ring-1 ring-[#163A5F]'
                                      : 'border-[#DCD5C7] opacity-75 hover:opacity-100'
                                  }`}
                                >
                                  <img
                                    src={resolveAssetUrl(imgItem.src)}
                                    alt={imgItem.caption}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                  />
                                  <span className="sr-only">View photo {idx + 1}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const matchedInk =
                              product.id === 'pilot-iroshizuku-ink'
                                ? INK_STUDIO_SHADES.find((s) => s.id === chosenVariant.id)
                                : undefined;
                            setZoomModal({
                              src: displayedImage,
                              secondarySrc: matchedInk?.swatchImage,
                              activeView: 'primary',
                              title: `${product.name} — ${chosenVariant.label}`,
                              subtitle: chosenVariant.sublabel,
                              swatchHex: chosenVariant.swatchHex,
                              inkShadeId: matchedInk?.id,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            });
                          }}
                          title="Zoom & Inspect High-Resolution Photo"
                          className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#0A2246] hover:text-white rounded border border-[#E6E1D8] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Zoom</span>
                        </button>

                        {chosenVariant.swatchHex && (
                          <span
                            title={chosenVariant.label}
                            className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: chosenVariant.swatchHex }}
                          />
                        )}
                      </div>

                      {/* Card Body: Unboxed Metadata + Product Name + Tabular KES Price */}
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63] mb-2">
                          <span className="uppercase tracking-wider">{product.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.Origin}</span>
                          <span aria-hidden="true">·</span>
                          <VariantStockIndicator
                            stockCount={chosenVariant.stockCount}
                            availabilityLabel={product.availability}
                          />
                        </div>

                        <div className="flex items-baseline justify-between gap-4 mt-1">
                          <h3 className="text-lg font-semibold tracking-tight text-[#171614]">
                            {product.name}
                          </h3>
                          <span className="font-mono-tabular text-base font-semibold text-[#171614] whitespace-nowrap shrink-0">
                            {formatKes(product.priceKes)}
                          </span>
                        </div>

                        <p className="text-xs text-[#6E6A63] mt-0.5">{product.japaneseTitle}</p>

                        {/* Star Rating & Review Count Summary Line */}
                        {(() => {
                          const prodRevs = allProductReviews.filter(
                            (r) => r.productId === product.id
                          );
                          const avg =
                            prodRevs.length > 0
                              ? prodRevs.reduce((acc, r) => acc + r.rating, 0) /
                                prodRevs.length
                              : 5.0;
                          const isReviewsOpen = expandedCardReviews[product.id] ?? false;
                          return (
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <StarRatingDisplay rating={avg} size="xs" />
                                <span className="font-mono-tabular text-xs font-semibold text-[#0A2246]">
                                  {avg.toFixed(1)}
                                </span>
                                <span className="text-xs text-[#6E6A63]">
                                  · {prodRevs.length}{' '}
                                  {prodRevs.length === 1 ? 'Review' : 'Reviews'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCardReviews((prev) => ({
                                    ...prev,
                                    [product.id]: !prev[product.id],
                                  }))
                                }
                                className="text-xs font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer whitespace-nowrap"
                              >
                                {isReviewsOpen ? 'Hide Reviews' : 'Rate & Review'}
                              </button>
                            </div>
                          );
                        })()}

                        <p className="text-sm text-[#4A4742] mt-3 leading-relaxed">
                          {product.shortSummary}
                        </p>

                        {/* Interactive Variant Picker directly on Card */}
                        <div className="mt-5 pt-4 border-t border-[#EAE5DC]">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="block text-xs font-medium text-[#5C5852]">
                              {product.variantLabel}
                            </span>
                            <div className="flex items-center gap-3">
                              {product.id === 'pilot-kakuno-madoromi' &&
                                displayedImage !== '/assets/madoromi/madoromi_series.jpg' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveImageByProduct((prev) => ({
                                        ...prev,
                                        [product.id]: '/assets/madoromi/madoromi_series.jpg',
                                      }))
                                    }
                                    className="text-[11px] font-medium text-[#163A5F] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                                  >
                                    Show Series Photo
                                  </button>
                                )}
                              {(() => {
                                const showcaseHrefMap: Record<string, string> = {
                                  'pilot-kakuno-madoromi': '#kakuno-madoromi-showcase',
                                  'pilot-kakuno-family': '#kakuno-family-showcase',
                                  'pilot-prera': '#pilot-prera-showcase',
                                  'pilot-iroshizuku-ink': '#iroshizuku-gallery',
                                  'pilot-30ml-ink': '#pilot-30ml-showcase',
                                  'pilot-con-40': '#con40-showcase',
                                  'waterman-ink-bottle': '#waterman-ink-showcase',
                                };
                                const targetHref = showcaseHrefMap[product.id];
                                if (targetHref) {
                                  return (
                                    <a
                                      href={targetHref}
                                      className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0"
                                    >
                                      Complete Product Page ↓
                                    </a>
                                  );
                                }
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setActiveProductModal(product)}
                                    className="text-[11px] font-medium text-[#163A5F] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Complete Product Page
                                  </button>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-[118px] overflow-y-auto pr-1">
                            {product.variants.map((variant) => {
                              const isSelected = variant.id === chosenVariant.id;
                              const vStock =
                                typeof variant.stockCount === 'number'
                                  ? variant.stockCount
                                  : 10;
                              const isLow = vStock > 0 && vStock < 3;
                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => handleSelectVariant(product.id, variant.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                    isSelected
                                      ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614] font-medium'
                                      : 'border-[#E6E1D8] bg-white text-[#5C5852] hover:border-[#BDB6AA]'
                                  }`}
                                >
                                  {variant.swatchHex && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                                      style={{ backgroundColor: variant.swatchHex }}
                                    />
                                  )}
                                  <span>{variant.label.split(' · ')[0]}</span>
                                  {isLow && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      <span>{vStock} left</span>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-[#6E6A63] mt-2 min-h-[1.25rem]">
                            <span className="font-medium text-[#171614]">
                              {chosenVariant.label}:{' '}
                            </span>
                            {chosenVariant.sublabel}
                          </p>
                        </div>

                        {/* Dedicated Fine / Medium Nib Size Selector for Fountain Pens */}
                        {product.hasNibSelector && (
                          <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <span className="text-xs font-medium text-[#5C5852]">
                              Select Nib Option:
                            </span>
                            <div
                              role="group"
                              aria-label={`Select Nib Size for ${product.name}`}
                              className="inline-flex items-center gap-1.5"
                            >
                              {(['Fine', 'Medium'] as const).map((nib) => {
                                const isNibSelected = chosenNib === nib;
                                return (
                                  <button
                                    key={nib}
                                    type="button"
                                    onClick={() => handleSelectNib(product.id, nib)}
                                    className={`px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                      isNibSelected
                                        ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                        : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                                    }`}
                                  >
                                    {nib === 'Fine' ? 'Fine (0.35mm)' : 'Medium (0.50mm)'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions: Add to Bag (or Notify Me if Sold Out) + Quick Buy side-by-side + Add to Wishlist */}
                    <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {(typeof chosenVariant.stockCount === 'number'
                          ? chosenVariant.stockCount
                          : 10) === 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenNotifyMeModal(
                                product,
                                chosenVariant,
                                product.hasNibSelector ? chosenNib : undefined
                              )
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Bell className="w-4 h-4" />
                            <span>
                              Notify Me When Available
                              {product.hasNibSelector ? ` (${chosenNib})` : ''}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToCart(
                                product,
                                chosenVariant,
                                product.hasNibSelector ? chosenNib : undefined,
                                false
                              )
                            }
                            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isAdded
                                ? 'bg-[#1D5B43] text-white'
                                : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added to Bag</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>
                                  Add to Bag
                                  {product.hasNibSelector ? ` (${chosenNib})` : ''} ·{' '}
                                  {formatKes(product.priceKes)}
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setQuickBuyProduct(product)}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                          <span>Quick Buy</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleWishlist(
                              product,
                              chosenVariant,
                              product.hasNibSelector ? chosenNib : undefined
                            )
                          }
                          aria-pressed={isWishlisted}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveProductModal(product)}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded border border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Details &amp; Reviews</span>
                        </button>
                      </div>

                      {/* Expandable Customer Reviews Component directly on Product Card */}
                      {expandedCardReviews[product.id] && (
                        <CustomerReviewsIsland
                          product={product}
                          reviews={allProductReviews}
                          currentUser={
                            memberProfile
                              ? {
                                  uid: firebaseUser?.uid || memberProfile.uid,
                                  name: memberProfile.name,
                                  emailOrPhone: memberProfile.emailOrPhone,
                                  isFirebaseAuthenticated: Boolean(firebaseUser),
                                }
                              : null
                          }
                          isSigningIn={isSigningIn}
                          onGoogleSignIn={handleGoogleSignIn}
                          onQuickMemberSignIn={handleQuickMemberSignInForReviews}
                          onSubmitReview={handleSubmitProductReview}
                          onDeleteReview={handleDeleteProductReview}
                          compact={true}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* PILOT KAKUNO MADOROMI SERIES — INDIVIDUAL ONE-BY-ONE PEN SHOWCASE */}
            <div
              id="kakuno-madoromi-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'madoromi'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    万年筆 カクノ まどろみカラー · Limited Slumber Lineup (KES 3,200)
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot Kakuno Madoromi Series — Every Pen One by One
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Inspired by serene twilight slumber moments, each Limited Edition Madoromi
                    Kakuno pairs a dreamy translucent pastel barrel with an exclusive{' '}
                    <strong>Gold-Tone Smiley Stainless Steel Nib</strong>. Select{' '}
                    <strong>Fine (0.35mm)</strong> or <strong>Medium (0.50mm)</strong> on any
                    Madoromi shade below.
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                    Gold-Tone Smiley Nib · Includes 1× Black Cartridge
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart(
                        pilotCon40Product,
                        pilotCon40Product.variants[0],
                        undefined,
                        false,
                        'madoromi-con40-upsell'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      justAddedKey === 'madoromi-con40-upsell'
                        ? 'border-[#1D5B43] bg-[#1D5B43] text-white'
                        : 'border-[#163A5F] bg-white text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
                    }`}
                  >
                    {justAddedKey === 'madoromi-con40-upsell' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added CON-40 Converter (KES 1,200)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pilot CON-40 Twist Converter · KES 1,200</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT KAKUNO MADOROMI SERIES */}
              {renderUniformProductPage(kakunoMadoromiProduct)}

              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
                  Explore All 5 Kakuno Madoromi Finishes One by One ({formatKes(kakunoMadoromiProduct.priceKes)} Each)
                </h4>
                <span className="text-xs text-[#6E6A63] hidden sm:inline">
                  Ivory · Blue · Pink · Brown · Light Blue (Gold-Tone Smiley Nib)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kakunoMadoromiProduct.variants.map((variant) => {
                  const activeNib: NibOption = selectedNibs[variant.id] || 'Medium';
                  const customKey = `madoromi-grid-${variant.id}-${activeNib}`;
                  const isAdded = justAddedKey === customKey;
                  const isWishlisted = isItemWishlisted(kakunoMadoromiProduct.id, variant.id);

                  return (
                    <div
                      key={variant.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Individual Madoromi Pen Image */}
                        <div
                          onClick={() =>
                            setZoomModal({
                              src: variant.image || kakunoMadoromiProduct.image,
                              activeView: 'primary',
                              title: `Pilot Kakuno Madoromi — ${variant.label} (${activeNib} Nib)`,
                              subtitle: variant.sublabel,
                              swatchHex: variant.swatchHex,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={variant.image || kakunoMadoromiProduct.image}
                            alt={`Pilot Kakuno Madoromi Series — ${variant.label} (${activeNib} Nib)`}
                            fallbackTitle={`Kakuno ${variant.label}`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: variant.image || kakunoMadoromiProduct.image,
                                activeView: 'primary',
                                title: `Pilot Kakuno Madoromi — ${variant.label} (${activeNib} Nib)`,
                                subtitle: variant.sublabel,
                                swatchHex: variant.swatchHex,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 50,
                              });
                            }}
                            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>
                          {variant.swatchHex && (
                            <span
                              title={variant.label}
                              className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: variant.swatchHex }}
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                            <span>Kakuno Madoromi LE</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#8A6421] font-medium">
                              {variant.nibEngraving || 'Gold-Tone Smiley Nib'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator stockCount={variant.stockCount} compact />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1.5">
                            <h4 className="text-base font-semibold text-[#171614]">
                              Pilot Kakuno — {variant.label}
                            </h4>
                            <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              KES 3,200
                            </span>
                          </div>

                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                            {variant.sublabel}
                          </p>

                          {/* Individual Fine / Medium Nib Selector */}
                          <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#5C5852]">Nib Size:</span>
                            <div className="inline-flex items-center gap-1.5">
                              {(['Fine', 'Medium'] as const).map((nib) => {
                                const selected = activeNib === nib;
                                return (
                                  <button
                                    key={nib}
                                    type="button"
                                    onClick={() => handleSelectNib(variant.id, nib)}
                                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                      selected
                                        ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                        : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                                    }`}
                                  >
                                    {nib} ({nib === 'Fine' ? '0.35mm' : '0.50mm'})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {(typeof variant.stockCount === 'number'
                            ? variant.stockCount
                            : 10) === 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenNotifyMeModal(
                                  kakunoMadoromiProduct,
                                  variant,
                                  activeNib
                                )
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Notify Me ({activeNib})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectVariant('pilot-kakuno-madoromi', variant.id);
                                handleSelectNib('pilot-kakuno-madoromi', activeNib);
                                handleAddToCart(
                                  kakunoMadoromiProduct,
                                  variant,
                                  activeNib,
                                  false,
                                  customKey
                                );
                              }}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                isAdded
                                  ? 'bg-[#1D5B43] text-white'
                                  : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added ({activeNib})</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add to Bag ({activeNib})</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('pilot-kakuno-madoromi', variant.id);
                              handleSelectNib('pilot-kakuno-madoromi', activeNib);
                              setQuickBuyProduct(kakunoMadoromiProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleWishlist(kakunoMadoromiProduct, variant, activeNib)
                          }
                          aria-pressed={isWishlisted}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 6th Card: Full 5-Pen Madoromi Slumber Lineup Comparison Card */}
                <div className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-square w-full bg-white p-4 border-b border-[#E6E1D8] flex flex-col items-center justify-center gap-2">
                      <ResilientImage
                        src="/assets/madoromi/madoromi_nib_detail.jpg"
                        alt="Pilot Kakuno Madoromi Series — All 5 Translucent Pastel Shades Side by Side"
                        fallbackTitle="Madoromi 5-Pen Lineup"
                        className="w-full h-1/2 object-contain"
                      />
                      <ResilientImage
                        src="/assets/madoromi/madoromi_series.jpg"
                        alt="Pilot Kakuno Madoromi Slumber Series Full Collection"
                        fallbackTitle="Madoromi Slumber Collection"
                        className="w-full h-1/2 object-cover rounded"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                        <span>Complete 5-Color Overview</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#8A6421] font-medium">Fine &amp; Medium Nibs</span>
                      </div>

                      <h4 className="text-base font-semibold text-[#171614] mt-1.5">
                        All 5 Madoromi Shades Side-by-Side
                      </h4>

                      <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                        Compare Ivory, Blue, Pink, Brown, and Light Blue together. Every shade is
                        fitted with the signature gold-colored smiley nib in Fine (0.35mm) or Medium
                        (0.50mm).
                      </p>

                      <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between">
                        <span className="text-xs font-medium text-[#5C5852]">5 Shades:</span>
                        <div className="flex items-center gap-1.5">
                          {kakunoMadoromiProduct.variants.map((v) => (
                            <span
                              key={v.id}
                              title={v.label}
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: v.swatchHex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveProductModal(kakunoMadoromiProduct)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase rounded border border-[#0A2246] text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Madoromi Gallery &amp; Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleWishlist(
                          kakunoMadoromiProduct,
                          kakunoMadoromiProduct.variants[0],
                          'Medium'
                        )
                      }
                      aria-pressed={isItemWishlisted(
                        kakunoMadoromiProduct.id,
                        kakunoMadoromiProduct.variants[0].id
                      )}
                      className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        isItemWishlisted(
                          kakunoMadoromiProduct.id,
                          kakunoMadoromiProduct.variants[0].id
                        )
                          ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                          : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isItemWishlisted(
                            kakunoMadoromiProduct.id,
                            kakunoMadoromiProduct.variants[0].id
                          )
                            ? 'fill-[#C88A2E] text-[#C88A2E]'
                            : ''
                        }`}
                      />
                      <span>
                        {isItemWishlisted(
                          kakunoMadoromiProduct.id,
                          kakunoMadoromiProduct.variants[0].id
                        )
                          ? 'In Wishlist'
                          : 'Add to Wishlist'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PILOT KAKUNO FAMILY SERIES — INDIVIDUAL ONE-BY-ONE PEN SHOWCASE */}
            <div
              id="kakuno-family-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'family'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    万年筆 カクノ ファミリーシリーズ · Individual Demonstrator Lineup (KES 2,500)
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot Kakuno Family Series — Every Pen One by One
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Each member of the Pilot Kakuno Family Series features a crystal-clear
                    translucent hexagonal body and its own laser-etched character expression on the
                    stainless steel nib. Select <strong>Fine (0.35mm)</strong> or{' '}
                    <strong>Medium (0.50mm)</strong> on any pen below.
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                    Includes 1× Black Ink Cartridge · CON-40 Converter Compatible
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart(
                        pilotCon40Product,
                        pilotCon40Product.variants[0],
                        undefined,
                        false,
                        'family-con40-upsell'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      justAddedKey === 'family-con40-upsell'
                        ? 'border-[#1D5B43] bg-[#1D5B43] text-white'
                        : 'border-[#163A5F] bg-white text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
                    }`}
                  >
                    {justAddedKey === 'family-con40-upsell' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added CON-40 Converter (KES 1,200)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pilot CON-40 Twist Converter · KES 1,200</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT KAKUNO FAMILY SERIES */}
              {renderUniformProductPage(kakunoFamilyProduct)}

              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
                  Explore All 6 Kakuno Family Pens One by One ({formatKes(kakunoFamilyProduct.priceKes)} Each)
                </h4>
                <span className="text-xs text-[#6E6A63] hidden sm:inline">
                  Papa Blue · Mama Red · Boy Green · Girl Pink · Baby Yellow · Clear
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kakunoFamilyProduct.variants.map((variant) => {
                  const activeNib: NibOption = selectedNibs[variant.id] || 'Fine';
                  const customKey = `family-grid-${variant.id}-${activeNib}`;
                  const isAdded = justAddedKey === customKey;
                  const isWishlisted = isItemWishlisted(kakunoFamilyProduct.id, variant.id);

                  return (
                    <div
                      key={variant.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Individual Goldspot Pen Image */}
                        <div
                          onClick={() =>
                            setZoomModal({
                              src: variant.image || kakunoFamilyProduct.image,
                              activeView: 'primary',
                              title: `Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`,
                              subtitle: `${variant.nibEngraving} · ${variant.sublabel}`,
                              swatchHex: variant.swatchHex,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={variant.image || kakunoFamilyProduct.image}
                            alt={`Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`}
                            fallbackTitle={`Kakuno ${variant.label}`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: variant.image || kakunoFamilyProduct.image,
                                activeView: 'primary',
                                title: `Pilot Kakuno Family Series — ${variant.label} (${activeNib} Nib)`,
                                subtitle: `${variant.nibEngraving} · ${variant.sublabel}`,
                                swatchHex: variant.swatchHex,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 50,
                              });
                            }}
                            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>
                          {variant.swatchHex && (
                            <span
                              title={variant.label}
                              className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: variant.swatchHex }}
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                            <span>Kakuno Family Series</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#163A5F] font-medium">
                              {variant.nibEngraving}
                            </span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator stockCount={variant.stockCount} compact />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1.5">
                            <h4 className="text-base font-semibold text-[#171614]">
                              Pilot Kakuno — {variant.label}
                            </h4>
                            <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              KES 2,500
                            </span>
                          </div>

                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                            {variant.sublabel}
                          </p>

                          {/* Individual Fine / Medium Nib Selector */}
                          <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#5C5852]">Nib Size:</span>
                            <div className="inline-flex items-center gap-1.5">
                              {(['Fine', 'Medium'] as const).map((nib) => {
                                const selected = activeNib === nib;
                                return (
                                  <button
                                    key={nib}
                                    type="button"
                                    onClick={() => handleSelectNib(variant.id, nib)}
                                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                      selected
                                        ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                        : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                                    }`}
                                  >
                                    {nib} ({nib === 'Fine' ? '0.35mm' : '0.50mm'})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {(typeof variant.stockCount === 'number'
                            ? variant.stockCount
                            : 10) === 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenNotifyMeModal(
                                  kakunoFamilyProduct,
                                  variant,
                                  activeNib
                                )
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Notify Me ({activeNib})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectVariant('pilot-kakuno-family', variant.id);
                                handleSelectNib('pilot-kakuno-family', activeNib);
                                handleAddToCart(
                                  kakunoFamilyProduct,
                                  variant,
                                  activeNib,
                                  false,
                                  customKey
                                );
                              }}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                isAdded
                                  ? 'bg-[#1D5B43] text-white'
                                  : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added ({activeNib})</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add to Bag ({activeNib})</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('pilot-kakuno-family', variant.id);
                              handleSelectNib('pilot-kakuno-family', activeNib);
                              setQuickBuyProduct(kakunoFamilyProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleWishlist(kakunoFamilyProduct, variant, activeNib)
                          }
                          aria-pressed={isWishlisted}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PILOT PRERA CAFÉ SERIES — UNIFORM PRODUCT PAGE & SERIES SHOWCASE (KES 8,500) */}
            <div
              id="pilot-prera-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'prera'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    万年筆 プレラ · Translucent Café Demonstrator Lineup (CON-40 Included · {formatKes(pilotPreraProduct.priceKes)})
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot Prera Café Series — Complete Product Page
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Inspired by the warm atmosphere of an artisanal café. Every Pilot Prera in{' '}
                    <strong>Empress Teal</strong>, <strong>Cinnamon Brown</strong>, and{' '}
                    <strong>Porcelain White</strong> features a translucent Japanese resin barrel,
                    cushioned snap-cap closure, and includes a genuine{' '}
                    <strong>Pilot CON-40 twist converter</strong> and ink cartridge.
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                    Includes Pilot CON-40 Converter &amp; Black Ink Cartridge
                  </span>
                </div>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT PRERA CAFÉ SERIES (WORKS FOR ALL 3 FINISHES) */}
              {renderUniformProductPage(pilotPreraProduct)}

              {/* COMPLETE PILOT PRERA CAFÉ LINEUP — EVERY PEN ONE BY ONE */}
              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
                  Explore All 3 Pilot Prera Café Finishes One by One ({formatKes(pilotPreraProduct.priceKes)} Each)
                </h4>
                <span className="text-xs text-[#6E6A63] hidden sm:inline">
                  Empress Teal · Cinnamon Brown · Porcelain White (All Include CON-40 Converter)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pilotPreraProduct.variants.map((variant) => {
                  const activeNib: NibOption = selectedNibs[variant.id] || 'Medium';
                  const customKey = `prera-grid-${variant.id}-${activeNib}`;
                  const isAdded = justAddedKey === customKey;
                  const isWishlisted = isItemWishlisted(pilotPreraProduct.id, variant.id);

                  return (
                    <div
                      key={variant.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        <div
                          onClick={() =>
                            setZoomModal({
                              src: variant.image || pilotPreraProduct.image,
                              activeView: 'primary',
                              title: `Pilot Prera — ${variant.label} (${activeNib} Nib)`,
                              subtitle: variant.sublabel,
                              swatchHex: variant.swatchHex,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={variant.image || pilotPreraProduct.image}
                            alt={`Pilot Prera Fountain Pen — ${variant.label} (${activeNib} Nib)`}
                            fallbackTitle={`Pilot Prera ${variant.label}`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: variant.image || pilotPreraProduct.image,
                                activeView: 'primary',
                                title: `Pilot Prera — ${variant.label} (${activeNib} Nib)`,
                                subtitle: variant.sublabel,
                                swatchHex: variant.swatchHex,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 50,
                              });
                            }}
                            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>
                          {variant.swatchHex && (
                            <span
                              title={variant.label}
                              className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: variant.swatchHex }}
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                            <span>Pilot Prera Japan</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#163A5F] font-medium">
                              CON-40 Included
                            </span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator stockCount={variant.stockCount} compact />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1.5">
                            <h4 className="text-base font-semibold text-[#171614]">
                              Pilot Prera — {variant.label.split(' · ')[0]}
                            </h4>
                            <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              KES 8,500
                            </span>
                          </div>

                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                            {variant.sublabel}
                          </p>

                          {/* Individual Fine / Medium Nib Selector */}
                          <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#5C5852]">Nib Size:</span>
                            <div className="inline-flex items-center gap-1.5">
                              {(['Fine', 'Medium'] as const).map((nib) => {
                                const selected = activeNib === nib;
                                return (
                                  <button
                                    key={nib}
                                    type="button"
                                    onClick={() => handleSelectNib(variant.id, nib)}
                                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                      selected
                                        ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                        : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                                    }`}
                                  >
                                    {nib} ({nib === 'Fine' ? '0.35mm' : '0.50mm'})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('pilot-prera', variant.id);
                              handleSelectNib('pilot-prera', activeNib);
                              handleAddToCart(
                                pilotPreraProduct,
                                variant,
                                activeNib,
                                false,
                                customKey
                              );
                            }}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isAdded
                                ? 'bg-[#1D5B43] text-white'
                                : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added ({activeNib})</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Bag ({activeNib})</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('pilot-prera', variant.id);
                              handleSelectNib('pilot-prera', activeNib);
                              setQuickBuyProduct(pilotPreraProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleWishlist(pilotPreraProduct, variant, activeNib)
                          }
                          aria-pressed={isWishlisted}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FULL 24-SHADE PILOT IROSHIZUKU BOTTLE & SWATCH VARIETY SHOWCASE */}
            <div
              id="iroshizuku-gallery"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'iroshizuku'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    色彩雫 · Complete 24-Shade Bottled Ink Library with Handwritten Swatches (50ml · KES 6,000)
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot Iroshizuku — Full 24-Color Swatch &amp; Bottle Variety
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Each 50ml glass bottle is shown alongside its genuine handwritten Pilot
                    Iroshizuku ink swatch card so you can see the true wet color, shading, and
                    splatter detail. Explore the <strong>24-Color Chromatic Spectrum Ribbon</strong>{' '}
                    below, <strong>hover over any bottle to magnify (2.2×)</strong>, or click{' '}
                    <strong>Zoom</strong> for fullscreen 3× inspection.
                  </p>
                </div>

                {/* Color Family Segmented Filter */}
                <div
                  role="tablist"
                  aria-label="Filter Iroshizuku inks by color family"
                  className="flex flex-wrap items-center gap-1 p-1 bg-[#E6E1D8] rounded-md self-start lg:self-auto"
                >
                  {INK_COLOR_FAMILIES.map((family) => {
                    const active = activeInkFamily === family;
                    return (
                      <button
                        key={family}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveInkFamily(family)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#FAF8F5] text-[#171614] shadow-xs'
                            : 'text-[#5C5852] hover:text-[#171614]'
                        }`}
                      >
                        {family}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT IROSHIZUKU 50ML COLLECTION */}
              {renderUniformProductPage(iroshizukuProduct)}

              {/* ASTRO ISLAND: Interactive 24-Color Chromatic Swatch Ribbon & Dual Spotlight Stage */}
              <ChromaticInkRibbonIsland
                justAddedKey={justAddedKey}
                onAddInkShade={handleAddInkShadeDirectly}
                isShadeWishlisted={(shadeId) =>
                  isItemWishlisted('pilot-iroshizuku-ink', shadeId)
                }
                onToggleShadeWishlist={handleToggleInkShadeWishlist}
                onOpenZoomModal={(payload) =>
                  setZoomModal({
                    ...payload,
                    zoomLevel: 2,
                    panX: 50,
                    panY: 45,
                  })
                }
              />

              {/* 4-Column Bottle + Swatch Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredInkVariety.map((shade) => {
                  const feedbackKey = `pilot-iroshizuku-ink-${shade.id}`;
                  const isAdded = justAddedKey === feedbackKey;
                  const viewMode = inkCardViewMode[shade.id] || 'bottle';
                  const activeCardImg =
                    viewMode === 'swatch' ? shade.swatchImage : shade.image;
                  const isHoverZooming = hoveredInkZoom?.id === shade.id;
                  const isWishlisted = isItemWishlisted('pilot-iroshizuku-ink', shade.id);

                  return (
                    <div
                      key={shade.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Goldspot 50ml Bottle + Handwritten Swatch Image with Hover Loupe & Zoom Trigger */}
                        <div
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            setHoveredInkZoom({
                              id: shade.id,
                              x: Math.max(0, Math.min(100, x)),
                              y: Math.max(0, Math.min(100, y)),
                            });
                          }}
                          onMouseLeave={() => setHoveredInkZoom(null)}
                          onClick={() =>
                            setZoomModal({
                              src: shade.image,
                              secondarySrc: shade.swatchImage,
                              activeView: viewMode === 'swatch' ? 'secondary' : 'primary',
                              title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                              subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                              swatchHex: shade.hex,
                              inkShadeId: shade.id,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 45,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-4 border-b border-[#E6E1D8] flex items-center justify-center overflow-hidden cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={activeCardImg}
                            alt={`Pilot Iroshizuku 50ml Ink — ${shade.name} (${shade.kanji}) ${shade.meaning}`}
                            fallbackTitle={`Iroshizuku ${shade.name}`}
                            className="w-full h-full object-contain transition-transform duration-150"
                          />

                          {/* Interactive 2.25x Hover Magnifier Overlay */}
                          {isHoverZooming && hoveredInkZoom && (
                            <div
                              className="pointer-events-none absolute inset-0 bg-white z-10 hidden sm:block"
                              style={{
                                backgroundImage: `url(${resolveAssetUrl(activeCardImg)})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '225%',
                                backgroundPosition: `${hoveredInkZoom.x}% ${hoveredInkZoom.y}%`,
                              }}
                            />
                          )}

                          {/* Top-Left Zoom Lightbox Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: shade.image,
                                secondarySrc: shade.swatchImage,
                                activeView: viewMode === 'swatch' ? 'secondary' : 'primary',
                                title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                                subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                                swatchHex: shade.hex,
                                inkShadeId: shade.id,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 45,
                              });
                            }}
                            title={`Zoom & Inspect ${shade.name} Ink Swatch`}
                            className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>

                          {/* Color Swatch Disc */}
                          <span
                            title={`Ink Swatch: ${shade.name}`}
                            className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: shade.hex }}
                          />

                          {/* Bottom Segmented Switcher: Bottle + Swatch vs Swatch Close-Up */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-2.5 inset-x-2.5 z-20 flex items-center justify-center gap-1 bg-[#FAF8F5]/95 p-1 rounded border border-[#E6E1D8] shadow-xs"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setInkCardViewMode((prev) => ({
                                  ...prev,
                                  [shade.id]: 'bottle',
                                }))
                              }
                              className={`flex-1 py-1 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                viewMode === 'bottle'
                                  ? 'bg-[#163A5F] text-white'
                                  : 'text-[#5C5852] hover:text-[#171614]'
                              }`}
                            >
                              Bottle + Swatch
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setInkCardViewMode((prev) => ({
                                  ...prev,
                                  [shade.id]: 'swatch',
                                }))
                              }
                              className={`flex-1 py-1 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                viewMode === 'swatch'
                                  ? 'bg-[#163A5F] text-white'
                                  : 'text-[#5C5852] hover:text-[#171614]'
                              }`}
                            >
                              Swatch Close-Up
                            </button>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6E6A63]">
                            <span>{shade.colorFamily}</span>
                            <span aria-hidden="true">·</span>
                            <span>50ml</span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator
                              stockCount={
                                iroshizukuProduct.variants.find((v) => v.id === shade.id)
                                  ?.stockCount
                              }
                              compact
                            />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1">
                            <h4 className="text-base font-semibold text-[#171614]">
                              {shade.name}{' '}
                              <span className="font-normal text-xs text-[#6E6A63]">
                                ({shade.kanji})
                              </span>
                            </h4>
                            <span className="font-mono-tabular text-xs font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              KES 6,000
                            </span>
                          </div>

                          <p className="text-xs font-medium text-[#163A5F] mt-0.5">
                            {shade.meaning}
                          </p>
                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed line-clamp-2">
                            {shade.sheenNote}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const matchedVar =
                              iroshizukuProduct.variants.find((v) => v.id === shade.id) ||
                              iroshizukuProduct.variants[0];
                            const shadeStock =
                              typeof matchedVar?.stockCount === 'number'
                                ? matchedVar.stockCount
                                : 10;
                            if (shadeStock === 0) {
                              return (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenNotifyMeModal(iroshizukuProduct, matchedVar)
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>Notify Me</span>
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => handleAddInkShadeDirectly(shade)}
                                className={`flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  isAdded
                                    ? 'bg-[#1D5B43] text-white'
                                    : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add to Bag</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={() => {
                              const inkProduct = FEATURED_PRODUCTS.find(
                                (p) => p.id === 'pilot-iroshizuku-ink'
                              )!;
                              handleSelectVariant('pilot-iroshizuku-ink', shade.id);
                              setQuickBuyProduct(inkProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleInkShadeWishlist(shade)}
                            aria-pressed={isWishlisted}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                              isWishlisted
                                ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                                : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                              }`}
                            />
                            <span>{isWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setZoomModal({
                                src: shade.image,
                                secondarySrc: shade.swatchImage,
                                activeView: 'secondary',
                                title: `Pilot Iroshizuku — ${shade.name} (${shade.kanji})`,
                                subtitle: `${shade.meaning} · ${shade.sheenNote}`,
                                swatchHex: shade.hex,
                                inkShadeId: shade.id,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 45,
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-medium rounded border border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Swatch Card
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ASTRO ISLAND: 3-Bottle 50ml Iroshizuku Ink Mixing Set Builder (KES 20,000 Bundle · 10% Privilege) */}
              <InkMixingSetBuilderIsland
                onAddInkMixingSetToCart={handleAddBundleToCart}
              />
            </div>

            {/* PILOT CON-40 TWIST PISTON CONVERTER — UNIFORM PRODUCT PAGE & COMPATIBILITY SHOWCASE */}
            <div
              id="con40-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'con40'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    コンバーター CON-40 · Official Bottled Ink Piston Converter ({formatKes(pilotCon40Product.priceKes)})
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot CON-40 Twist Converter — Complete Product Page
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Fill any Pilot Kakuno, Prera, Explorer, or Vanishing Point directly from
                    50ml glass ink bottles. Engineered in Japan with four stainless steel
                    agitator beads for consistent capillary ink flow.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                  Fits All Pilot Kakuno, Prera &amp; Vanishing Point Pens
                </span>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT CON-40 TWIST CONVERTER */}
              {renderUniformProductPage(pilotCon40Product)}
            </div>

            {/* WATERMAN PARIS 50ML BOTTLED INKS — UNIFORM PRODUCT PAGE & VARIETY SHOWCASE */}
            <div
              id="waterman-ink-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'waterman'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    Encre de Paris · Classic 50ml Multi-Faceted Glass Bottles ({formatKes(watermanInkProduct.priceKes)} per Bottle)
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Waterman Paris 50ml Bottled Inks — Complete Product Page
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Engineered with angled side facets so you can tip the bottle on its side for
                    effortless converter filling when ink runs low. Safe, smooth-flowing everyday
                    inks for all Pilot and Waterman fountain pens at{' '}
                    <strong>{formatKes(watermanInkProduct.priceKes)}</strong> per 50ml bottle.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                  50ml Multi-Faceted Glass Flacon · Made in France
                </span>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — WATERMAN PARIS 50ML BOTTLED INKS */}
              {renderUniformProductPage(watermanInkProduct)}

              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
                  Explore All 3 Waterman Paris 50ml Shades One by One ({formatKes(watermanInkProduct.priceKes)} Each)
                </h4>
                <span className="text-xs text-[#6E6A63] hidden sm:inline">
                  Serenity Blue · Intense Black · Audacious Red
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {watermanInkProduct.variants.map((variant) => {
                  const customKey = `waterman-grid-${variant.id}`;
                  const isAdded = justAddedKey === customKey;
                  const shortShadeName = variant.label.split(' · ')[0];
                  const frenchTitle = variant.label.split(' · ')[1] || 'Encre de Paris';
                  const isWishlisted = isItemWishlisted(watermanInkProduct.id, variant.id);

                  return (
                    <div
                      key={variant.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Cult Pens Waterman 50ml Bottle Photo with Zoom Trigger */}
                        <div
                          onClick={() =>
                            setZoomModal({
                              src: variant.image || watermanInkProduct.image,
                              activeView: 'primary',
                              title: `Waterman Paris 50ml Ink — ${variant.label}`,
                              subtitle: variant.sublabel,
                              swatchHex: variant.swatchHex,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={variant.image || watermanInkProduct.image}
                            alt={`Waterman Paris 50ml Bottled Ink — ${variant.label}`}
                            fallbackTitle={`Waterman ${shortShadeName}`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: variant.image || watermanInkProduct.image,
                                activeView: 'primary',
                                title: `Waterman Paris 50ml Ink — ${variant.label}`,
                                subtitle: variant.sublabel,
                                swatchHex: variant.swatchHex,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 50,
                              });
                            }}
                            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>
                          {variant.swatchHex && (
                            <span
                              title={variant.label}
                              className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: variant.swatchHex }}
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                            <span>Waterman Paris · 50ml</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#163A5F] font-medium">{frenchTitle}</span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator stockCount={variant.stockCount} compact />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1.5">
                            <h4 className="text-base font-semibold text-[#171614]">
                              Waterman — {shortShadeName}
                            </h4>
                            <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              KES 2,000
                            </span>
                          </div>

                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                            {variant.sublabel}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('waterman-ink-bottle', variant.id);
                              handleAddToCart(
                                watermanInkProduct,
                                variant,
                                undefined,
                                false,
                                customKey
                              );
                            }}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isAdded
                                ? 'bg-[#1D5B43] text-white'
                                : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('waterman-ink-bottle', variant.id);
                              setQuickBuyProduct(watermanInkProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(watermanInkProduct, variant)}
                          aria-pressed={isWishlisted}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PILOT 30ML CLASSIC BOTTLED INKS — BLACK, BLUE & BLUE-BLACK (KES 1,200) */}
            <div
              id="pilot-30ml-showcase"
              className={`${
                activeSeriesView === 'all'
                  ? 'mt-20 pt-16 border-t border-[#DCD5C7]'
                  : activeSeriesView === 'pilot-30ml'
                    ? 'mt-4'
                    : 'hidden'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6E6A63] mb-2">
                    パイロット インキ 30ml · Everyday Classic Japanese Glass Bottles ({formatKes(pilot30mlInkProduct.priceKes)} per Bottle)
                  </p>
                  <h3
                    className="font-serif-display text-2xl lg:text-4xl font-semibold text-[#171614] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Pilot 30ml Bottled Inks — Complete Product Page
                  </h3>
                  <p className="text-sm text-[#4A4742] mt-2 max-w-2xl">
                    Compact, reliable 30ml glass ink bottles formulated in Japan for daily
                    correspondence and journaling. Available in{' '}
                    <strong>Black (INK-30-B)</strong>, <strong>Blue (INK-30-L)</strong>, and{' '}
                    <strong>Blue-Black (INK-30-BB)</strong> at{' '}
                    <strong>{formatKes(pilot30mlInkProduct.priceKes)}</strong> each.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs text-[#163A5F] font-medium">
                  30ml Japanese Glass Flacon · Made in Japan
                </span>
              </div>

              {/* UNIFORM COMPLETE PRODUCT PAGE — PILOT 30ML BOTTLED INK */}
              {renderUniformProductPage(pilot30mlInkProduct)}

              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-serif-display text-xl lg:text-2xl font-semibold text-[#0A2246]">
                  Explore All 3 Pilot 30ml Shades One by One ({formatKes(pilot30mlInkProduct.priceKes)} Each)
                </h4>
                <span className="text-xs text-[#6E6A63] hidden sm:inline">
                  Black · Blue · Blue-Black (CON-40 Compatible)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {pilot30mlInkProduct.variants.map((variant) => {
                  const customKey = `pilot30ml-grid-${variant.id}`;
                  const isAdded = justAddedKey === customKey;
                  const shortShadeName = variant.label.split(' · ')[0];
                  const skuNote = variant.label.split(' · ')[1] || 'Made in Japan';
                  const isWishlisted = isItemWishlisted(pilot30mlInkProduct.id, variant.id);
                  const shadeStock =
                    typeof variant.stockCount === 'number' ? variant.stockCount : 10;

                  return (
                    <div
                      key={variant.id}
                      className="bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        <div
                          onClick={() =>
                            setZoomModal({
                              src: variant.image || pilot30mlInkProduct.image,
                              activeView: 'primary',
                              title: `Pilot 30ml Bottled Ink — ${variant.label}`,
                              subtitle: variant.sublabel,
                              swatchHex: variant.swatchHex,
                              zoomLevel: 2,
                              panX: 50,
                              panY: 50,
                            })
                          }
                          className="relative aspect-square w-full bg-white p-6 border-b border-[#E6E1D8] flex items-center justify-center cursor-zoom-in group"
                        >
                          <ResilientImage
                            src={variant.image || pilot30mlInkProduct.image}
                            alt={`Pilot 30ml Bottled Ink — ${variant.label}`}
                            fallbackTitle={`Pilot 30ml ${shortShadeName}`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomModal({
                                src: variant.image || pilot30mlInkProduct.image,
                                activeView: 'primary',
                                title: `Pilot 30ml Bottled Ink — ${variant.label}`,
                                subtitle: variant.sublabel,
                                swatchHex: variant.swatchHex,
                                zoomLevel: 2,
                                panX: 50,
                                panY: 50,
                              });
                            }}
                            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Zoom</span>
                          </button>
                          {variant.swatchHex && (
                            <span
                              title={variant.label}
                              className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: variant.swatchHex }}
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                            <span>Pilot Japan · 30ml</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#163A5F] font-medium">{skuNote}</span>
                            <span aria-hidden="true">·</span>
                            <VariantStockIndicator stockCount={variant.stockCount} compact />
                          </div>

                          <div className="flex items-baseline justify-between gap-2 mt-1.5">
                            <h4 className="text-base font-semibold text-[#171614]">
                              Pilot 30ml Ink — {shortShadeName}
                            </h4>
                            <span className="font-mono-tabular text-sm font-semibold text-[#171614] whitespace-nowrap shrink-0">
                              {formatKes(pilot30mlInkProduct.priceKes)}
                            </span>
                          </div>

                          <p className="text-xs text-[#5C5852] mt-2 leading-relaxed">
                            {variant.sublabel}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {shadeStock === 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenNotifyMeModal(pilot30mlInkProduct, variant)
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Notify Me</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectVariant('pilot-30ml-ink', variant.id);
                                handleAddToCart(
                                  pilot30mlInkProduct,
                                  variant,
                                  undefined,
                                  false,
                                  customKey
                                );
                              }}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                isAdded
                                  ? 'bg-[#1D5B43] text-white'
                                  : 'bg-[#0A2246] hover:bg-[#133468] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add to Bag</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectVariant('pilot-30ml-ink', variant.id);
                              setQuickBuyProduct(pilot30mlInkProduct);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded border border-[#0A2246] bg-white text-[#0A2246] hover:bg-[#0A2246] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C88A2E]" />
                            <span>Quick Buy</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(pilot30mlInkProduct, variant)}
                          aria-pressed={isWishlisted}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                            isWishlisted
                              ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                              : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                            }`}
                          />
                          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ASTRO ISLAND: 3-Step Complete Writing Set Builder (Pen + CON-40 + 50ml Bottled Ink) */}
            <WritingSetBuilderIsland onAddBundleToCart={handleAddBundleToCart} />
          </div>
        </section>

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
      </main>

      {/* STRUCTURED EDITORIAL FOOTER (NO DUPLICATE LOGO TEXT) */}
      <footer className="bg-[#FAF8F5] border-t border-[#E6E1D8] py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#E6E1D8] items-start">
            {/* Column 1: Single Official Brand Lockup & Provenance */}
            <div className="md:col-span-5 space-y-2.5">
              <a
                href="#top"
                aria-label="PENS R US — The Pen Specialists"
                className="inline-block"
              >
                <BrandLogoLockup size="footer" />
              </a>
              <p className="text-xs text-[#5C5852] max-w-sm leading-relaxed">
                Bringing the Art of Writing to Kenya. Authorized Nairobi purveyor of Japanese
                Pilot fountain pens, 24-shade Iroshizuku bottled inks, and Waterman Paris inks.
              </p>
            </div>

            {/* Column 2: Curated Collections */}
            <div className="md:col-span-4 space-y-2 text-xs">
              <p className="font-semibold uppercase tracking-[0.14em] text-[#0A2246]">
                Writing Instruments &amp; Inks
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#5C5852]">
                <li>
                  <a href="#kakuno-madoromi-showcase" className="hover:text-[#0A2246] transition-colors">
                    Kakuno Madoromi
                  </a>
                </li>
                <li>
                  <a href="#kakuno-family-showcase" className="hover:text-[#0A2246] transition-colors">
                    Kakuno Family
                  </a>
                </li>
                <li>
                  <a href="#pilot-prera-showcase" className="hover:text-[#0A2246] transition-colors">
                    Pilot Prera · Café
                  </a>
                </li>
                <li>
                  <a href="#iroshizuku-gallery" className="hover:text-[#0A2246] transition-colors">
                    24 Iroshizuku Inks
                  </a>
                </li>
                <li>
                  <a href="#con40-showcase" className="hover:text-[#0A2246] transition-colors">
                    Pilot CON-40 Converter
                  </a>
                </li>
                <li>
                  <a href="#waterman-ink-showcase" className="hover:text-[#0A2246] transition-colors">
                    Waterman Paris Inks
                  </a>
                </li>
                <li>
                  <a href="#pilot-30ml-showcase" className="hover:text-[#0A2246] transition-colors">
                    Pilot 30ml Bottled Inks
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Kenya Dispatch & Client Care */}
            <div className="md:col-span-3 space-y-2 text-xs text-[#5C5852]">
              <p className="font-semibold uppercase tracking-[0.14em] text-[#0A2246]">
                Nairobi &amp; Kenya Dispatch
              </p>
              <p className="leading-relaxed">
                Same-day courier across Nairobi · Overnight delivery to all 47 counties · M-Pesa
                Express &amp; Cash on Delivery.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E6A63]">
            <div className="flex items-center gap-3 flex-wrap">
              <span>© {new Date().getFullYear()} PENS R US Kenya · All Rights Reserved.</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setIsMerchantAdminOpen(true)}
                className="font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer"
              >
                {isAuthorizedAdmin
                  ? 'Merchant Admin Console (Edit Catalog & KES Prices)'
                  : 'Staff Portal'}
              </button>
            </div>
            <span className="font-mono-tabular">
              Complimentary Delivery in Nairobi &amp; Nationwide on Orders from{' '}
              {formatKes(storeSettings.freeDeliveryThresholdKes)}
            </span>
          </div>
        </div>
      </footer>

      {/* SHOPIFY-STYLE MERCHANT ADMIN BACK OFFICE (PRODUCTS, KES PRICES, STOCK, PROMOS, ANALYTICS & ORDERS) */}
      <MerchantAdminIsland
        isOpen={isMerchantAdminOpen}
        onClose={() => setIsMerchantAdminOpen(false)}
        products={catalogProducts}
        onUpdateProduct={handleMerchantUpdateProduct}
        onAddProduct={handleMerchantAddProduct}
        onDeleteProduct={handleMerchantDeleteProduct}
        onResetCatalogToDefaults={handleMerchantResetCatalog}
        onSyncAllProductsToFirestore={handleSyncAllProductsToFirestore}
        storeSettings={storeSettings}
        onUpdateStoreSettings={handleMerchantUpdateStoreSettings}
        promoCodes={promoCodes}
        onSavePromoCode={handleSavePromoCode}
        onTogglePromoCodeActive={handleTogglePromoCodeActive}
        onDeletePromoCode={handleDeletePromoCode}
        restockAlerts={allRestockAlerts}
        onToggleRestockAlertStatus={handleToggleRestockAlertStatus}
        onDeleteRestockAlert={handleDeleteRestockAlert}
        orders={(
          firestoreOrders.length > 0
            ? firestoreOrders
            : userOrderHistory.length > 0
            ? userOrderHistory
            : localOrders
        ).map((ord) => ({
          id: ord.id,
          userId: ord.userId,
          orderNumber: ord.orderNumber,
          orderStatus: ord.orderStatus,
          trackingCode: ord.trackingCode,
          estimatedDelivery: ord.estimatedDelivery,
          customerName: ord.customerName,
          phone: ord.phone,
          city: ord.city,
          address: ord.address,
          paymentMethod: ord.paymentMethod,
          promoCode: ord.promoCode,
          promoDiscountKes: ord.promoDiscountKes,
          subtotal: ord.subtotal,
          deliveryFee: ord.deliveryFee,
          bundleDiscountKes: ord.bundleDiscountKes,
          total: ord.total,
          timestamp: ord.timestamp,
          itemsCount: ord.items.reduce((acc, i) => acc + i.quantity, 0),
          isFirestoreSynced: Boolean(ord.id && !ord.id.startsWith('seed-order-')),
          items: ord.items.map((i) => ({
            productName: i.product.name,
            variantLabel: i.variant.label,
            nibSize: i.nibSize,
            quantity: i.quantity,
            priceKes: i.product.priceKes,
          })),
        }))}
        onUpdateOrderStatusByNumber={(orderNumber, nextStatus) => {
          const target =
            firestoreOrders.find((o) => o.orderNumber === orderNumber) ||
            userOrderHistory.find((o) => o.orderNumber === orderNumber) ||
            localOrders.find((o) => o.orderNumber === orderNumber);
          if (target) {
            handleUpdateOrderStatus(target, nextStatus);
          }
        }}
        firebaseAdminEmail={firebaseUser?.email || null}
        isAuthorizedAdmin={isAuthorizedAdmin}
        isSigningIn={isSigningIn}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOutAccount}
        cloudSyncStatus={cloudSyncStatus}
      />

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

      {/* QUICK BUY MODAL OVERLAY (ASTRO ISLAND) */}
      <QuickBuyModalIsland
        product={quickBuyProduct}
        initialVariantId={
          quickBuyProduct
            ? selectedVariants[quickBuyProduct.id] || quickBuyProduct.variants[0].id
            : ''
        }
        initialNibSize={
          quickBuyProduct ? selectedNibs[quickBuyProduct.id] || 'Fine' : 'Fine'
        }
        isWishlisted={isItemWishlisted}
        onClose={() => setQuickBuyProduct(null)}
        onSelectVariantSync={handleSelectVariant}
        onSelectNibSync={handleSelectNib}
        onConfirmQuickBuy={handleConfirmQuickBuy}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* CONTIGUOUS PRODUCT DETAIL MODAL (PDP) */}
      {activeProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdp-modal-title"
        >
          <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden shadow-xl my-auto">
            <button
              type="button"
              onClick={() => setActiveProductModal(null)}
              aria-label="Close specification view"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#FAF8F5]/90 text-[#171614] hover:bg-[#E6E1D8] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              {/* Left Gallery */}
              <div className="md:col-span-6 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E6E1D8]">
                <div className="p-4 flex-1 flex flex-col items-center justify-center bg-white relative">
                  <button
                    type="button"
                    onClick={() => {
                      const modalSrc =
                        activeImageByProduct[activeProductModal.id] ||
                        activeProductModal.variants.find(
                          (v) => v.id === selectedVariants[activeProductModal.id]
                        )?.image ||
                        activeProductModal.image;
                      const matchedInk =
                        activeProductModal.id === 'pilot-iroshizuku-ink'
                          ? INK_STUDIO_SHADES.find(
                              (s) => s.id === selectedVariants[activeProductModal.id]
                            )
                          : undefined;
                      setZoomModal({
                        src: modalSrc,
                        secondarySrc: matchedInk?.swatchImage,
                        activeView: 'primary',
                        title: activeProductModal.name,
                        subtitle: activeProductModal.japaneseTitle,
                        swatchHex: matchedInk?.hex,
                        inkShadeId: matchedInk?.id,
                        zoomLevel: 2,
                        panX: 50,
                        panY: 50,
                      });
                    }}
                    className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5]/95 text-[#171614] hover:bg-[#163A5F] hover:text-white rounded border border-[#DCD5C7] shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom 3×</span>
                  </button>
                  <ResilientImage
                    src={
                      activeImageByProduct[activeProductModal.id] ||
                      activeProductModal.variants.find(
                        (v) => v.id === selectedVariants[activeProductModal.id]
                      )?.image ||
                      activeProductModal.image
                    }
                    alt={activeProductModal.name}
                    fallbackTitle={activeProductModal.name}
                    className={`w-full max-h-[340px] ${
                      activeProductModal.imageFit === 'contain' ||
                      activeProductModal.id === 'pilot-kakuno-madoromi'
                        ? 'object-contain'
                        : 'object-cover rounded'
                    }`}
                  />
                  {activeProductModal.galleryImages &&
                    activeProductModal.galleryImages.length > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[#EAE5DC] w-full max-h-[116px] overflow-y-auto">
                        {activeProductModal.galleryImages.map((imgItem) => {
                          const currentModalImg =
                            activeImageByProduct[activeProductModal.id] ||
                            activeProductModal.image;
                          const isSelectedImg = currentModalImg === imgItem.src;
                          return (
                            <button
                              key={imgItem.src}
                              type="button"
                              onClick={() => {
                                setActiveImageByProduct((prev) => ({
                                  ...prev,
                                  [activeProductModal.id]: imgItem.src,
                                }));
                                const matchingVar = activeProductModal.variants.find(
                                  (v) => v.image === imgItem.src
                                );
                                if (matchingVar) {
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [activeProductModal.id]: matchingVar.id,
                                  }));
                                }
                              }}
                              title={imgItem.caption}
                              className={`w-10 h-10 rounded overflow-hidden border p-0.5 bg-white cursor-pointer transition-all shrink-0 ${
                                isSelectedImg
                                  ? 'border-[#163A5F] ring-1 ring-[#163A5F]'
                                  : 'border-[#DCD5C7] opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={resolveAssetUrl(imgItem.src)}
                                alt={imgItem.caption}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
                <div className="p-5 bg-[#F3EFE8] border-t border-[#E6E1D8]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2">
                    In the Presentation Box
                  </p>
                  <ul className="space-y-1 text-xs text-[#3F3D39]">
                    {activeProductModal.includedItems.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#163A5F] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Contiguous Purchase Module */}
              <div className="md:col-span-6 p-6 lg:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#6E6A63] mb-2">
                    <span>{activeProductModal.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeProductModal.Origin}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#163A5F] font-medium">
                      {activeProductModal.availability}
                    </span>
                  </div>

                  <h2
                    id="pdp-modal-title"
                    className="font-serif-display text-2xl lg:text-3xl font-semibold text-[#171614]"
                  >
                    {activeProductModal.name}
                  </h2>
                  <p className="text-xs text-[#6E6A63] mt-0.5">
                    {activeProductModal.japaneseTitle}
                  </p>

                  <p className="font-mono-tabular text-xl font-semibold text-[#171614] mt-3">
                    {formatKes(activeProductModal.priceKes)}
                  </p>

                  <p className="text-sm text-[#4A4742] leading-relaxed mt-4">
                    {activeProductModal.description}
                  </p>

                  {/* Variant Selector inside PDP */}
                  <div className="mt-5 pt-4 border-t border-[#E6E1D8]">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#5C5852] mb-2">
                      {activeProductModal.variantLabel}
                    </span>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {activeProductModal.variants.map((variant) => {
                        const selectedId =
                          selectedVariants[activeProductModal.id] ||
                          activeProductModal.variants[0].id;
                        const isSelected = variant.id === selectedId;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() =>
                              handleSelectVariant(activeProductModal.id, variant.id)
                            }
                            className={`w-full p-2.5 text-left rounded border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-[#163A5F] bg-[#163A5F]/8 text-[#171614]'
                                : 'border-[#E6E1D8] bg-white text-[#5C5852] hover:border-[#BDB6AA]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {variant.swatchHex && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: variant.swatchHex }}
                                />
                              )}
                              <div className="truncate">
                                <div className="text-xs font-semibold text-[#171614] truncate">
                                  {variant.label}
                                </div>
                                <div className="text-[11px] text-[#6E6A63] truncate">
                                  {variant.sublabel}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#163A5F] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nib Selector inside PDP */}
                  {activeProductModal.hasNibSelector && (
                    <div className="mt-4 pt-4 border-t border-[#E6E1D8] flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5852]">
                        Select Nib Size
                      </span>
                      <div className="inline-flex items-center gap-2">
                        {(['Fine', 'Medium'] as const).map((nib) => {
                          const modalNib = selectedNibs[activeProductModal.id] || 'Fine';
                          const selected = modalNib === nib;
                          return (
                            <button
                              key={nib}
                              type="button"
                              onClick={() => handleSelectNib(activeProductModal.id, nib)}
                              className={`px-3.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                selected
                                  ? 'border-[#163A5F] bg-[#163A5F] text-white font-semibold'
                                  : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#171614]'
                              }`}
                            >
                              {nib === 'Fine' ? 'Fine (0.35mm)' : 'Medium (0.50mm)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Technical Specifications Table */}
                  <div className="mt-5 pt-4 border-t border-[#E6E1D8] space-y-1.5">
                    {activeProductModal.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 text-xs"
                      >
                        <span className="text-[#6E6A63]">{spec.label}</span>
                        <span className="font-medium text-[#171614] text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E1D8] flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const chosenVariant =
                        activeProductModal.variants.find(
                          (v) => v.id === selectedVariants[activeProductModal.id]
                        ) || activeProductModal.variants[0];
                      const chosenNib = activeProductModal.hasNibSelector
                        ? selectedNibs[activeProductModal.id] || 'Fine'
                        : undefined;
                      handleAddToCart(activeProductModal, chosenVariant, chosenNib, true);
                      setActiveProductModal(null);
                    }}
                    className="flex-1 py-3 px-5 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add to Bag
                    {activeProductModal.hasNibSelector
                      ? ` (${selectedNibs[activeProductModal.id] || 'Fine'} Nib)`
                      : ''}{' '}
                    · {formatKes(activeProductModal.priceKes)}
                  </button>

                  {(() => {
                    const modalVariantId =
                      selectedVariants[activeProductModal.id] ||
                      activeProductModal.variants[0].id;
                    const modalVariant =
                      activeProductModal.variants.find((v) => v.id === modalVariantId) ||
                      activeProductModal.variants[0];
                    const modalWishlisted = isItemWishlisted(
                      activeProductModal.id,
                      modalVariant.id
                    );
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleWishlist(
                            activeProductModal,
                            modalVariant,
                            activeProductModal.hasNibSelector
                              ? selectedNibs[activeProductModal.id] || 'Fine'
                              : undefined
                          )
                        }
                        aria-pressed={modalWishlisted}
                        className={`inline-flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          modalWishlisted
                            ? 'border-[#C88A2E] bg-[#C88A2E]/12 text-[#0A2246]'
                            : 'border-[#DCD5C7] bg-white text-[#524E48] hover:border-[#0A2246] hover:text-[#0A2246]'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            modalWishlisted ? 'fill-[#C88A2E] text-[#C88A2E]' : ''
                          }`}
                        />
                        <span>{modalWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Customer Reviews & Star Rating Section inside Product Detail Modal */}
            <div className="p-6 lg:p-8 border-t border-[#E6E1D8] bg-white">
              <CustomerReviewsIsland
                product={activeProductModal}
                reviews={allProductReviews}
                currentUser={
                  memberProfile
                    ? {
                        uid: firebaseUser?.uid || memberProfile.uid,
                        name: memberProfile.name,
                        emailOrPhone: memberProfile.emailOrPhone,
                        isFirebaseAuthenticated: Boolean(firebaseUser),
                      }
                    : null
                }
                isSigningIn={isSigningIn}
                onGoogleSignIn={handleGoogleSignIn}
                onQuickMemberSignIn={handleQuickMemberSignInForReviews}
                onSubmitReview={handleSubmitProductReview}
                onDeleteReview={handleDeleteProductReview}
              />
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER SHOPPING BAG, ORDER HISTORY & KENYA CHECKOUT DRAWER */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag, Order History, and Checkout"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] h-full flex flex-col justify-between border-l border-[#E6E1D8] shadow-2xl overflow-hidden">
            {/* Drawer Header with Bag / Order History Switcher */}
            <div className="px-6 pt-4 pb-3 border-b border-[#E6E1D8] bg-[#FAF8F5]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-semibold text-[#0A2246]">
                    {activeCartTab === 'history'
                      ? 'Member Order History'
                      : checkoutStep === 'bag'
                      ? 'Your Writing Bag'
                      : checkoutStep === 'checkout'
                      ? 'Kenya Delivery & Settlement'
                      : 'Order Confirmed'}
                  </h2>
                  <p className="text-xs text-[#6E6A63]">
                    {activeCartTab === 'history'
                      ? memberProfile
                        ? `Signed in as ${memberProfile.name} (${memberProfile.emailOrPhone})`
                        : 'Sign in to view your past PENS R US purchases & reorder'
                      : checkoutStep === 'confirmed'
                      ? 'Thank you for choosing PENS R US Kenya'
                      : 'Complimentary delivery in Nairobi & on orders from KES 6,000'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close bag drawer"
                  className="p-2 rounded text-[#5C5852] hover:text-[#171614] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented Tab Switcher: Writing Bag vs Order History */}
              <div className="mt-3.5 grid grid-cols-2 gap-1.5 p-1 bg-[#EDE8DF] rounded border border-[#DCD5C7]">
                <button
                  type="button"
                  onClick={() => setActiveCartTab('bag')}
                  className={`inline-flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeCartTab === 'bag'
                      ? 'bg-[#0A2246] text-white shadow-2xs'
                      : 'text-[#524E48] hover:text-[#0A2246]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">Writing Bag ({totalItemsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCartTab('history')}
                  className={`inline-flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeCartTab === 'history'
                      ? 'bg-[#0A2246] text-white shadow-2xs'
                      : 'text-[#524E48] hover:text-[#0A2246]'
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
                    <div className="p-5 rounded-lg border border-[#DCD5C7] bg-white shadow-2xs">
                      <div className="flex items-center gap-2.5 mb-2">
                        <History className="w-4 h-4 text-[#C88A2E]" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B58435]">
                          PENS R US Collector Account
                        </span>
                      </div>
                      <h3 className="font-serif-display text-xl font-semibold text-[#0A2246]">
                        Sign In to View Your Order History
                      </h3>
                      <p className="text-xs text-[#5C5852] mt-1 leading-relaxed">
                        Access your previous fountain pen, nib, and bottled ink purchases, view
                        itemized KES receipts, and reorder your favourite writing instruments in one
                        click.
                      </p>

                      {authStatusMessage && (
                        <div className="mt-3 p-3 rounded bg-[#C88A2E]/12 border border-[#C88A2E]/40 text-xs text-[#0A2246]">
                          {authStatusMessage}
                        </div>
                      )}

                      {/* Option 1: Google Sign-In via Firebase Auth */}
                      <button
                        type="button"
                        disabled={isSigningIn}
                        onClick={handleGoogleSignIn}
                        className="mt-4 w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] hover:bg-[#133468] text-white rounded border border-[#C88A2E]/40 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#E5B25D]" />
                        <span>
                          {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
                        </span>
                      </button>

                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#E6E1D8]" />
                        <span className="text-[11px] uppercase tracking-wider text-[#8C857B]">
                          Or Atelier Member Login
                        </span>
                        <div className="h-px flex-1 bg-[#E6E1D8]" />
                      </div>

                      {/* Option 2: Direct Member Login Form (Works inside any iframe/session) */}
                      <form onSubmit={handleMemberFormSignIn} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={loginNameInput}
                            onChange={(e) => setLoginNameInput(e.target.value)}
                            placeholder="e.g. Wanjiku Mwangi"
                            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                            Email or Kenyan Mobile Number
                          </label>
                          <input
                            type="text"
                            required
                            value={loginContactInput}
                            onChange={(e) => setLoginContactInput(e.target.value)}
                            placeholder="e.g. +254 712 345 678 or wanjiku@example.co.ke"
                            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase bg-white hover:bg-[#0A2246] text-[#0A2246] hover:text-white border border-[#0A2246] rounded transition-colors cursor-pointer"
                        >
                          Sign In &amp; View Purchases
                        </button>
                      </form>

                      {/* Instant Demo Collector Profile Button */}
                      <div className="mt-3 pt-3 border-t border-[#ECE8DF] flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[#6E6A63]">
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
                          className="text-xs font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer"
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
                    <div className="p-3.5 rounded-lg border border-[#DCD5C7] bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#0A2246] text-[#E5B25D] flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A2246] truncate">
                            {memberProfile.name}
                          </p>
                          <p className="text-[11px] text-[#6E6A63] truncate">
                            {memberProfile.emailOrPhone}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOutAccount}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#524E48] hover:text-[#171614] bg-[#F3EFE8] hover:bg-[#E6E1D8] rounded border border-[#DCD5C7] transition-colors cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Order Tracking Filter & Quick Waybill Lookup */}
                    <div className="p-3.5 rounded-lg border border-[#DCD5C7] bg-white space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#0A2246]" />
                          <span className="text-xs font-semibold text-[#0A2246]">
                            Live Order Tracking &amp; Status
                          </span>
                        </div>
                        <span className="font-mono-tabular text-[11px] text-[#6E6A63]">
                          {userOrderHistory.length}{' '}
                          {userOrderHistory.length === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>

                      {/* Search by Order # or Courier Waybill */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#8C857B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={orderTrackingSearch}
                          onChange={(e) => setOrderTrackingSearch(e.target.value)}
                          placeholder="Track by Order # (e.g. PRU-5104) or item..."
                          className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
                        />
                        {orderTrackingSearch && (
                          <button
                            type="button"
                            onClick={() => setOrderTrackingSearch('')}
                            aria-label="Clear tracking search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#6E6A63] hover:text-[#171614] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Interactive Status Filter Buttons */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-[#F3EFE8] rounded border border-[#E6E1D8]">
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
                                className={`py-1.5 px-1.5 text-[10px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap truncate ${
                                  isSelected
                                    ? 'bg-[#0A2246] text-white shadow-2xs'
                                    : 'text-[#524E48] hover:text-[#0A2246]'
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
                      <div className="text-center py-10 px-4 rounded-lg border border-[#E6E1D8] bg-white">
                        <History className="w-8 h-8 text-[#9E988E] mx-auto mb-2 stroke-[1.25]" />
                        <p className="font-serif-display text-lg text-[#171614]">
                          No Previous Purchases Yet
                        </p>
                        <p className="text-xs text-[#6E6A63] mt-1">
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
                                className="p-4 rounded-lg border border-[#DCD5C7] bg-white shadow-2xs space-y-3.5"
                              >
                                {/* Order Card Top Metadata */}
                                <div className="flex items-start justify-between border-b border-[#ECE8DF] pb-2.5 gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-mono-tabular text-xs font-bold text-[#0A2246]">
                                        ORDER #{order.orderNumber}
                                      </span>
                                      <span className="text-[#8C857B]" aria-hidden="true">
                                        ·
                                      </span>
                                      <span
                                        className={`text-xs font-semibold ${
                                          currentStatus === 'Delivered'
                                            ? 'text-[#1D5B43]'
                                            : currentStatus === 'Out for Courier'
                                            ? 'text-[#B58435]'
                                            : 'text-[#0A2246]'
                                        }`}
                                      >
                                        {currentStatus}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#6E6A63] mt-0.5">
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
                                    <span className="font-mono-tabular text-xs font-semibold text-[#171614]">
                                      {formatKes(order.total)}
                                    </span>
                                    <p className="text-[10px] font-mono-tabular text-[#6E6A63]">
                                      {trackingCode}
                                    </p>
                                  </div>
                                </div>

                                {/* 3-Stage Order Tracking Progress Stepper */}
                                <div className="p-3 rounded bg-[#FAF8F5] border border-[#E6E1D8] space-y-2.5">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-[#0A2246]">
                                      Stage {currentStageIdx + 1} of 3: {currentStatus}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleOrderTracking(order.orderNumber)
                                      }
                                      className="text-[11px] font-semibold text-[#0A2246] hover:text-[#C88A2E] underline underline-offset-4 cursor-pointer whitespace-nowrap"
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
                                                  ? 'bg-[#1D5B43]'
                                                  : isCurrent
                                                  ? 'bg-[#C88A2E]'
                                                  : 'bg-[#0A2246]'
                                                : 'bg-[#DFD9CE]'
                                            }`}
                                          />
                                          <div className="flex items-center gap-1">
                                            {isCompleted ? (
                                              <Check
                                                className={`w-3 h-3 shrink-0 ${
                                                  currentStatus === 'Delivered'
                                                    ? 'text-[#1D5B43]'
                                                    : isCurrent
                                                    ? 'text-[#B58435]'
                                                    : 'text-[#0A2246]'
                                                }`}
                                              />
                                            ) : (
                                              <span className="font-mono-tabular text-[10px] text-[#8C857B]">
                                                {stage.stepNumber}
                                              </span>
                                            )}
                                            <span
                                              className={`text-[10px] truncate ${
                                                isCurrent
                                                  ? 'font-bold text-[#171614]'
                                                  : isCompleted
                                                  ? 'font-medium text-[#3F3D39]'
                                                  : 'text-[#8C857B]'
                                              }`}
                                            >
                                              {stage.label}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <p className="text-[11px] text-[#524E48] leading-snug">
                                    {etaText}
                                  </p>

                                  {/* Expandable Detailed Kenya Courier Tracking Log & Interactive Status Simulator */}
                                  {isTrackingExpanded && (
                                    <div className="pt-2.5 mt-2 border-t border-[#E6E1D8] space-y-3">
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
                                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono-tabular shrink-0 mt-0.5 ${
                                                  isCompleted
                                                    ? currentStatus === 'Delivered'
                                                      ? 'bg-[#1D5B43] text-white'
                                                      : isCurrent
                                                      ? 'bg-[#C88A2E] text-white'
                                                      : 'bg-[#0A2246] text-white'
                                                    : 'bg-[#E6E1D8] text-[#6E6A63]'
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
                                                    className={`text-[11px] ${
                                                      isCurrent
                                                        ? 'font-bold text-[#0A2246]'
                                                        : isCompleted
                                                        ? 'font-semibold text-[#171614]'
                                                        : 'text-[#8C857B]'
                                                    }`}
                                                  >
                                                    {stage.stepNumber}. {stage.label}
                                                  </span>
                                                  <span className="text-[10px] font-mono-tabular text-[#6E6A63]">
                                                    {isCurrent
                                                      ? 'Current Stage'
                                                      : isCompleted
                                                      ? 'Completed'
                                                      : 'Pending'}
                                                  </span>
                                                </div>
                                                <p className="text-[11px] text-[#6E6A63] leading-relaxed">
                                                  {stage.atelierNote}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Courier Waybill & Destination Summary */}
                                      <div className="p-2.5 rounded bg-white border border-[#E6E1D8] text-[11px] space-y-1">
                                        <div className="flex justify-between gap-2">
                                          <span className="text-[#6E6A63]">Courier Waybill</span>
                                          <span className="font-mono-tabular font-semibold text-[#0A2246]">
                                            {trackingCode}
                                          </span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                          <span className="text-[#6E6A63]">Destination</span>
                                          <span className="font-medium text-[#171614] text-right truncate">
                                            {order.address} ({order.city.split(' ')[0]})
                                          </span>
                                        </div>
                                      </div>

                                      {/* Admin-Only Courier Status Control */}
                                      {isAuthorizedAdmin && (
                                        <div className="pt-1">
                                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E6A63] mb-1.5">
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
                                                  className={`py-1.5 px-2 text-[10px] font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap truncate ${
                                                    active
                                                      ? 'bg-[#0A2246] text-white border-[#0A2246]'
                                                      : 'bg-white text-[#3F3D39] border-[#DCD5C7] hover:border-[#0A2246]'
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
                                          className="w-10 h-10 rounded object-contain bg-white border border-[#E6E1D8] shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-[#171614] truncate">
                                            {item.quantity}× {item.product.name}
                                          </p>
                                          <p className="text-[11px] text-[#6E6A63] truncate">
                                            {item.variant.label}
                                            {item.nibSize ? ` · ${item.nibSize} Nib` : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="font-mono-tabular text-xs font-medium text-[#171614] whitespace-nowrap">
                                        {formatKes(item.product.priceKes * item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Delivery, WhatsApp Concierge & 1-Click Reorder Footer */}
                                <div className="pt-2.5 border-t border-[#ECE8DF] flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[11px] text-[#6E6A63] truncate">
                                    {order.address}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={buildWhatsAppOrderUrl(order)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#1D5B43] hover:bg-[#154633] rounded transition-colors whitespace-nowrap shrink-0"
                                    >
                                      <span>WhatsApp Atelier</span>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleReorderPastPurchase(order)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A2246] hover:text-white bg-[#F3EFE8] hover:bg-[#0A2246] rounded border border-[#DCD5C7] hover:border-[#0A2246] transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
              ) : checkoutStep === 'confirmed' && confirmedOrder ? (
                <div className="space-y-6">
                  <div className="p-4 rounded border border-[#1D5B43]/30 bg-[#1D5B43]/8 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#1D5B43] font-mono-tabular">
                      <span>ORDER #{confirmedOrder.orderNumber}</span>
                      <span>{confirmedOrder.timestamp}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#171614]">
                      Order Confirmed — Live Tracking Active ({confirmedOrder.orderStatus || 'Processing'})
                    </p>
                    <p className="text-xs text-[#4A4742] leading-relaxed">
                      We have reserved your Japanese writing instruments for{' '}
                      <span className="font-medium text-[#171614]">
                        {confirmedOrder.customerName}
                      </span>{' '}
                      ({confirmedOrder.phone}). Waybill:{' '}
                      <span className="font-mono-tabular font-semibold text-[#0A2246]">
                        {confirmedOrder.trackingCode || 'NBO-COUR'}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-b border-[#E6E1D8] pb-4">
                    <div className="flex justify-between">
                      <span className="text-[#6E6A63]">Destination</span>
                      <span className="font-medium text-[#171614] text-right">
                        {confirmedOrder.city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E6A63]">Address</span>
                      <span className="font-medium text-[#171614] text-right">
                        {confirmedOrder.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E6A63]">Payment Method</span>
                      <span className="font-medium text-[#171614]">
                        {confirmedOrder.paymentMethod === 'mpesa'
                          ? 'M-Pesa STK Push / Paybill'
                          : confirmedOrder.paymentMethod === 'whatsapp'
                          ? 'WhatsApp Order Concierge'
                          : 'Cash on Delivery (KES)'}
                      </span>
                    </div>
                  </div>

                  {/* Instant WhatsApp Concierge Dispatch Box */}
                  <div className="p-3.5 rounded-lg border border-[#1D5B43]/40 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1D5B43]">
                        WhatsApp Order Concierge · Saved to History
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#6E6A63]">
                        #{confirmedOrder.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4742] leading-relaxed">
                      Your order is saved in your{' '}
                      <button
                        type="button"
                        onClick={() => setActiveCartTab('history')}
                        className="font-semibold text-[#0A2246] underline cursor-pointer"
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
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 text-xs font-semibold uppercase tracking-wider bg-[#1D5B43] hover:bg-[#154633] text-white rounded transition-colors whitespace-nowrap"
                      >
                        <span>Send Order on WhatsApp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyWhatsAppOrder(confirmedOrder)}
                        className="py-2.5 px-3 text-xs font-semibold border border-[#DCD5C7] bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#171614] rounded transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {copiedWhatsAppOrderNo === confirmedOrder.orderNumber
                          ? 'Copied Summary!'
                          : 'Copy Summary'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5852]">
                      Itemized Summary
                    </p>
                    {confirmedOrder.items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.variant.id}-${item.nibSize || 'none'}`}
                        className="flex justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-medium text-[#171614]">
                            {item.quantity}× {item.product.name}
                          </span>
                          <p className="text-[#6E6A63]">
                            {item.variant.label}
                            {item.nibSize
                              ? ` · ${item.nibSize} Nib (${
                                  item.nibSize === 'Fine' ? '0.35mm' : '0.50mm'
                                })`
                              : ''}
                          </p>
                        </div>
                        <span className="font-mono-tabular font-medium text-[#171614] whitespace-nowrap">
                          {formatKes(item.product.priceKes * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#E6E1D8] space-y-1.5 text-xs">
                    {confirmedOrder.promoCode && confirmedOrder.promoDiscountKes && (
                      <div className="flex justify-between text-[#1D5B43] font-medium">
                        <span>Promo Voucher ({confirmedOrder.promoCode})</span>
                        <span className="font-mono-tabular">
                          -{formatKes(confirmedOrder.promoDiscountKes)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#5C5852]">
                      <span>Subtotal</span>
                      <span className="font-mono-tabular">
                        {formatKes(confirmedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5C5852]">
                      <span>Courier Delivery</span>
                      <span className="font-mono-tabular">
                        {confirmedOrder.deliveryFee === 0
                          ? 'Complimentary'
                          : formatKes(confirmedOrder.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#171614] pt-2 border-t border-[#E6E1D8]">
                      <span>Total Due</span>
                      <span className="font-mono-tabular">{formatKes(confirmedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="w-10 h-10 text-[#9E988E] stroke-[1.25] mb-3" />
                  <p className="font-serif-display text-xl text-[#171614]">
                    Your Writing Bag is Empty
                  </p>
                  <p className="text-xs text-[#6E6A63] mt-1 max-w-xs leading-relaxed">
                    Explore the Pilot Prera in Empress Teal (KES 8,500), Kakuno Madoromi (KES 3,200),
                    Kakuno Family (KES 2,500), or all 24 shades of 50ml Iroshizuku bottled inks
                    (KES 6,000).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCartTab('history')}
                    className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0A2246] bg-[#EDE8DF] hover:bg-[#0A2246] hover:text-white rounded border border-[#DCD5C7] transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Past Orders &amp; Reorder</span>
                  </button>
                </div>
              ) : checkoutStep === 'bag' ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant.id}-${item.nibSize || 'none'}`}
                      className="p-4 rounded border border-[#E6E1D8] bg-white flex gap-3.5"
                    >
                      <ResilientImage
                        src={item.variant.image || item.product.image}
                        alt={item.product.name}
                        fallbackTitle={item.product.name}
                        className="w-16 h-16 rounded object-contain bg-white shrink-0 border border-[#E6E1D8]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-semibold text-[#171614] truncate">
                            {item.product.name}
                          </h3>
                          <span className="font-mono-tabular text-xs font-semibold text-[#171614] whitespace-nowrap">
                            {formatKes(item.product.priceKes * item.quantity)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E6A63] mt-0.5 truncate">
                          {item.variant.label}
                          {item.nibSize
                            ? ` · ${item.nibSize} Nib (${
                                item.nibSize === 'Fine' ? '0.35mm' : '0.50mm'
                              })`
                            : ''}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-[#E6E1D8] rounded">
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
                              className="p-1 text-[#5C5852] hover:text-[#171614] cursor-pointer"
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
                              className="p-1 text-[#5C5852] hover:text-[#171614] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono-tabular text-[11px] text-[#6E6A63]">
                            {formatKes(item.product.priceKes)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form id="kenya-checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                  {checkoutError && (
                    <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800">
                      {checkoutError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Wanjiku Mwangi"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DCD5C7] rounded focus:outline-none focus:border-[#163A5F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                      Kenyan Mobile Number (For Courier &amp; M-Pesa)
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +254 712 345 678"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DCD5C7] rounded focus:outline-none focus:border-[#163A5F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                      County / Region
                    </label>
                    <select
                      value={selectedLocationIdx}
                      onChange={(e) => setSelectedLocationIdx(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DCD5C7] rounded focus:outline-none focus:border-[#163A5F]"
                    >
                      {KENYA_LOCATIONS.map((loc, idx) => (
                        <option key={loc.city} value={idx}>
                          {loc.city} — {loc.eta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#3F3D39] mb-1">
                      Building, Road, or Landmark
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Delta Corner Tower, Westlands, 4th Floor"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DCD5C7] rounded focus:outline-none focus:border-[#163A5F]"
                    />
                  </div>

                  <div className="pt-2">
                    <span className="block text-xs font-medium text-[#3F3D39] mb-2">
                      Settlement &amp; Order Method
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                          paymentMethod === 'mpesa'
                            ? 'border-[#163A5F] bg-[#163A5F]/8 font-semibold text-[#171614]'
                            : 'border-[#E6E1D8] bg-white text-[#5C5852]'
                        }`}
                      >
                        <div>M-Pesa Express</div>
                        <div className="text-[10px] font-normal text-[#6E6A63] mt-0.5">
                          Instant STK / Paybill
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('whatsapp')}
                        className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                          paymentMethod === 'whatsapp'
                            ? 'border-[#1D5B43] bg-[#1D5B43]/10 font-semibold text-[#171614]'
                            : 'border-[#E6E1D8] bg-white text-[#5C5852]'
                        }`}
                      >
                        <div>WhatsApp Concierge</div>
                        <div className="text-[10px] font-normal text-[#6E6A63] mt-0.5">
                          Itemized KES Chat + Saved History
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2.5 text-left rounded border text-xs cursor-pointer ${
                          paymentMethod === 'cod'
                            ? 'border-[#163A5F] bg-[#163A5F]/8 font-semibold text-[#171614]'
                            : 'border-[#E6E1D8] bg-white text-[#5C5852]'
                        }`}
                      >
                        <div>Cash on Delivery</div>
                        <div className="text-[10px] font-normal text-[#6E6A63] mt-0.5">
                          Pay upon inspection
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-[#E6E1D8] bg-[#F3EFE8]">
              {activeCartTab === 'history' ? (
                <button
                  type="button"
                  onClick={() => setActiveCartTab('bag')}
                  className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] text-white rounded hover:bg-[#133468] transition-colors cursor-pointer"
                >
                  Return to Writing Bag ({totalItemsCount})
                </button>
              ) : checkoutStep === 'confirmed' ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveCartTab('history')}
                    className="flex-1 py-3 px-4 text-xs font-semibold tracking-wider uppercase border border-[#0A2246] text-[#0A2246] bg-white rounded hover:bg-[#EDE8DF] transition-colors cursor-pointer"
                  >
                    View Order History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('bag');
                      setIsCartOpen(false);
                    }}
                    className="flex-1 py-3 px-4 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] text-white rounded hover:bg-[#133468] transition-colors cursor-pointer"
                  >
                    Continue Exploring
                  </button>
                </div>
              ) : cart.length > 0 ? (
                <div className="space-y-4">
                  {/* Promo Voucher Code Bar */}
                  <div className="p-3 rounded-lg bg-white border border-[#DCD5C7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2246]">
                        Promo Voucher Code
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
                              className="px-2 py-0.5 text-[10px] font-mono-tabular font-bold rounded bg-[#F3EFE8] hover:bg-[#0A2246] text-[#0A2246] hover:text-white border border-[#DCD5C7] transition-colors cursor-pointer"
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
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono-tabular uppercase bg-[#FAF8F5] border border-[#DCD5C7] rounded focus:outline-none focus:border-[#0A2246]"
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
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#0A2246] text-white rounded hover:bg-[#133468] cursor-pointer"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {promoFeedbackMsg && (
                      <p
                        className={`text-[11px] font-medium ${
                          promoFeedbackMsg.type === 'success'
                            ? 'text-[#1D5B43]'
                            : 'text-rose-700'
                        }`}
                      >
                        {promoFeedbackMsg.text}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {(inkMixingSetDiscount > 0 || promoDiscountKes > 0) && (
                      <div className="flex justify-between text-[#5C5852]">
                        <span>Items Value</span>
                        <span className="font-mono-tabular line-through text-[#8C857B]">
                          {formatKes(cartRawSubtotal)}
                        </span>
                      </div>
                    )}
                    {inkMixingSetDiscount > 0 && (
                      <div className="flex justify-between text-[#1D5B43] font-medium">
                        <span>Ink Mixing Set (10% Trio Bundle)</span>
                        <span className="font-mono-tabular">
                          -{formatKes(inkMixingSetDiscount)}
                        </span>
                      </div>
                    )}
                    {appliedPromoCode && promoDiscountKes > 0 && (
                      <div className="flex justify-between text-[#1D5B43] font-medium">
                        <span>Promo Voucher ({appliedPromoCode.code})</span>
                        <span className="font-mono-tabular">-{formatKes(promoDiscountKes)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#5C5852]">
                      <span>Subtotal</span>
                      <span className="font-mono-tabular">{formatKes(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#5C5852]">
                      <span>Delivery ({selectedLocation.city.split(' ')[0]})</span>
                      <span className="font-mono-tabular">
                        {deliveryFee === 0 ? 'Complimentary' : formatKes(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#171614] pt-2 border-t border-[#DCD5C7]">
                      <span>Total</span>
                      <span className="font-mono-tabular">{formatKes(orderTotal)}</span>
                    </div>
                  </div>

                  {checkoutStep === 'bag' ? (
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('checkout')}
                      className="w-full py-3 px-4 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer"
                    >
                      Proceed to Kenya Checkout · {formatKes(orderTotal)}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('bag')}
                        className="px-3.5 py-3 text-xs font-medium text-[#5C5852] hover:text-[#171614] border border-[#DCD5C7] rounded bg-white cursor-pointer whitespace-nowrap"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        form="kenya-checkout-form"
                        className="flex-1 py-3 px-4 text-xs font-semibold tracking-wider uppercase bg-[#0A2246] hover:bg-[#133468] text-white rounded transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {paymentMethod === 'whatsapp'
                          ? `Save & Order via WhatsApp · ${formatKes(orderTotal)}`
                          : `Confirm Order · ${formatKes(orderTotal)}`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase border border-[#171614] text-[#171614] rounded hover:bg-[#171614] hover:text-white transition-colors cursor-pointer"
                >
                  Browse Collection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN OPTICAL ZOOM & INK SWATCH INSPECTOR LIGHTBOX */}
      {zoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoom Inspector: ${zoomModal.title}`}
        >
          <div className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Top Inspector Bar */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#E6E1D8] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {zoomModal.swatchHex && (
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-xs"
                    style={{ backgroundColor: zoomModal.swatchHex }}
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-serif-display text-lg sm:text-xl font-semibold text-[#171614] truncate">
                    {zoomModal.title}
                  </h3>
                  {zoomModal.subtitle && (
                    <p className="text-xs text-[#6E6A63] truncate">{zoomModal.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bottle + Swatch vs Swatch Card Close-Up Toggle when secondarySrc is present */}
                {zoomModal.secondarySrc && (
                  <div className="inline-flex items-center bg-[#E6E1D8] p-0.5 rounded border border-[#DCD5C7]">
                    <button
                      type="button"
                      onClick={() =>
                        setZoomModal((prev) =>
                          prev ? { ...prev, activeView: 'primary' } : null
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                        zoomModal.activeView === 'primary'
                          ? 'bg-[#163A5F] text-white'
                          : 'text-[#524E48] hover:text-[#171614]'
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
                          ? 'bg-[#163A5F] text-white'
                          : 'text-[#524E48] hover:text-[#171614]'
                      }`}
                    >
                      Swatch Card Close-Up
                    </button>
                  </div>
                )}

                {/* Optical Zoom Level Buttons: 1x, 2x, 3x */}
                <div className="inline-flex items-center gap-1 bg-white px-1.5 py-1 rounded border border-[#DCD5C7]">
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
                    className="p-1 text-[#524E48] hover:text-[#171614] cursor-pointer"
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
                          ? 'bg-[#163A5F] text-white font-semibold'
                          : 'text-[#524E48] hover:bg-[#EAE5DC]'
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
                    className="p-1 text-[#524E48] hover:text-[#171614] cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomModal(null)}
                  aria-label="Close zoom inspector"
                  className="p-1.5 rounded bg-[#EAE5DC] text-[#171614] hover:bg-[#171614] hover:text-white transition-colors cursor-pointer"
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
                    src={resolveAssetUrl(activeSrc)}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#FAF8F5]/95 border border-[#DCD5C7] text-[#171614] hover:bg-[#163A5F] hover:text-white shadow-md transition-colors cursor-pointer"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#FAF8F5]/95 border border-[#DCD5C7] text-[#171614] hover:bg-[#163A5F] hover:text-white shadow-md transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Inspector Helper & Quick Add Bar */}
            <div className="px-4 sm:px-6 py-3 border-t border-[#E6E1D8] bg-[#F3EFE8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C5852]">
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded bg-[#163A5F] hover:bg-[#102B47] text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
    </div>
  );
}
