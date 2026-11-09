# Checkout, Promo Vouchers & Kenyan Logistics Plan

This plan details the architecture and user experience for **Category 1 (Checkout, Payments & Kenyan Logistics)** in **PENS R US — THE PEN SPECIALISTS**, introducing a **Firestore-backed Promo Code & VIP Voucher System** (with percentage and fixed KES discounts, minimum spend thresholds, and Merchant Admin active/expired toggles), a **WhatsApp Instant Order Concierge** at checkout that formats an itemized KES order summary while saving the order directly to **Firestore Order History**, and an atelier **Printable Tax Invoice & Courier Waybill** view.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions incorporate your confirmed selections from our planning questions:

- **Confirmed Scope — Category 1 Focus**: Prioritizing **Checkout, Promo Vouchers & Kenyan Logistics** first so shoppers and the Nairobi atelier have a complete promotional and order-settlement workflow before expanding into inventory analytics.
- **Confirmed WhatsApp Concierge Workflow**: Shoppers can choose **WhatsApp Concierge Checkout** alongside **M-Pesa Express** and **Cash on Delivery**. Submitting via WhatsApp automatically saves the order to Cloud Firestore (`/orders/{orderId}`) and Member Order History (`Processing` status with waybill tracking), and generates a pre-filled, itemized `wa.me` concierge message (with both a direct launch link and a 1-click copy fallback for iframe environments).
- **Confirmed Firestore Promo Codes & Admin Controls**: Promo codes are stored in Cloud Firestore (`/promo_codes/{promoId}`) and managed via a new **Promo Vouchers** tab in the **Merchant Admin Back Office**, supporting both **Percentage (`%`)** and **Fixed (`KES`)** discounts, **Minimum Spend (`KES`)** validation, and instant **Active / Expired** status toggles.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Promo Vouchers in Cart & Checkout**: Allows shoppers to apply promotional codes (such as `NAIROBI10` for 10% off or `COLLECTOR1000` for KES 1,000 off) inside the Shopping Bag drawer, with real-time validation against minimum order spend and active status, stacked cleanly alongside the Iroshizuku Ink Mixing Set bundle discount.
  2. **Merchant Admin Voucher Manager**: Adds a dedicated **Promo Vouchers** tab in the Merchant Admin where the store owner can create new promo codes, choose Percentage (`%`) or Fixed (`KES`) discount types, set minimum spend rules in `KES`, toggle codes between **Active** and **Paused/Expired**, and delete codes in real time via Cloud Firestore.
  3. **WhatsApp Instant Order Concierge**: Integrates a third settlement and dispatch confirmation option in the Checkout Drawer. When a shopper completes checkout via WhatsApp Concierge, the order is persisted to Cloud Firestore (`/orders/{orderId}`) so it appears in **Member Order History** with live 3-stage Order Tracking, while preparing a structured WhatsApp dispatch message containing the order number, tracking waybill, itemized pens/nibs/inks, applied discounts, Kenyan delivery county, and net KES total.
  4. **Atelier Tax Invoice & Waybill Slip**: Provides a clean printable receipt and courier waybill view on the Order Confirmation modal and inside Member Order History.
