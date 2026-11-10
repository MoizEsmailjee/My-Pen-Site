import { MerchantAdminIsland } from '../../islands/MerchantAdminIsland';
import { useStorefront } from '../../store/StorefrontContext';

export function MerchantAdminHost() {
  const {
    catalogProducts,
    storeSettings,
    promoCodes,
    isMerchantAdminOpen,
    setIsMerchantAdminOpen,
    cloudSyncStatus,
    allRestockAlerts,
    firebaseUser,
    isAuthorizedAdmin,
    isSigningIn,
    localOrders,
    userOrderHistory,
    handleGoogleSignIn,
    handleSignOutAccount,
    handleUpdateOrderStatus,
    handleMerchantUpdateProduct,
    handleMerchantAddProduct,
    handleMerchantDeleteProduct,
    handleMerchantResetCatalog,
    handleSyncAllProductsToFirestore,
    handleMerchantUpdateStoreSettings,
    handleSavePromoCode,
    handleTogglePromoCodeActive,
    handleDeletePromoCode,
    handleToggleRestockAlertStatus,
    handleDeleteRestockAlert,
  } = useStorefront();
  return (
    <>
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
        orders={(userOrderHistory.length > 0 ? userOrderHistory : localOrders).map(
          (ord) => ({
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
            total: ord.total,
            timestamp: ord.timestamp,
            itemsCount: ord.items.reduce((acc, i) => acc + i.quantity, 0),
            items: ord.items.map((i) => ({
              productName: i.product.name,
              variantLabel: i.variant.label,
              nibSize: i.nibSize,
              quantity: i.quantity,
              priceKes: i.product.priceKes,
            })),
          })
        )}
        onUpdateOrderStatusByNumber={(orderNumber, nextStatus) => {
          const target =
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
    </>
  );
}
