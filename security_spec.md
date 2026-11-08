# PENS R US — Firestore Security Specification

## 1. Access Control & Ownership Model
- **Default Deny**: All paths not explicitly matched are denied read and write access.
- **Collection `/orders/{orderId}`**:
  - **Read (`get`, `list`)**: Strictly restricted to authenticated users where `resource.data.userId == request.auth.uid`.
  - **Create (`create`)**: Strictly restricted to authenticated users where `request.resource.data.userId == request.auth.uid` and `isValidOrder(request.resource.data)` holds true.
  - **Update (`update`)**: Strictly restricted to the owner (`resource.data.userId == request.auth.uid`), validating schema (including `orderStatus` transitions across `'Processing'`, `'Out for Courier'`, and `'Delivered'`) and enforcing immutability of `userId`, `orderNumber`, and `createdAt`.
  - **Delete (`delete`)**: Strictly restricted to the owner (`resource.data.userId == request.auth.uid`).

## 2. Schema & Data Validation Constraints
- `hasOnlyAllowedFields`: Only expected order and tracking fields (`orderStatus`, `trackingCode`, `estimatedDelivery`) are permitted.
- `orderStatus` (when present) must be one of `['Processing', 'Out for Courier', 'Delivered']`.
- String lengths are strictly bounded (`orderNumber <= 32`, `trackingCode <= 64`, `estimatedDelivery <= 160`, `customerName <= 120`, `phone <= 40`, `city <= 120`, `address <= 300`, `timestamp <= 80`).
- Numeric values (`subtotal`, `deliveryFee`, `total`, `createdAt`) must be non-negative numbers.
- `items` must be a list with between 1 and 50 line items.