- **Target Audience / Persona**: Kenyan fountain pen collectors, corporate gift buyers in Nairobi and across all 47 counties, and the store administrator managing campaigns and dispatches.
- **Key Value**: Bridges high-touch Kenyan conversational commerce (WhatsApp concierge confirmation) with structured e-commerce accounting (Firestore order persistence, waybill tracking, and real-time promotional rules).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Applying a Promo Voucher in the Shopping Bag**:
     - Inside the Cart Drawer, beneath the line items, shoppers see a **Collector Promo / Voucher Code** input bar with quick-apply pills for active featured codes (or manual code entry).
     - Entering a code validates:
       - Whether the code exists and is marked `active: true`.
       - Whether the cart subtotal (after bundle adjustments) meets `minSpendKes`.
     - Valid codes display an emerald confirmation pill (`NAIROBI10 · -10% Applied`) and a dedicated `-KES X,XXX` discount row in the order summary ledger. If invalid or below minimum spend, a clear inline explanation is shown (e.g., *"Requires a minimum spend of KES 5,000"*).
  2. **Managing Vouchers in Merchant Admin**:
     - Opening **Merchant Admin** reveals a new **Promo Vouchers** tab alongside *Products & Prices*, *Customer Orders*, and *Store Settings*.
     - The admin can create a voucher by specifying:
       - **Code** (e.g., `PRERA15`, auto-uppercased)
       - **Discount Type** (`Percentage %` or `Fixed KES`)
       - **Discount Value** (e.g., `15`% or `KES 1,500`)
       - **Minimum Order Spend (`KES`)** (e.g., `KES 6,000`)
       - **Description / Campaign Label** (e.g., *Nairobi Collector Appreciation*)
     - Each voucher row includes a 1-click **Active / Expired** toggle switch and a delete button, syncing immediately to Cloud Firestore.
  3. **Checkout with WhatsApp Order Concierge**:
     - In the Checkout step of the Shopping Bag Drawer, the **Payment & Settlement Method** selector offers:
       - **M-Pesa Express (STK Push)**
       - **Cash / M-Pesa on Delivery**
       - **WhatsApp Order Concierge (Instant Atelier Dispatch)**
     - Clicking **Complete Order** records the order in Cloud Firestore (`/orders/{orderId}`) with a generated `PRU-XXXXXX` order number and `KE-NBO-XXXX` waybill code, transitions to the **Order Confirmation** screen, and presents a **Send Order to Nairobi Atelier on WhatsApp** action (`https://wa.me/254700000000?text=...`) plus a **Copy Formatted WhatsApp Summary** button.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Warm Japanese-Kenyan stationery atelier (*Washi Cream* surfaces, *Deep Urushi Ink* typography, *Prera Empress Teal* and *Iroshizuku Indigo* accents).
  - **Color Palette & Mood**:
    - Background Surface: `#FAF8F5` (`--background`) and elevated card surface `#F3EFE8`
    - Primary Brand Accent: `#0A2246` / `#163A5F` (Deep Indigo)
    - Promotional / Savings Accent: `#1D5B43` (Forest Emerald for active vouchers and WhatsApp concierge badges) and `#B58435` (Warm Brass for minimum-spend notices)
    - Border Hairlines: `1px solid #E6E1D8`
  - **Typography & Hierarchy**:
    - Headings: `'Cormorant Garamond', serif` (`font-serif-display`)
    - UI & Controls: `'Plus Jakarta Sans', sans-serif`
    - Prices, Voucher Codes, Waybills & Percentages: `'JetBrains Mono', monospace` (`font-mono-tabular` with `tabular-nums`)
  - **Interactive Feedback & Motion**:
    - Instant inline validation feedback when applying or removing a voucher code.
    - Live recalculation of the Cart Ledger whenever item quantities change (automatically re-checking `minSpendKes` eligibility).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Stacking Order for Bundle Discounts & Promo Codes**
  - *Chosen Approach*: The **Iroshizuku Ink Mixing Set** bundle discount (`-KES 2,500` per 3 distinct shades) is calculated first on qualifying ink trios, and the **Promo Voucher** (percentage or fixed KES) is applied to the resulting subtotal (capped so the net merchandise total never drops below `KES 0`), before adding any regional courier fee.
  - *Why*: Ensures transparent, predictable math on the checkout ledger and prevents negative subtotals on fixed-amount vouchers.
  - *Alternatives Considered*: Preventing promo codes when a bundle is in the cart was rejected because collectors buying a pen alongside an Ink Mixing Set expect their VIP code to work.

- **Decision 2: Iframe-Safe WhatsApp Concierge + Firestore Persistence**
  - *Chosen Approach*: Persist the order to Cloud Firestore (`/orders/{orderId}`) **before** triggering the WhatsApp handover, and provide both a standard `<a href="https://wa.me/..." target="_blank" rel="noopener noreferrer">` anchor and a 1-click **Copy Order Message** button on the confirmation screen.
  - *Why*: Calling `window.open()` programmatically is blocked inside preview iframes and strict mobile browsers. Recording the order in Firestore first guarantees zero lost orders and full visibility in **Member Order History** and **Merchant Admin**, while the native `<a target="_blank">` link and clipboard copy work across every device.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD FIRESTORE DATABASE                            │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ /promo_codes/{code}  │  │   /orders/{orderId}  │  │ /store_settings  │  │
