import { QuickBuyModalIsland } from '../../islands/QuickBuyModalIsland';
import { useStorefront } from '../../store/StorefrontContext';

export function QuickBuyHost() {
  const {
    selectedVariants,
    selectedNibs,
    quickBuyProduct,
    setQuickBuyProduct,
    handleSelectVariant,
    handleSelectNib,
    handleConfirmQuickBuy,
    isItemWishlisted,
    handleToggleWishlist,
  } = useStorefront();
  return (
    <>
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
    </>
  );
}
