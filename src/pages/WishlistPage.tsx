import { WishlistView } from '../components/WishlistView';
import { usePageTitle } from '../lib/usePageTitle';

export function WishlistPage() {
  usePageTitle('Wishlist');
  return (
    <div className="page py-10">
      <WishlistView />
    </div>
  );
}
