/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { ScrollManager } from './components/ScrollManager';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { MerchantAdminHost } from './components/overlays/MerchantAdminHost';
import { NotifyMeModal } from './components/overlays/NotifyMeModal';
import { QuickBuyHost } from './components/overlays/QuickBuyHost';
import { ZoomLightbox } from './components/overlays/ZoomLightbox';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { SERIES_PRODUCT_IDS, isSeriesId, productPath } from './lib/routes';
import { SetBuilderPage } from './pages/SetBuilderPage';
import { WishlistPage } from './pages/WishlistPage';

/** Shared chrome around every page: header, footer, and the overlays any page can open. */
function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <SiteHeader />
      <main id="top" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />

      <MerchantAdminHost />
      <NotifyMeModal />
      <QuickBuyHost />
      <CartDrawer />
      <ZoomLightbox />
    </div>
  );
}

/** Old per-series URLs keep working by forwarding to the matching product page. */
function SeriesRedirect() {
  const { seriesId } = useParams();
  return isSeriesId(seriesId) ? (
    <Navigate to={productPath(SERIES_PRODUCT_IDS[seriesId])} replace />
  ) : (
    <NotFoundPage />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="collection/:seriesId" element={<SeriesRedirect />} />
        <Route path="products/:productId" element={<ProductPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="set-builder" element={<SetBuilderPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