│  │ (type, value, minKES,│  │ (items, promoCode,   │  │ (bundleKes,      │  │
│  │  active, label)      │  │  discountKes, method)│  │  whatsappPhone)  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼─────────────────────────┼───────────────────────┼────────────┘
              │ onSnapshot / setDoc     │ addDoc / onSnapshot   │
              ▼                         ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     STOREFRONT STATE CONTROLLER (App)                      │
│  • promoCodes[] (seeded defaults + real-time Firestore sync)               │
│  • appliedPromoCode (live validation against subtotal & minSpendKes)       │
│  • cartLedger (rawSubtotal -> bundleDiscount -> promoDiscount -> delivery) │
└──────┬─────────────────────────────────┬────────────────────────────┬──────┘
       │                                 │                            │
       ▼                                 ▼                            ▼
┌──────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────┐
│   CART & CHECKOUT DRAWER │  │ ORDER CONFIRMATION &    │  │ MERCHANT ADMIN  │
│ • Voucher Input & Badges │  │ MEMBER ORDER HISTORY    │  │ CONSOLE         │
│ • M-Pesa / COD /         │  │ • WhatsApp Dispatch CTA │  │ • Promo Voucher │
│   WhatsApp Selector      │  │ • Copyable KES Summary  │  │   CRUD & Active │
│ • Itemized KES Breakdown │  │ • Printable Tax Invoice │  │   Status Toggle │
└──────────────────────────┘  └─────────────────────────┘  └─────────────────┘
```

- **Data Model & State**:
  - **`PromoCodeRecord` (`/promo_codes/{promoId}`)**:
    - `id`: string (uppercase code, e.g., `'NAIROBI10'`, `'COLLECTOR1000'`)
    - `code`: string
    - `discountType`: `'percentage' | 'fixed'`
    - `discountValue`: number (e.g., `10` for 10%, or `1000` for KES 1,000)
    - `minSpendKes`: number (e.g., `3000` or `10000`)
    - `description`: string (e.g., `'10% Off Orders Above KES 5,000'`)
    - `active`: boolean (toggled in Merchant Admin)
    - `updatedAt`: number
  - **Extended `OrderConfirmation` (`/orders/{orderId}`)**:
    - Adds `paymentMethod: 'mpesa' | 'cod' | 'whatsapp'`
    - Adds optional `promoCode?: string`, `promoDiscountKes?: number`, and `bundleDiscountKes?: number` so both the Member Order History and Merchant Admin display the exact promotional breakdown.

- **Interactive Component & State Mapping**:
  - **Cart Voucher Box**: Controlled input (`promoInput`), `handleApplyPromoCode()` handler that checks `promoCodes` for a matching code, verifies `promo.active === true` and `subtotalAfterBundle >= promo.minSpendKes`, sets `appliedPromoCode`, or surfaces a descriptive validation message; plus `handleRemovePromoCode()` to clear it.
  - **Cart & Checkout Ledger**: Dynamically re-evaluates `appliedPromoCode` if item removal drops the cart below `minSpendKes`, automatically notifying the shopper.
  - **WhatsApp Concierge Generator**: Builds a URL-encoded multi-line receipt string with order number, waybill code, itemized quantities and nib grades, bundle/promo savings, delivery location, and total KES payable, bound to a native external link and clipboard copy button.
  - **Merchant Admin Promo Tab**: Form to create/update `PromoCodeRecord` entries, 1-click toggle button for `active` (`true`/`false`), and delete action—persisting to `localStorage` immediately and writing to Firestore `/promo_codes/{id}` when authenticated as admin.
  - **Firestore Security Rules**: Updates `firebase-blueprint.json`, `security_spec.md`, and `firestore.rules` to allow public read access on `/promo_codes/{promoId}` (so shoppers can validate codes) and admin write access, plus allows `'whatsapp'` as a valid `paymentMethod` in `/orders/{orderId}`.
