import { CollectionShell } from '../components/CollectionShell';
import { WishlistView } from '../components/WishlistView';
import { usePageTitle } from '../lib/usePageTitle';

export function WishlistPage() {
  usePageTitle('Saved wishlist');
  return (
    <CollectionShell>
      <WishlistView />
    </CollectionShell>
  );
}
