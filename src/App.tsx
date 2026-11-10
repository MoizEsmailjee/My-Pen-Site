/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outlet, Route, Routes } from 'react-router-dom';
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
import { SeriesPage } from './pages/SeriesPage';
import { SetBuilderPage } from './pages/SetBuilderPage';
import { WishlistPage } from './pages/WishlistPage';

/** Shared chrome around every page: header, footer, and the overlays any page can open. */
function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#171614]">
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

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="collection/:seriesId" element={<SeriesPage />} />
        <Route path="products/:productId" element={<ProductPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="set-builder" element={<SetBuilderPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
