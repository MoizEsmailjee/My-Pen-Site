import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { productPath } from '../lib/routes';
import { useEffect, useMemo, useState } from 'react';
import { FEATURED_PRODUCTS, INK_STUDIO_SHADES, InkShadeOption, NibOption, Product, ProductVariant } from '../data/products';
import { OperationType, User, addDoc, auth, collection, db, deleteDoc, doc, handleFirestoreError, onAuthStateChanged, onSnapshot, query, setDoc, signInWithGooglePopup, signOutFirebase, updateDoc, where } from '../firebase';
import { ProductReviewRecord } from '../islands/CustomerReviewsIsland';
import { PromoCodeRecord, RestockAlertRecord, StoreSettings } from '../islands/MerchantAdminIsland';
import { AUTHORIZED_ADMIN_EMAIL, CATALOG_STORAGE_KEY, CartItem, DEFAULT_PROMO_CODES, DEFAULT_SEED_RESTOCK_ALERTS, DEFAULT_SEED_REVIEWS, INK_COLOR_FAMILIES, KENYA_LOCATIONS, MEMBER_SESSION_STORAGE_KEY, MemberProfile, ORDERS_STORAGE_KEY, OrderConfirmation, OrderStatus, PROMO_CODES_STORAGE_KEY, RESTOCK_ALERTS_STORAGE_KEY, REVIEWS_STORAGE_KEY, STORE_SETTINGS_STORAGE_KEY, WISHLIST_STORAGE_KEY, WishlistItem, formatKes } from '../lib/storefront';

function useStorefrontState() {
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

  // Unified Atelier Series View Switcher ('all' | 'madoromi' | 'family' | 'prera' | 'iroshizuku' | 'waterman' | 'wishlist')
  const navigate = useNavigate();
  const openProduct = (product: Product) => navigate(productPath(product.id));

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

  // Active multi-angle gallery image for the dedicated Pilot Prera Empress Teal Product Page
  const [activePreraHeroImg, setActivePreraHeroImg] = useState<string>(
    '/assets/prera/empress_teal_1.jpg'
  );

  // Active image override per product card / modal
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<string, string>>({
    'pilot-kakuno-madoromi': '/assets/madoromi/madoromi_series.jpg',
    'pilot-kakuno-family': '/assets/kakuno_family/family_papa_blue.jpg',
    'pilot-prera': '/assets/prera/empress_teal_1.jpg',
    'pilot-iroshizuku-ink': '/assets/iroshizuku/ama_iro.jpg',
    'pilot-con-40': '/assets/converters/pilot_con40.jpg',
    'waterman-ink-bottle': '/assets/waterman/waterman_serenity_blue.jpg',
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


  return {
    catalogProducts,
    setCatalogProducts,
    storeSettings,
    setStoreSettings,
    promoCodes,
    setPromoCodes,
    isMerchantAdminOpen,
    setIsMerchantAdminOpen,
    cloudSyncStatus,
    setCloudSyncStatus,
    localRestockAlerts,
    setLocalRestockAlerts,
    firestoreRestockAlerts,
    setFirestoreRestockAlerts,
    notifyModalTarget,
    setNotifyModalTarget,
    notifyNameInput,
    setNotifyNameInput,
    notifyContactInput,
    setNotifyContactInput,
    notifySubmittedMessage,
    setNotifySubmittedMessage,
    notifyError,
    setNotifyError,
    submittingNotify,
    setSubmittingNotify,
    allRestockAlerts,
    localReviews,
    setLocalReviews,
    firestoreReviews,
    setFirestoreReviews,
    expandedCardReviews,
    setExpandedCardReviews,
    allProductReviews,
    activeCategory,
    setActiveCategory,
    openProduct,
    activeInkFamily,
    setActiveInkFamily,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    selectedVariants,
    setSelectedVariants,
    selectedNibs,
    setSelectedNibs,
    activePreraHeroImg,
    setActivePreraHeroImg,
    activeImageByProduct,
    setActiveImageByProduct,
    inkCardViewMode,
    setInkCardViewMode,
    hoveredInkZoom,
    setHoveredInkZoom,
    zoomModal,
    setZoomModal,
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    justAddedKey,
    setJustAddedKey,
    wishlist,
    setWishlist,
    quickBuyProduct,
    setQuickBuyProduct,
    activeCartTab,
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
    promoCodeInput,
    setPromoCodeInput,
    appliedPromoCode,
    setAppliedPromoCode,
    promoFeedbackMsg,
    setPromoFeedbackMsg,
    copiedWhatsAppOrderNo,
    setCopiedWhatsAppOrderNo,
    checkoutError,
    setCheckoutError,
    confirmedOrder,
    setConfirmedOrder,
    firebaseUser,
    setFirebaseUser,
    isFirestoreAdminDoc,
    setIsFirestoreAdminDoc,
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
    setIsSigningIn,
    orderStatusFilter,
    setOrderStatusFilter,
    orderTrackingSearch,
    setOrderTrackingSearch,
    expandedTrackingOrders,
    setExpandedTrackingOrders,
    localOrders,
    setLocalOrders,
    firestoreOrders,
    setFirestoreOrders,
    userOrderHistory,
    kakunoMadoromiProduct,
    kakunoFamilyProduct,
    pilotPreraProduct,
    pilotCon40Product,
    watermanInkProduct,
    iroshizukuProduct,
    normalizedSearch,
    filteredProducts,
    filteredInkVariety,
    headerSearchResults,
    totalItemsCount,
    cartRawSubtotal,
    inkMixingSetDiscount,
    cartSubtotalAfterBundle,
    promoDiscountKes,
    cartSubtotal,
    selectedLocation,
    deliveryFee,
    orderTotal,
    handleApplyPromoCode,
    handleSelectVariant,
    handleSelectNib,
    handleAddToCart,
    handleConfirmQuickBuy,
    handleAddInkShadeDirectly,
    isItemWishlisted,
    handleToggleWishlist,
    handleToggleInkShadeWishlist,
    handleRemoveWishlistItem,
    handleUpdateQuantity,
    handleAddBundleToCart,
    handleGoogleSignIn,
    handleMemberFormSignIn,
    handleSignOutAccount,
    handleReorderPastPurchase,
    handleToggleOrderTracking,
    handleUpdateOrderStatus,
    handlePlaceOrder,
    buildWhatsAppOrderText,
    buildWhatsAppOrderUrl,
    handleCopyWhatsAppOrder,
    persistProductToFirestore,
    handleMerchantUpdateProduct,
    handleMerchantAddProduct,
    handleMerchantDeleteProduct,
    handleMerchantResetCatalog,
    handleSyncAllProductsToFirestore,
    handleMerchantUpdateStoreSettings,
    handleSavePromoCode,
    handleTogglePromoCodeActive,
    handleDeletePromoCode,
    handleOpenNotifyMeModal,
    handleSubmitRestockAlert,
    handleToggleRestockAlertStatus,
    handleDeleteRestockAlert,
    handleSubmitProductReview,
    handleDeleteProductReview,
    handleQuickMemberSignInForReviews,
  };
}

export type Storefront = ReturnType<typeof useStorefrontState>;

const StorefrontContext = createContext<Storefront | null>(null);

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const value = useStorefrontState();
  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): Storefront {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used inside <StorefrontProvider>');
  return ctx;
}
