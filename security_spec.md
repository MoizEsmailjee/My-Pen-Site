# PENS R US — Firestore Security Specification

## 1. Access Control & Ownership Model
- **Default Deny**: All paths not explicitly matched are denied read and write access.
- **Bootstrapped Merchant Admin (`isAdmin()`)**:
  - Verified admin account (`request.auth.token.email == "ananyapoudel641@gmail.com" && request.auth.token.email_verified == true`) or document presence in `/admins/$(request.auth.uid)`.
- **Collection `/orders/{orderId}`**:
  - **Read (`get`, `list`)**: Strictly restricted to the order owner (`resource.data.userId == request.auth.uid`) or `isAdmin()`.
  - **Create (`create`)**: Strictly restricted to authenticated users where `request.resource.data.userId == request.auth.uid` and `isValidOrder(request.resource.data)` holds true (`paymentMethod` in `['mpesa', 'cod', 'whatsapp']`, plus optional `promoCode`, `promoDiscountKes`, and `bundleDiscountKes`).
  - **Update (`update`)**: Strictly restricted to the owner (`resource.data.userId == request.auth.uid`) or `isAdmin()`, validating schema and enforcing immutability of `userId`, `orderNumber`, and `createdAt`.
  - **Delete (`delete`)**: Strictly restricted to the owner or `isAdmin()`.
- **Collection `/products/{productId}`**:
  - **Read (`get`, `list`)**: Public read access so storefront visitors can view live product prices (`priceKes`), finishes, and per-variant stock availability (`stockCount`).
  - **Write (`create`, `update`, `delete`)**: Restricted to authenticated merchant admin (`isAdmin()`) with strict schema validation (`isValidProduct`).
- **Collection `/store_settings/{settingId}`**:
  - **Read (`get`, `list`)**: Public read access for bundle pricing, delivery thresholds, and WhatsApp concierge phone number.
  - **Write (`create`, `update`)**: Restricted to `isAdmin()` with strict validation.
- **Collection `/promo_codes/{promoId}`**:
  - **Read (`get`, `list`)**: Public read access so shoppers can validate promo codes and minimum spend requirements in the Cart Drawer.
  - **Write (`create`, `update`, `delete`)**: Restricted to `isAdmin()` with strict schema validation (`isValidPromoCode`).
- **Collection `/reviews/{reviewId}`**:
  - **Read (`get`, `list`)**: Public read access so all shoppers can read customer star ratings and reviews for each product.
  - **Create (`create`)**: Restricted to authenticated users where `request.resource.data.userId == request.auth.uid` and `isValidReview(request.resource.data)` holds (`rating` 1..5, bounded strings).
  - **Update / Delete (`update`, `delete`)**: Restricted to the review author (`resource.data.userId == request.auth.uid`) or `isAdmin()`, with immutable `userId`, `productId`, and `createdAt`.
