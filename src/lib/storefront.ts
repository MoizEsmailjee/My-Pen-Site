import { NibOption, Product, ProductVariant } from '../data/products';
import { ProductReviewRecord } from '../islands/CustomerReviewsIsland';
import { PromoCodeRecord, RestockAlertRecord } from '../islands/MerchantAdminIsland';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  nibSize?: NibOption;
  quantity: number;
}

export interface WishlistItem {
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

export const BRAND_LOGO_SRC =
  '/assets/aistudio/Gemini_Generated_Image_644qn3644qn3644q_cd72faa3.jpg';
export const WISHLIST_STORAGE_KEY = 'pens_r_us_wishlist_v1';
export const ORDERS_STORAGE_KEY = 'pens_r_us_orders_v1';
export const MEMBER_SESSION_STORAGE_KEY = 'pens_r_us_member_session_v1';
export const CATALOG_STORAGE_KEY = 'pens_r_us_catalog_v4';
export const STORE_SETTINGS_STORAGE_KEY = 'pens_r_us_store_settings_v2';
export const PROMO_CODES_STORAGE_KEY = 'pens_r_us_promo_codes_v1';
export const REVIEWS_STORAGE_KEY = 'pens_r_us_reviews_v1';
export const RESTOCK_ALERTS_STORAGE_KEY = 'pens_r_us_restock_alerts_v1';
export const AUTHORIZED_ADMIN_EMAIL = 'ananyapoudel641@gmail.com';

export const DEFAULT_SEED_RESTOCK_ALERTS: RestockAlertRecord[] = [
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

export const DEFAULT_PROMO_CODES: PromoCodeRecord[] = [
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

export const DEFAULT_SEED_REVIEWS: ProductReviewRecord[] = [
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

export interface MemberProfile {
  uid: string;
  name: string;
  emailOrPhone: string;
  authMode: 'google' | 'member';
}

export type OrderStatus = 'Processing' | 'Out for Courier' | 'Delivered';

export const ORDER_TRACKING_STAGES: {
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

export interface OrderConfirmation {
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

export const KENYA_LOCATIONS = [
  { city: 'Nairobi (CBD, Westlands, Kilimani, Karen)', fee: 0, eta: 'Same-Day Courier (2–4 hrs)' },
  { city: 'Kiambu / Thika / Machakos / Ngong', fee: 250, eta: 'Next Morning Delivery' },
  { city: 'Mombasa / Diani / Nyali', fee: 450, eta: 'Next-Day Overnight Courier' },
  { city: 'Kisumu / Nakuru / Eldoret / Nanyuki', fee: 400, eta: 'Next-Day Fargo / G4S Courier' },
];

export const INK_COLOR_FAMILIES = [
  'All 24 Shades',
  'Blues & Teals',
  'Reds, Pinks & Purples',
  'Greens & Golds',
  'Blacks, Greys & Browns',
] as const;

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

